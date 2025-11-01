# 📊 MapCode Monitoring & Alerting Setup

**Version**: 2.0.0  
**Created**: 2025-01-19  
**For**: Production Deployment

---

## 🎯 Overview

This guide configures monitoring and alerting for the MapCode system to track performance, cache health, and error rates in production.

---

## 📈 Metrics to Monitor

### 1. **Cache Performance**

| Metric | Threshold | Alert | Impact |
|--------|-----------|-------|--------|
| **Cache Hit Rate** | < 75% | ⚠️ WARNING | Slow translation performance |
| **Cache Miss Rate** | > 25% | ⚠️ WARNING | Excessive DB queries |
| **Eviction Count** | > 100/hour | 🔴 CRITICAL | Cache instability |

**How to Check**:
```
Dashboard: Admin → MapCode → Metrics
Endpoint: GET /v1/mapcode/metrics
Field: cache_hit_rate
```

### 2. **Translation Performance**

| Metric | Threshold | Alert | Impact |
|--------|-----------|-------|--------|
| **Avg Translation Time** | > 10ms | ⚠️ WARNING | Slow API responses |
| **P95 Translation Time** | > 50ms | 🔴 CRITICAL | Unacceptable latency |
| **Translation Errors** | > 10/hour | 🔴 CRITICAL | Data quality issue |

**How to Check**:
```
Endpoint: GET /v1/mapcode/metrics
Fields: avg_translation_time_ms, translation_errors
```

### 3. **Version Management**

| Metric | Threshold | Alert | Impact |
|--------|-----------|-------|--------|
| **Version Count** | > 18/20 | ⚠️ WARNING | Storage limit approaching |
| **Active Version Age** | > 30 days | 📌 NOTICE | Consider updating |
| **Version Activation Time** | > 5s | ⚠️ WARNING | Long cache invalidation |

### 4. **System Health**

| Metric | Threshold | Alert | Impact |
|--------|-----------|-------|--------|
| **Service Availability** | < 99.5% | 🔴 CRITICAL | Service down |
| **Database Connection** | > 80% used | ⚠️ WARNING | Connection pool exhaustion |
| **Memory Usage** | > 80% | ⚠️ WARNING | Cache bloated |

---

## 🔧 Setup Instructions

### Step 1: Configure Prometheus Scraping

**File**: `docker-compose.monitoring.yml`

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

volumes:
  prometheus_data:
```

**File**: `prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'mapcode-backend'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    
  - job_name: 'mapcode-metrics'
    static_configs:
      - targets: ['localhost:50051']
    metrics_path: '/v1/mapcode/metrics'
    scrape_interval: 30s
