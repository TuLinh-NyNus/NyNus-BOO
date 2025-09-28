# OpenSearch Vietnamese Integration Setup

## 📋 Tổng quan

OpenSearch infrastructure cho NyNus Exam Bank System với specialized Vietnamese text analysis plugins. Hệ thống được tối ưu cho education domain với 350+ synonyms và advanced Vietnamese search capabilities.

## 🎯 Mục tiêu hiệu suất

- **Response Time**: <200ms cho simple queries, <500ms cho complex queries
- **Accuracy**: 95%+ cho Vietnamese search
- **Concurrent Users**: 10,000+ simultaneous users
- **Capacity**: 1,500,000+ questions với enterprise-grade performance

## 🏗 Kiến trúc

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   OpenSearch    │
│   (Next.js)     │───▶│   (Go/gRPC)     │───▶│   (Vietnamese)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                               ┌─────────────────┐
                                               │  OpenSearch     │
                                               │  Dashboards     │
                                               └─────────────────┘
```

## 📦 Components

### 1. OpenSearch Core
- **Image**: `opensearchproject/opensearch:2.11.1`
- **Plugins**: analysis-icu, analysis-phonetic, analysis-kuromoji
- **Port**: 9200 (HTTP), 9300 (Transport), 9600 (Performance)

### 2. OpenSearch Dashboards
- **Image**: `opensearchproject/opensearch-dashboards:2.11.1`
- **Port**: 5601
- **Features**: Monitoring, index management, query testing

### 3. Vietnamese Analysis
- **Synonyms**: 350+ education domain terms
- **Stop Words**: 50+ Vietnamese stop words
- **Analyzers**: Content, search, exact matching

## 🚀 Quick Start

### 1. Start OpenSearch Services

```bash
# Start all services
docker-compose -f docker/compose/docker-compose.yml up -d

# Start only OpenSearch
docker-compose -f docker/compose/docker-compose.yml up -d opensearch opensearch-dashboards

# Check service status
docker-compose -f docker/compose/docker-compose.yml ps
```

### 2. Verify Installation

```bash
# Check OpenSearch health
curl http://localhost:9200/_cluster/health?pretty

# Check installed plugins
curl http://localhost:9200/_cat/plugins

# Check indices
curl http://localhost:9200/_cat/indices?v
```

### 3. Access Dashboards

- **OpenSearch Dashboards**: http://localhost:5601
- **OpenSearch API**: http://localhost:9200

## 🔧 Configuration

### Environment Variables

```bash
# Core Settings
OPENSEARCH_URL=http://opensearch:9200
OPENSEARCH_INDEX_PREFIX=questions
OPENSEARCH_ENABLED=true

# Performance Settings
OPENSEARCH_TIMEOUT=30s
OPENSEARCH_MAX_RETRIES=3
OPENSEARCH_CONNECTION_POOL_SIZE=10

# Vietnamese Analysis
VIETNAMESE_SYNONYMS_ENABLED=true
VIETNAMESE_STOPWORDS_ENABLED=true
EDUCATION_DOMAIN_OPTIMIZATION=true
```

### Index Templates

Index templates được tự động tạo với Vietnamese analyzers:

```json
{
  "analyzer": {
    "vietnamese_content_analyzer": {
      "tokenizer": "standard",
      "filter": [
        "lowercase",
        "vietnamese_stop_words",
        "icu_folding",
        "education_synonyms",
        "phonetic_vietnamese"
      ]
    }
  }
}
```

## 🧪 Testing Vietnamese Search

### 1. Test Basic Search

```bash
# Test Vietnamese text analysis
curl -X POST "http://localhost:9200/questions/_analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "analyzer": "vietnamese_content_analyzer",
    "text": "Tính đạo hàm của hàm số y = x² + 2x + 1"
  }'
```

### 2. Test Synonym Matching

```bash
# Search with synonyms
curl -X POST "http://localhost:9200/questions/_search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "multi_match": {
        "query": "toán học",
        "fields": ["content", "tags"],
        "type": "best_fields"
      }
    }
  }'
