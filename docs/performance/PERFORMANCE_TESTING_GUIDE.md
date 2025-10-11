# Performance Testing Guide

## Overview

This guide covers performance testing for the Exam Bank System using k6.

## Quick Start

### 1. Install k6

**Windows:**
```powershell
# Using Chocolatey
choco install k6

# Or using Scoop
scoop install k6
```

**Verify Installation:**
```bash
k6 version
```

### 2. Run Your First Test

```powershell
# Baseline test (1 user)
cd D:\exam-bank-system
.\tests\performance\run-tests.ps1 -TestType baseline

# Load test (100 users)
.\tests\performance\run-tests.ps1 -TestType load

# Export results
.\tests\performance\run-tests.ps1 -TestType load -Export
```

## Test Scenarios

### Baseline Test
- **Purpose**: Establish baseline performance
- **Users**: 1 VU
- **Duration**: 1 minute
- **Target**: P95 < 500ms

```powershell
.\tests\performance\run-tests.ps1 -TestType baseline
```

### Load Test
- **Purpose**: Test under expected load
- **Users**: 50-100 VUs
- **Duration**: 5 minutes
- **Target**: P95 < 500ms, Error < 1%

```powershell
.\tests\performance\run-tests.ps1 -TestType load
```

### Stress Test
- **Purpose**: Find breaking point
- **Users**: 100-1500 VUs (ramping)
- **Duration**: 15 minutes
- **Target**: System stability

```powershell
.\tests\performance\run-tests.ps1 -TestType stress
```

### Soak Test
- **Purpose**: Detect memory leaks
- **Users**: 100 VUs
- **Duration**: 1 hour
- **Target**: Consistent performance

```powershell
.\tests\performance\run-tests.ps1 -TestType soak
```

## Performance Targets

### Response Time Targets
| Percentile | Target    | Critical |
|------------|-----------|----------|
| P50        | < 200ms   | < 300ms  |
| P95        | < 500ms   | < 1000ms |
| P99        | < 1000ms  | < 2000ms |

### Throughput Targets
| Scenario   | Target RPS | Critical RPS |
|------------|------------|--------------|
| Baseline   | 10+        | 5+           |
| Load       | 100+       | 50+          |
| Stress     | 500+       | 250+         |

### Error Rate Targets
| Scenario   | Target  | Critical |
|------------|---------|----------|
| Normal     | < 0.1%  | < 1%     |
| Load       | < 1%    | < 5%     |
| Stress     | < 5%    | < 10%    |

## Test Scripts

### 1. Authentication Tests (`auth.js`)
Tests authentication endpoints:
- User registration
- Login (success/failure)
- Token validation
- Logout

**Run:**
```powershell
.\tests\performance\run-tests.ps1 -TestType auth
```

### 2. Exam Flow Tests (`exam-flow.js`)
Tests complete exam workflow:
- Browse exams
- Start attempt
- Answer questions
- Submit answers
- View results

**Run:**
```powershell
.\tests\performance\run-tests.ps1 -TestType exam
```

### 3. Question API Tests (`question.js`)
Tests question management:
- List questions (pagination)
- Search by difficulty/type
- Get question details
- Create questions
- Complex queries

**Run:**
```powershell
.\tests\performance\run-tests.ps1 -TestType question
```

## Analyzing Results

### k6 Output Metrics

#### HTTP Metrics
- **http_req_duration**: Request duration (avg, p50, p95, p99)
- **http_req_blocked**: Time spent blocked before request
- **http_req_connecting**: Time spent establishing TCP connection
- **http_req_receiving**: Time spent receiving response
- **http_req_sending**: Time spent sending request
- **http_req_waiting**: Time spent waiting for response (TTFB)
- **http_req_failed**: Rate of failed requests
- **http_reqs**: Total number of requests

#### Iteration Metrics
- **iterations**: Number of test iterations completed
- **iteration_duration**: Duration of full iteration

#### VU Metrics
- **vus**: Current number of active virtual users
- **vus_max**: Maximum number of virtual users

### Reading Test Output

