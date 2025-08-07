#!/usr/bin/env python3
"""
Test script for CSV Question Import API
This script demonstrates how to import questions via CSV using base64 encoding
"""

import base64
import json
import requests

# Sample CSV data (minimal format)
csv_data = """content,type,difficulty,question_code_id,source,answers,correct_answer,solution,tags
"What is the capital of Japan?",MC,EASY,6E2B1E1,"Geography Test","[{""id"":""A"",""text"":""Tokyo""},{""id"":""B"",""text"":""Osaka""},{""id"":""C"",""text"":""Kyoto""},{""id"":""D"",""text"":""Hiroshima""}]","{""id"":""A"",""text"":""Tokyo""}","Tokyo is the capital of Japan.","geography;asia;capitals"
"Python is a programming language.",TF,EASY,8S4D1E1,"Computer Science","[{""id"":""T"",""text"":""True""},{""id"":""F"",""text"":""False""}]","{""id"":""T"",""text"":""True""}","Python is indeed a popular programming language.","programming;computer-science;languages"
"What is 5 * 6?",MC,EASY,6M1A1E1,"Math Quiz","[{""id"":""A"",""text"":""25""},{""id"":""B"",""text"":""30""},{""id"":""C"",""text"":""35""},{""id"":""D"",""text"":""40""}]","{""id"":""B"",""text"":""30""}","5 multiplied by 6 equals 30.","mathematics;multiplication;basic"
"""

def test_csv_import():
    """Test the CSV import API"""
    
    # Encode CSV data to base64
    csv_base64 = base64.b64encode(csv_data.encode('utf-8')).decode('utf-8')
    
    # Prepare request payload
    payload = {
        "csv_data_base64": csv_base64,
        "upsert_mode": False,  # Create new questions
        "creator": "test@example.com"
    }
    
    # API endpoint
    url = "http://localhost:8080/api/questions/import"
    
    # Headers
    headers = {
        "Content-Type": "application/json"
    }
    
    print("🚀 Testing CSV Import API...")
    print(f"📡 Endpoint: {url}")
    print(f"📊 CSV Data Preview:")
    print(csv_data[:200] + "..." if len(csv_data) > 200 else csv_data)
    print(f"📦 Payload size: {len(json.dumps(payload))} bytes")
    print()
    
    try:
        # Send request
        print("📤 Sending request...")
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        # Check response
        print(f"📥 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        print()
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Import Successful!")
            print(f"📊 Results:")
            print(f"   - Total Processed: {result.get('total_processed', 0)}")
            print(f"   - Created: {result.get('created_count', 0)}")
            print(f"   - Updated: {result.get('updated_count', 0)}")
            print(f"   - Errors: {result.get('error_count', 0)}")
            print(f"   - Summary: {result.get('summary', 'N/A')}")
            
            if result.get('errors'):
                print(f"❌ Errors found:")
                for error in result['errors']:
                    print(f"   - Row {error.get('row_number', 'N/A')}: {error.get('error_message', 'N/A')}")
            
        else:
            print(f"❌ Import Failed!")
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error!")
        print("Make sure the backend server is running on http://localhost:8080")
        print("Start the server with: go run cmd/main.go")
        
    except requests.exceptions.Timeout:
        print("❌ Request Timeout!")
        print("The server took too long to respond")
        
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")

def test_with_sample_file():
    """Test with the sample CSV file"""
    try:
        # Read the sample CSV file
        with open('../docs/sample_questions.csv', 'r', encoding='utf-8') as f:
            csv_content = f.read()
        
        # Encode to base64
        csv_base64 = base64.b64encode(csv_content.encode('utf-8')).decode('utf-8')
        
        # Prepare request
        payload = {
            "csv_data_base64": csv_base64,
            "upsert_mode": True,  # Update existing questions
            "creator": "admin@exambank.com"
        }
        
        url = "http://localhost:8080/api/questions/import"
        headers = {"Content-Type": "application/json"}
        
        print("🚀 Testing with sample_questions.csv...")
        print(f"📁 File size: {len(csv_content)} characters")
        print()
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Sample File Import Successful!")
            print(f"📊 Results: {result.get('summary', 'N/A')}")
        else:
            print(f"❌ Sample File Import Failed: {response.text}")
            
    except FileNotFoundError:
        print("❌ Sample file not found: ../docs/sample_questions.csv")
    except Exception as e:
        print(f"❌ Error reading sample file: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 CSV Question Import API Test")
    print("=" * 60)
    print()
    
    # Test 1: Simple CSV data
    test_csv_import()
    print()
    print("-" * 60)
    print()
    
    # Test 2: Sample file
    test_with_sample_file()
    print()
    print("=" * 60)
    print("✅ Testing completed!")
    print("📖 Check the documentation at: docs/question_import_csv_format.md")
    print("=" * 60)
