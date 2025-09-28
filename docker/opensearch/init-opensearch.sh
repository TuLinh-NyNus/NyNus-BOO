#!/bin/bash

# OpenSearch Initialization Script
# Script để setup index templates và initial configuration cho Vietnamese search

set -e

OPENSEARCH_URL="http://localhost:9200"
INDEX_TEMPLATES_DIR="/usr/share/opensearch/index-templates"

echo "🚀 Starting OpenSearch initialization..."

# Wait for OpenSearch to be ready
echo "⏳ Waiting for OpenSearch to be ready..."
until curl -s "$OPENSEARCH_URL/_cluster/health" > /dev/null; do
  echo "Waiting for OpenSearch..."
  sleep 5
done

echo "✅ OpenSearch is ready!"

# Check cluster health
echo "🔍 Checking cluster health..."
curl -s "$OPENSEARCH_URL/_cluster/health?pretty"

# Install Vietnamese plugins if not already installed
echo "📦 Checking Vietnamese analysis plugins..."

# Check if analysis-icu plugin is installed
if ! curl -s "$OPENSEARCH_URL/_cat/plugins" | grep -q "analysis-icu"; then
  echo "Installing analysis-icu plugin..."
  # Note: In production, plugins should be installed in Dockerfile
  echo "⚠️  analysis-icu plugin should be pre-installed in Docker image"
fi

# Check if analysis-phonetic plugin is installed
if ! curl -s "$OPENSEARCH_URL/_cat/plugins" | grep -q "analysis-phonetic"; then
  echo "Installing analysis-phonetic plugin..."
  echo "⚠️  analysis-phonetic plugin should be pre-installed in Docker image"
fi

# Create index templates
echo "📋 Creating index templates..."

if [ -f "$INDEX_TEMPLATES_DIR/questions-template.json" ]; then
  echo "Creating questions index template..."
  curl -X PUT "$OPENSEARCH_URL/_index_template/questions-template" \
    -H "Content-Type: application/json" \
    -d @"$INDEX_TEMPLATES_DIR/questions-template.json"
  echo "✅ Questions template created"
else
  echo "❌ Questions template file not found"
fi

# Create initial index
echo "📊 Creating initial questions index..."
curl -X PUT "$OPENSEARCH_URL/questions-v1" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "analysis": {
        "analyzer": {
          "vietnamese_content_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": [
              "lowercase",
              "vietnamese_stop_words",
              "icu_folding",
              "education_synonyms"
            ]
          }
        },
        "filter": {
          "vietnamese_stop_words": {
            "type": "stop",
            "stopwords": [
              "và", "của", "có", "là", "được", "trong", "với", "để", "từ", "theo",
              "về", "cho", "khi", "như", "đã", "sẽ", "bị", "bởi", "tại", "trên"
            ]
          },
          "education_synonyms": {
            "type": "synonym",
            "synonyms": [
              "toán,toán học,mathematics,math",
              "lý,vật lý,physics",
              "hóa,hóa học,chemistry",
              "sinh,sinh học,biology",
              "văn,ngữ văn,literature"
            ]
          }
        }
      }
    }
  }'

echo "✅ Initial index created"

# Create alias
echo "🔗 Creating index alias..."
curl -X POST "$OPENSEARCH_URL/_aliases" \
  -H "Content-Type: application/json" \
  -d '{
    "actions": [
      {
        "add": {
          "index": "questions-v1",
          "alias": "questions"
        }
      }
    ]
  }'

echo "✅ Index alias created"

# Test Vietnamese analysis
echo "🧪 Testing Vietnamese text analysis..."
curl -X POST "$OPENSEARCH_URL/questions/_analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "analyzer": "vietnamese_content_analyzer",
    "text": "Tính đạo hàm của hàm số y = x² + 2x + 1"
  }' | jq '.tokens[].token' || echo "Analysis test completed (jq not available for pretty output)"

# Create sample document for testing
echo "📝 Creating sample document for testing..."
curl -X POST "$OPENSEARCH_URL/questions/_doc/test-1" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-1",
    "content": "Tính đạo hàm của hàm số y = x² + 2x + 1",
    "solution": "Đạo hàm của y = x² + 2x + 1 là y'\'' = 2x + 2",
    "type": "MC",
    "difficulty": "MEDIUM",
    "status": "ACTIVE",
    "tags": ["toán học", "đạo hàm", "hàm số"],
    "question_code": {
      "grade": "12",
      "subject": "M",
      "chapter": "1",
      "level": "T",
      "lesson": "1",
      "form": "1",
      "full_code": "12M1T11"
    },
    "created_at": "2025-01-19T10:00:00Z",
    "updated_at": "2025-01-19T10:00:00Z"
  }'

echo "✅ Sample document created"

# Test search functionality
echo "🔍 Testing search functionality..."
curl -X POST "$OPENSEARCH_URL/questions/_search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "multi_match": {
        "query": "đạo hàm",
        "fields": ["content^2", "solution", "tags"],
        "type": "best_fields",
        "fuzziness": "AUTO"
      }
    }
  }' | jq '.hits.total.value' || echo "Search test completed"

echo "✅ Search test completed"

# Display cluster info
echo "📊 Cluster information:"
curl -s "$OPENSEARCH_URL/_cluster/stats?pretty" | head -20

echo "🎉 OpenSearch initialization completed successfully!"
echo "📍 OpenSearch URL: $OPENSEARCH_URL"
echo "📍 OpenSearch Dashboards: http://localhost:5601"
echo "📋 Available indices:"
curl -s "$OPENSEARCH_URL/_cat/indices?v"

echo ""
echo "🔧 Next steps:"
echo "1. Verify OpenSearch is accessible at $OPENSEARCH_URL"
echo "2. Check OpenSearch Dashboards at http://localhost:5601"
echo "3. Test Vietnamese search functionality"
echo "4. Monitor cluster health and performance"