```

### 3. Test Phonetic Matching

```bash
# Test accent-insensitive search
curl -X POST "http://localhost:9200/questions/_search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "match": {
        "content": {
          "query": "dao ham",
          "fuzziness": "AUTO"
        }
      }
    }
  }'
```

## 📊 Monitoring

### Health Checks

```bash
# Cluster health
curl http://localhost:9200/_cluster/health

# Node stats
curl http://localhost:9200/_nodes/stats

# Index stats
curl http://localhost:9200/questions/_stats
```

### Performance Metrics

```bash
# Search performance
curl http://localhost:9200/_nodes/stats/indices/search

# Index performance
curl http://localhost:9200/_nodes/stats/indices/indexing

# Memory usage
curl http://localhost:9200/_nodes/stats/jvm
```

## 🔍 Vietnamese Search Features

### 1. Education Domain Synonyms

- **Subjects**: toán,lý,hóa,sinh,văn,sử,địa,anh,gdcd
- **Types**: trắc nghiệm,tự luận,đúng sai,điền khuyết
- **Levels**: cơ bản,nâng cao,khó,dễ,trung bình
- **Math Terms**: đạo hàm,tích phân,giới hạn,hàm số

### 2. Text Processing

- **Accent Handling**: đạo hàm ≈ dao ham
- **Stop Words**: và,của,có,là,được,trong,với
- **Stemming**: Vietnamese light stemming
- **Phonetic**: Metaphone algorithm for Vietnamese

### 3. Search Types

- **Exact Match**: Keyword search với icu_folding
- **Fuzzy Search**: Typo tolerance với fuzziness
- **Phrase Search**: Multi-word phrase matching
- **Wildcard**: Pattern matching với wildcards

## 🛠 Troubleshooting

### Common Issues

1. **OpenSearch won't start**
   ```bash
   # Check memory settings
   docker logs exam_bank_opensearch
   
   # Increase memory limit
   echo "vm.max_map_count=262144" >> /etc/sysctl.conf
   sysctl -p
   ```

2. **Plugins not installed**
   ```bash
   # Rebuild with plugins
   docker-compose build opensearch
   docker-compose up -d opensearch
   ```

3. **Vietnamese analysis not working**
   ```bash
   # Check analyzer configuration
   curl http://localhost:9200/questions/_settings
   
   # Test analyzer
   curl -X POST "http://localhost:9200/questions/_analyze" \
     -H "Content-Type: application/json" \
     -d '{"analyzer": "vietnamese_content_analyzer", "text": "test text"}'
   ```

### Performance Tuning

1. **Memory Settings**
   ```bash
   # Increase heap size for production
   OPENSEARCH_JAVA_OPTS=-Xms2g -Xmx2g
   ```

2. **Index Settings**
   ```bash
   # Optimize for search performance
   curl -X PUT "http://localhost:9200/questions/_settings" \
     -H "Content-Type: application/json" \
     -d '{"refresh_interval": "30s"}'
   ```

3. **Cache Settings**
   ```bash
   # Increase query cache
   curl -X PUT "http://localhost:9200/_cluster/settings" \
     -H "Content-Type: application/json" \
     -d '{"persistent": {"indices.queries.cache.size": "20%"}}'
   ```

## 📚 Resources

- [OpenSearch Documentation](https://opensearch.org/docs/)
- [Vietnamese Text Analysis](https://opensearch.org/docs/latest/analyzers/)
- [Performance Tuning](https://opensearch.org/docs/latest/tuning-your-cluster/)
- [Monitoring Guide](https://opensearch.org/docs/latest/monitoring-plugins/)

## 🔄 Next Steps

1. **Backend Integration**: Implement OpenSearch client in Go
2. **Search Service**: Replace PostgreSQL LIKE queries
3. **Frontend Integration**: Update search UI components
4. **Performance Testing**: Load testing với 10K+ concurrent users
5. **Production Deployment**: Security, monitoring, backup setup
