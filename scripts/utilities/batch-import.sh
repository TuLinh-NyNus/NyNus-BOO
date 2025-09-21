#!/bin/bash

# Batch Import Script for question_new_fixed.csv

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
BASE_URL="http://localhost:8080"
API_BASE="${BASE_URL}/api/v1"
CSV_FILE="docs/question_new_fixed.csv"
BATCH_SIZE=500  # Questions per batch
BATCH_DIR="/tmp/import_batches"

print_status "🚀 Starting BATCH IMPORT of question_new_fixed.csv"

# Check if file exists
if [ ! -f "$CSV_FILE" ]; then
    print_error "CSV file not found: $CSV_FILE"
    exit 1
fi

line_count=$(wc -l < "$CSV_FILE")
question_count=$((line_count - 1))
batch_count=$(((question_count + BATCH_SIZE - 1) / BATCH_SIZE))

print_status "📊 Batch Import Details:"
print_status "  - Total questions: $question_count"
print_status "  - Batch size: $BATCH_SIZE questions"
print_status "  - Number of batches: $batch_count"

# Health check
print_status "1. Health check..."
health_response=$(curl -s "${BASE_URL}/health")
if [[ "$health_response" == *"healthy"* ]]; then
    print_success "✅ Server is healthy"
else
    print_error "❌ Server health check failed"
    exit 1
fi

# Create batch directory
rm -rf "$BATCH_DIR"
mkdir -p "$BATCH_DIR"

# Split file into batches
print_status "2. Splitting file into batches..."
header=$(head -1 "$CSV_FILE")

# Split data lines (skip header)
tail -n +2 "$CSV_FILE" | split -l $BATCH_SIZE - "$BATCH_DIR/batch_"

# Add header to each batch
batch_files=()
for batch_file in "$BATCH_DIR"/batch_*; do
    if [ -f "$batch_file" ]; then
        temp_file="${batch_file}.csv"
        echo "$header" > "$temp_file"
        cat "$batch_file" >> "$temp_file"
        rm "$batch_file"
        batch_files+=("$temp_file")
    fi
done

print_status "  - Created ${#batch_files[@]} batch files"

# Import each batch
total_processed=0
total_created=0
total_updated=0
total_errors=0
start_time=$(date +%s)

for i in "${!batch_files[@]}"; do
    batch_file="${batch_files[$i]}"
    batch_num=$((i + 1))
    
    print_status "3.$batch_num Importing batch $batch_num/${#batch_files[@]}..."
    
    batch_lines=$(wc -l < "$batch_file")
    batch_questions=$((batch_lines - 1))
    
    print_status "  - Batch file: $(basename "$batch_file")"
    print_status "  - Questions in batch: $batch_questions"
    
    # Encode batch
    CSV_BASE64=$(base64 -w 0 < "$batch_file")
    
    # Create payload
    PAYLOAD_FILE="/tmp/batch_payload_$batch_num.json"
    cat > "$PAYLOAD_FILE" <<EOF
{
  "csv_data_base64": "$CSV_BASE64",
  "upsert_mode": true
}
EOF
    
    # Send import request
    batch_start=$(date +%s)
    response=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -d @"$PAYLOAD_FILE" \
      "${API_BASE}/questions/import")
    batch_end=$(date +%s)
    batch_duration=$((batch_end - batch_start))
    
    # Clean up
    rm -f "$PAYLOAD_FILE"
    
    # Parse response
    if echo "$response" | grep -q "totalProcessed"; then
        processed=$(echo "$response" | jq -r '.totalProcessed // 0' 2>/dev/null)
        created=$(echo "$response" | jq -r '.createdCount // 0' 2>/dev/null)
        updated=$(echo "$response" | jq -r '.updatedCount // 0' 2>/dev/null)
        errors=$(echo "$response" | jq -r '.errorCount // 0' 2>/dev/null)
        
        total_processed=$((total_processed + processed))
        total_created=$((total_created + created))
        total_updated=$((total_updated + updated))
        total_errors=$((total_errors + errors))
        
        if [ "$errors" -eq 0 ]; then
            print_success "  ✅ Batch $batch_num: $processed processed, $created created (${batch_duration}s)"
        else
            print_warning "  ⚠️ Batch $batch_num: $processed processed, $created created, $errors errors (${batch_duration}s)"
            echo "$response" | jq -r '.errors[]? | "    Row \(.rowNumber): \(.errorMessage)"' 2>/dev/null | head -3
        fi
    else
        print_error "  ❌ Batch $batch_num failed: $response"
        total_errors=$((total_errors + batch_questions))
    fi
    
    # Progress update
    progress=$(echo "scale=1; $batch_num * 100 / ${#batch_files[@]}" | bc)
    print_status "  📊 Progress: $progress% ($batch_num/${#batch_files[@]} batches)"
    
    # Small delay between batches
    sleep 1
done

end_time=$(date +%s)
total_duration=$((end_time - start_time))

# Clean up batch files
rm -rf "$BATCH_DIR"

print_status "4. Final Results:"
print_status "📊 Import Summary:"
print_status "  - Total time: ${total_duration}s"
print_status "  - Total processed: $total_processed"
print_status "  - Total created: $total_created"
print_status "  - Total updated: $total_updated"
print_status "  - Total errors: $total_errors"

if [ "$total_errors" -eq 0 ]; then
    print_success "🎉 ALL BATCHES IMPORTED SUCCESSFULLY!"
else
    print_warning "⚠️ Import completed with $total_errors total errors"
fi

# Get final database stats
print_status "5. Final database stats..."
final_questions=$(PGPASSWORD=exam_bank_password psql -h localhost -p 5439 -U exam_bank_user -d exam_bank_db -t -c "SELECT COUNT(*) FROM question;" 2>/dev/null | tr -d ' ')
final_codes=$(PGPASSWORD=exam_bank_password psql -h localhost -p 5439 -U exam_bank_user -d exam_bank_db -t -c "SELECT COUNT(*) FROM questioncode;" 2>/dev/null | tr -d ' ')

print_status "  - Total questions in database: $final_questions"
print_status "  - Total question codes in database: $final_codes"

# Show sample of latest imported questions
print_status "6. Sample of latest imported questions:"
PGPASSWORD=exam_bank_password psql -h localhost -p 5439 -U exam_bank_user -d exam_bank_db -c "SELECT id, LEFT(content, 80) as content_preview, type, questioncodeid FROM question ORDER BY created_at DESC LIMIT 5;" 2>/dev/null

success_rate=$(echo "scale=1; $total_created * 100 / $total_processed" | bc)
print_success "✅ BATCH IMPORT COMPLETED!"
print_status "📈 Final Summary:"
print_status "  - Questions imported: $total_created"
print_status "  - Success rate: $success_rate%"
print_status "  - Average time per question: $(echo "scale=2; $total_duration / $total_processed" | bc)s"

echo ""
print_status "🏁 Batch import process completed"