```
✓ status is 200
✓ response time < 200ms

checks.........................: 100.00% ✓ 1842      ✗ 0    
data_received..................: 2.1 MB  35 kB/s
data_sent......................: 284 kB  4.7 kB/s
http_req_blocked...............: avg=1.12ms   min=0s    med=0s     max=122.83ms p(95)=0s     p(99)=13.25ms
http_req_connecting............: avg=555.75µs min=0s    med=0s     max=61.41ms  p(95)=0s     p(99)=6.62ms 
http_req_duration..............: avg=145.32ms min=21ms  med=132ms  max=456ms    p(95)=289ms  p(99)=356ms  
http_req_failed................: 0.00%   ✓ 0         ✗ 921  
http_req_receiving.............: avg=272.46µs min=0s    med=0s     max=15.62ms  p(95)=1ms    p(99)=2ms    
http_req_sending...............: avg=47.97µs  min=0s    med=0s     max=2.01ms   p(95)=0s     p(99)=1ms    
http_req_waiting...............: avg=145ms    min=21ms  med=132ms  max=456ms    p(95)=289ms  p(99)=356ms  
http_reqs......................: 921     15.35/s
iteration_duration.............: avg=6.51s    min=6.37s med=6.49s  max=7.11s    p(95)=6.73s  p(99)=6.89s  
iterations.....................: 153     2.55/s
vus............................: 20      min=1       max=20
vus_max........................: 20      min=20      max=20
```

### What to Look For

✅ **Good Performance:**
- Checks passing 100%
- P95 < 500ms
- Error rate < 1%
- Stable RPS throughout test

❌ **Performance Issues:**
- Checks failing
- P95 > 1000ms
- Error rate > 5%
- Declining RPS over time
- Increasing response times

## Troubleshooting

### High Response Times

**Symptoms:**
- P95 > 1000ms
- Increasing over time

**Possible Causes:**
1. Database query performance
2. N+1 queries
3. Missing indexes
4. Insufficient connection pool

**Solutions:**
```go
// Add database indexes
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_exam_attempts_user_id ON exam_attempts(user_id);

// Optimize queries
// Before: N+1 query
for _, attempt := range attempts {
    exam := GetExam(attempt.ExamID) // N queries
}

// After: Preload
attempts = PreloadExams(attempts) // 1 query
```

### High Error Rates

**Symptoms:**
- http_req_failed > 1%
- 500/503 errors

**Possible Causes:**
1. Database connection exhaustion
2. Rate limiting
3. Timeout issues
4. Memory leaks

**Solutions:**
```go
// Increase connection pool
db.SetMaxOpenConns(100)
db.SetMaxIdleConns(20)
db.SetConnMaxLifetime(time.Hour)

// Add timeout
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
```

### Memory Issues

**Symptoms:**
- Increasing memory usage over time
- OOM errors during soak test

**Possible Causes:**
1. Memory leaks
2. Goroutine leaks
3. Unclosed connections
4. Large response bodies

**Solutions:**
```go
// Properly close connections
defer resp.Body.Close()

// Limit goroutines
sem := make(chan struct{}, 10)
for i := 0; i < 100; i++ {
    sem <- struct{}{}
    go func() {
        defer func() { <-sem }()
        // work
    }()
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Performance Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  performance:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Start Backend
        run: |
          docker-compose up -d
          sleep 10
      
      - name: Run Baseline Test
        run: |
          k6 run --summary-export=baseline-results.json \
            --config tests/performance/config/baseline.json \
            tests/performance/scripts/exam-flow.js
      
      - name: Check Thresholds
        run: |
          P95=$(jq '.metrics.http_req_duration.values.p95' baseline-results.json)
          if (( $(echo "$P95 > 500" | bc -l) )); then
            echo "❌ P95 ($P95 ms) exceeds threshold (500ms)"
            exit 1
          fi
          echo "✅ P95 ($P95 ms) within threshold"
      
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: baseline-results.json
```

## Best Practices

### 1. Test Environment
- Use dedicated test environment
- Match production configuration
- Consistent data set
- Isolated from other tests

### 2. Test Data
- Use realistic data volumes
- Clean state before tests
- Avoid test data pollution
- Seed consistent data

### 3. Test Execution
- Run baseline before changes
- Run same test multiple times
- Compare results systematically
- Document environment details

### 4. Monitoring
- Monitor system resources (CPU, memory, disk)
- Track database performance
- Monitor network latency
- Check error logs

### 5. Results Interpretation
- Look for trends, not absolutes
- Compare to baseline
- Consider confidence intervals
- Investigate anomalies

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://github.com/grafana/k6-examples)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/running-large-tests/)
- [k6 Cloud](https://k6.io/cloud/) - For advanced analysis
