#!/usr/bin/env python3
"""
Example API Testing Script for Exam Bank System

This script demonstrates how to test all QuestionFilterService APIs
with comprehensive test cases and performance monitoring.

Usage:
    python3 test_apis_example.py

Prerequisites:
    - Backend server running on localhost:8080
    - Sample data imported (docs/question_new_fixed.csv)
    - Python 3.6+ with requests library
"""

import requests
import json
import time
from typing import Dict, Any, Optional

class ExamBankAPITester:
    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url
        self.token: Optional[str] = None
        
    def login(self, email: str = "admin@exambank.com", password: str = "admin123") -> bool:
        """Login and get JWT token"""
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/auth/login",
                json={"email": email, "password": password},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('accessToken')
                print(f"✅ Login successful for {email}")
                return True
            else:
                print(f"❌ Login failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    def _make_request(self, method: str, endpoint: str, data: Dict[Any, Any]) -> Dict[Any, Any]:
        """Make authenticated API request"""
        if not self.token:
            raise Exception("Not authenticated. Call login() first.")
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        start_time = time.time()
        response = requests.request(
            method, 
            f"{self.base_url}{endpoint}", 
            json=data, 
            headers=headers,
            timeout=30
        )
        duration = time.time() - start_time
        
        if response.status_code == 200:
            return {
                "success": True,
                "data": response.json(),
                "duration": duration
            }
        else:
            return {
                "success": False,
                "error": response.text,
                "status_code": response.status_code,
                "duration": duration
            }
    
    def test_filter_api(self):
        """Test ListQuestionsByFilter API"""
        print("\n🧪 TESTING FILTER API")
        print("=" * 60)
        
        test_cases = [
            {
                "name": "All Questions (No Filter)",
                "payload": {"pagination": {"page": 1, "limit": 10}}
            },
            {
                "name": "Grade 0 (Lớp 10)",
                "payload": {
                    "question_code_filter": {"grades": ["0"]},
                    "pagination": {"page": 1, "limit": 5}
                }
            },
            {
                "name": "Subject D (Probability)",
                "payload": {
                    "question_code_filter": {"subjects": ["D"]},
                    "pagination": {"page": 1, "limit": 5}
                }
            },
            {
                "name": "Type MC (Multiple Choice)",
                "payload": {
                    "metadata_filter": {"types": ["MC"]},
                    "pagination": {"page": 1, "limit": 5}
                }
            },
            {
                "name": "Complex: Grade 0 + Subject D + Type MC",
                "payload": {
                    "question_code_filter": {"grades": ["0"], "subjects": ["D"]},
                    "metadata_filter": {"types": ["MC"]},
                    "pagination": {"page": 1, "limit": 5}
                }
            }
        ]
        
        for i, test in enumerate(test_cases, 1):
            print(f"\n{i}️⃣ {test['name']}")
            print("-" * 50)
            
            result = self._make_request("POST", "/api/v1/questions/filter", test['payload'])
            
            if result['success']:
                data = result['data']
                print(f"✅ Success ({result['duration']:.3f}s)")
                print(f"   📊 Total Count: {data.get('total_count', 0):,}")
                print(f"   📄 Current Page: {data.get('current_page', 0)}")
                print(f"   📚 Total Pages: {data.get('total_pages', 0)}")
                print(f"   📝 Questions Returned: {len(data.get('questions', []))}")
                
                # Show sample question
                questions = data.get('questions', [])
                if questions:
                    q = questions[0]
                    content = q.get('content', '')[:80] + '...' if len(q.get('content', '')) > 80 else q.get('content', '')
                    print(f"   🔍 Sample Question:")
                    print(f"      - Code: {q.get('questionCodeId', 'N/A')}")
                    print(f"      - Type: {q.get('type', 'N/A')}")
                    print(f"      - Content: {content}")
            else:
                print(f"❌ Failed ({result['duration']:.3f}s)")
                print(f"   Error: {result.get('error', 'Unknown error')}")
    
    def test_search_api(self):
        """Test SearchQuestions API"""
        print("\n🔍 TESTING SEARCH API")
        print("=" * 60)
        
        search_queries = [
            {"query": "xác suất", "description": "probability"},
            {"query": "tổ hợp", "description": "combination"},
            {"query": "phương trình", "description": "equation"},
            {"query": "hàm số", "description": "function"}
        ]
        
        for i, search_test in enumerate(search_queries, 1):
            print(f"\n{i}️⃣ Search: '{search_test['query']}' ({search_test['description']})")
            print(f"Expected: Should find {search_test['description']} questions")
            print("-" * 50)
            
            payload = {
                "query": search_test['query'],
                "pagination": {"page": 1, "limit": 3}
            }
            
            result = self._make_request("POST", "/api/v1/questions/search", payload)
            
            if result['success']:
                data = result['data']
                print(f"✅ Success ({result['duration']:.3f}s)")
                print(f"   📊 Total Found: {data.get('total_count', 0)}")
                print(f"   📝 Questions Returned: {len(data.get('questions', []))}")
                
                # Show sample results
                questions = data.get('questions', [])
                for j, q in enumerate(questions[:2], 1):
                    content = q.get('content', '')[:50] + '...' if len(q.get('content', '')) > 50 else q.get('content', '')
                    print(f"   🔍 Result {j}:")
                    print(f"      - Code: {q.get('questionCodeId', 'N/A')}")
                    print(f"      - Type: {q.get('type', 'N/A')}")
                    print(f"      - Content: {content}")
            else:
                print(f"❌ Failed ({result['duration']:.3f}s)")
                print(f"   Error: {result.get('error', 'Unknown error')}")
    
    def test_question_code_api(self):
        """Test GetQuestionsByQuestionCode API"""
        print("\n📋 TESTING QUESTION CODE API")
        print("=" * 60)
        
        test_cases = [
            {
                "name": "Grade 0 Questions",
                "payload": {
                    "question_code_filter": {"grades": ["0"]},
                    "pagination": {"page": 1, "limit": 5}
                },
                "expected": "~2123"
            },
            {
                "name": "Grade 1 Questions", 
                "payload": {
                    "question_code_filter": {"grades": ["1"]},
                    "pagination": {"page": 1, "limit": 5}
                },
                "expected": "~726"
            },
            {
                "name": "Subject D Questions",
                "payload": {
                    "question_code_filter": {"subjects": ["D"]},
                    "pagination": {"page": 1, "limit": 5}
                },
                "expected": "~1950"
            },
            {
                "name": "Subject P Questions",
                "payload": {
                    "question_code_filter": {"subjects": ["P"]},
                    "pagination": {"page": 1, "limit": 5}
                },
                "expected": "~134"
            },
            {
                "name": "Grade 0 + Subject D",
                "payload": {
                    "question_code_filter": {"grades": ["0"], "subjects": ["D"]},
                    "pagination": {"page": 1, "limit": 5}
                },
                "expected": "largest subset"
            }
        ]
        
        for i, test in enumerate(test_cases, 1):
            print(f"\n{i}️⃣ {test['name']} (Should have {test['expected']})")
            print("-" * 50)
            
            result = self._make_request("POST", "/api/v1/questions/by-code", test['payload'])
            
            if result['success']:
                data = result['data']
                print(f"✅ Success ({result['duration']:.3f}s)")
                print(f"   📊 Total Count: {data.get('total_count', 0):,}")
                print(f"   📝 Questions Returned: {len(data.get('questions', []))}")
                
                # Show sample codes
                questions = data.get('questions', [])
                codes = [q.get('questionCodeId', 'N/A') for q in questions]
                print(f"   🔍 Sample Codes: {codes}")
            else:
                print(f"❌ Failed ({result['duration']:.3f}s)")
                print(f"   Error: {result.get('error', 'Unknown error')}")
    
    def run_comprehensive_test(self):
        """Run all API tests"""
        print("🧪 COMPREHENSIVE API TESTING")
        print("=" * 80)
        
        # Login first
        if not self.login():
            print("❌ Cannot proceed without authentication")
            return
        
        # Run all tests
        self.test_filter_api()
        self.test_search_api()
        self.test_question_code_api()
        
        print("\n📊 TESTING COMPLETED!")
        print("🎉 All QuestionFilterService APIs tested!")
        print("=" * 80)

def main():
    """Main function"""
    tester = ExamBankAPITester()
    tester.run_comprehensive_test()

if __name__ == "__main__":
    main()