```

### Step 2: Configure Alerting Rules

**File**: `prometheus-rules.yml`

```yaml
groups:
  - name: mapcode_alerts
    interval: 30s
    rules:
      
      # Cache Hit Rate Alert
      - alert: MapCodeCacheHitRateLow
        expr: |
          mapcode_cache_hit_rate < 0.75
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "MapCode cache hit rate low: {{ $value | humanizePercentage }}"
          description: "Cache hit rate dropped below 75%. Check for cache invalidation issues."
      
      # Translation Performance Alert
      - alert: MapCodeHighLatency
        expr: |
          mapcode_avg_translation_time_ms > 10
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "MapCode translation latency high: {{ $value }}ms"
          description: "Average translation time exceeded 10ms threshold"
      
      # Translation Errors Alert
      - alert: MapCodeTranslationErrors
        expr: |
          increase(mapcode_translation_errors[5m]) > 10
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "MapCode translation errors detected: {{ $value }}"
          description: "More than 10 translation errors in 5 minutes"
      
      # Version Storage Alert
      - alert: MapCodeVersionStorageWarning
        expr: |
          mapcode_version_count > 18
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "MapCode version storage approaching limit: {{ $value }}/20"
          description: "Version count is {{ $value }}, only 2 slots remaining"
      
      # Service Availability Alert
      - alert: MapCodeServiceDown
        expr: |
          up{job="mapcode-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "MapCode service is down"
          description: "MapCode backend is not responding for more than 1 minute"
```

### Step 3: Configure Alert Notifications

**File**: `alertmanager.yml`

```yaml
global:
  resolve_timeout: 5m

route:
  receiver: 'mapcode-team'
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

receivers:
  - name: 'mapcode-team'
    email_configs:
      - to: 'mapcode-alerts@nynus.edu.vn'
        from: 'alerts@monitoring.nynus.edu.vn'
        smarthost: 'smtp.nynus.edu.vn:587'
        auth_username: 'alerts@nynus.edu.vn'
        auth_password: '${SMTP_PASSWORD}'
        
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#mapcode-alerts'
        title: 'MapCode Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true

inhibit_rules:
  # Don't alert on low cache hit if service is down
  - source_match:
      severity: 'critical'
      alertname: 'MapCodeServiceDown'
    target_match_re:
      alertname: 'MapCode.*'
    equal: ['job']
```

### Step 4: Configure Grafana Dashboard

**File**: `grafana-dashboard-mapcode.json`

```json
{
  "dashboard": {
    "title": "MapCode Monitoring Dashboard",
    "panels": [
      {
        "title": "Cache Hit Rate (%)",
        "targets": [
          {
            "expr": "mapcode_cache_hit_rate * 100"
          }
        ],
        "alert": {
          "name": "CacheHitRateLow",
          "conditions": [
            {
              "evaluator": { "params": [75], "type": "lt" },
              "operator": { "type": "and" }
            }
          ]
        }
      },
      {
        "title": "Avg Translation Time (ms)",
        "targets": [
          {
            "expr": "mapcode_avg_translation_time_ms"
          }
        ]
      },
      {
        "title": "Translation Errors (5m rate)",
        "targets": [
          {
            "expr": "increase(mapcode_translation_errors[5m])"
          }
        ]
      },
      {
        "title": "Version Count / Max",
        "targets": [
          {
            "expr": "mapcode_version_count / 20"
          }
        ]
      },
      {
        "title": "Total Translations (cumulative)",
        "targets": [
          {
            "expr": "mapcode_total_translations"
          }
        ]
      }
    ]
  }
}
```

---

## 📱 Alert Channel Configuration

### Email Alerts

**Recipient**: mapcode-alerts@nynus.edu.vn  
**Schedule**: Immediate for CRITICAL, Daily digest for WARNING

```
Subject: 🔴 [CRITICAL] MapCode: {AlertName}
Body: Timestamp, Severity, Description, Dashboard Link
```

### Slack Notifications

**Channel**: #mapcode-alerts  
**Notification Format**: 
```
:warning: MapCode Alert
Severity: [CRITICAL|WARNING]
Issue: {Description}
Value: {CurrentValue}
Threshold: {Threshold}
Duration: {Duration}
Action Required: {Recommendation}
Dashboard: {Link}
```

### PagerDuty Integration (Optional)

For critical 24/7 coverage:

```yaml
receivers:
  - name: 'mapcode-oncall'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'
```

---

## 🚨 Alert Response Playbook

### Critical: Service Down (MapCodeServiceDown)

**SLA**: Page on-call immediately  
**Response Time**: < 5 minutes

1. Check service status: `docker ps | grep mapcode`
2. Check logs: `docker logs mapcode-backend`
3. If crashed:
   - Review recent changes
   - Check database connectivity
   - Restart service
4. If hung:
   - Kill process
   - Restart
5. Post-mortem if exceeds 15 minutes downtime

---

### Critical: Translation Errors Spike (MapCodeTranslationErrors)

**SLA**: Investigate within 15 minutes  
**Response Time**: < 5 minutes decision

1. Check error rate: `GET /v1/mapcode/metrics`
2. Review application logs
3. Check recent version activation
4. Possible causes:
   - Invalid MapCode configuration
   - Database issues
   - Cache corruption
5. Actions:
   - If recent activation: Rollback to previous version
   - If database issue: Alert DBA
   - If cache issue: Clear cache and restart

---

### Warning: Low Cache Hit Rate (MapCodeCacheHitRateLow)

**SLA**: Investigate within 1 hour  
**Response Time**: < 30 minutes analysis

1. Check metrics dashboard
2. Determine if:
   - New questions being translated (expected)
   - Cache eviction happening
   - Memory pressure
3. Actions:
   - If memory pressure: Increase cache size
   - If expected: Adjust alert threshold
   - If unusual: Pre-cache common codes

---

### Warning: Version Storage Limit (MapCodeVersionStorageWarning)

**SLA**: Cleanup within 24 hours  
**Response Time**: < 2 hours planning

1. List all versions: `GET /v1/mapcode/versions`
2. Identify inactive versions
3. Backup latest inactive versions
4. Delete 2-3 oldest inactive versions
5. Keep 15-18 active versions maximum

---

## 📊 Dashboard Views

### Real-time Monitoring

- 📈 Cache performance (green/red indicator)
- ⚡ Translation latency (histogram)
- ❌ Error rate (red zone if > 0%)
- 📦 Version count (progress bar)

### Historical Analysis (7-day)

- Cache hit rate trend
- Translation time distribution
- Error rate pattern
- Peak usage times

### Alerts Summary

- Active alerts (count by severity)
- Alert frequency (daily count)
- MTTR (Mean Time To Resolve)
- Alert accuracy (false positive %)

---

## 🔍 Health Check Script

**File**: `scripts/mapcode-healthcheck.sh`

```bash
#!/bin/bash

echo "🔍 MapCode Health Check - $(date)"
echo "================================"

# Check service availability
echo -n "Service Status: "
if curl -s http://localhost:50051/v1/mapcode/metrics > /dev/null 2>&1; then
  echo "✅ UP"
else
  echo "❌ DOWN"
  exit 1
fi

# Get metrics
METRICS=$(curl -s http://localhost:8080/api/v1/mapcode/metrics)

# Extract values
CACHE_HIT=$(echo $METRICS | jq '.metrics.cache_hit_rate')
AVG_TIME=$(echo $METRICS | jq '.metrics.avg_translation_time_ms')
ERRORS=$(echo $METRICS | jq '.metrics.translation_errors')
VERSIONS=$(curl -s http://localhost:8080/api/v1/mapcode/versions | jq '.versions | length')

echo ""
echo "📊 Metrics:"
echo "  Cache Hit Rate: $CACHE_HIT (target: > 0.75)"
echo "  Avg Translation: ${AVG_TIME}ms (target: < 10ms)"
echo "  Translation Errors: $ERRORS (target: 0)"
echo "  Version Count: $VERSIONS / 20"

# Check thresholds
if (( $(echo "$CACHE_HIT < 0.75" | bc -l) )); then
  echo "⚠️  WARNING: Low cache hit rate"
fi

if (( $(echo "$AVG_TIME > 10" | bc -l) )); then
  echo "⚠️  WARNING: High latency detected"
fi

if [ "$ERRORS" -gt "0" ]; then
  echo "❌ CRITICAL: Translation errors detected"
fi

if [ "$VERSIONS" -gt "18" ]; then
  echo "⚠️  WARNING: Version storage near limit"
fi

echo ""
echo "✅ Health check complete"
```

---

## 🚀 Deployment

### Start Monitoring Stack

```bash
docker-compose -f docker-compose.monitoring.yml up -d

# Verify services
curl http://localhost:9090  # Prometheus
curl http://localhost:3000  # Grafana (default admin/admin)
```

### Access Dashboards

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000
- **AlertManager**: http://localhost:9093

---

## 📝 Maintenance

### Weekly

- Review alert frequency
- Check for false positives
- Adjust thresholds if needed

### Monthly

- Review performance trends
- Capacity planning
- Alert rule optimization

### Quarterly

- Archive old metrics (> 90 days)
- Update runbooks
- Conduct alert drills

---

## 📞 Support Contacts

- **Alerts Team**: mapcode-alerts@nynus.edu.vn
- **On-Call**: Check PagerDuty
- **Slack**: #mapcode-alerts

---

**Last Updated**: 2025-01-19  
**Status**: Ready for Deployment


