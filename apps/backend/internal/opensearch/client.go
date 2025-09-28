package opensearch

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/opensearch-project/opensearch-go/v2"
	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
)

// Client wraps OpenSearch client with Vietnamese search capabilities
type Client struct {
	client *opensearch.Client
	config *Config
	logger *log.Logger
}

// NewClient creates a new OpenSearch client with Vietnamese analysis support
func NewClient(config *Config) (*Client, error) {
	if err := config.Validate(); err != nil {
		return nil, fmt.Errorf("invalid OpenSearch config: %w", err)
	}

	if !config.Enabled {
		return &Client{
			client: nil,
			config: config,
			logger: log.New(log.Writer(), "[OpenSearch] ", log.LstdFlags),
		}, nil
	}

	// Configure OpenSearch client
	cfg := opensearch.Config{
		Addresses: []string{config.URL},
		Username:  config.Username,
		Password:  config.Password,
		Transport: &http.Transport{
			MaxIdleConnsPerHost:   config.MaxConnsPerHost,
			MaxIdleConns:          config.MaxIdleConns,
			IdleConnTimeout:       config.KeepAlive,
			ResponseHeaderTimeout: config.Timeout,
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true, // For development only
			},
		},
		RetryOnStatus: []int{502, 503, 504, 429},
		MaxRetries:    config.MaxRetries,
		RetryBackoff: func(i int) time.Duration {
			return time.Duration(i) * config.RetryBackoff
		},
	}

	// Enable request/response logging if configured
	if config.LogRequests || config.LogResponses {
		cfg.Logger = &opensearchLogger{
			logRequests:  config.LogRequests,
			logResponses: config.LogResponses,
		}
	}

	client, err := opensearch.NewClient(cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create OpenSearch client: %w", err)
	}

	osClient := &Client{
		client: client,
		config: config,
		logger: log.New(log.Writer(), "[OpenSearch] ", log.LstdFlags),
	}

	// Test connection
	if err := osClient.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to ping OpenSearch: %w", err)
	}

	osClient.logger.Printf("Connected to OpenSearch at %s", config.URL)

	return osClient, nil
}

// Ping tests the connection to OpenSearch
func (c *Client) Ping(ctx context.Context) error {
	if !c.config.Enabled || c.client == nil {
		return nil
	}

	req := opensearchapi.PingRequest{}
	res, err := req.Do(ctx, c.client)
	if err != nil {
		return fmt.Errorf("ping request failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("ping failed with status: %s", res.Status())
	}

	return nil
}

// GetClusterHealth returns the cluster health status
func (c *Client) GetClusterHealth(ctx context.Context) (*ClusterHealth, error) {
	if !c.config.Enabled || c.client == nil {
		return &ClusterHealth{Status: "disabled"}, nil
	}

	req := opensearchapi.ClusterHealthRequest{
		Pretty: true,
	}

	res, err := req.Do(ctx, c.client)
	if err != nil {
		return nil, fmt.Errorf("cluster health request failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("cluster health failed with status: %s", res.Status())
	}

	var health ClusterHealth
	if err := json.NewDecoder(res.Body).Decode(&health); err != nil {
		return nil, fmt.Errorf("failed to decode cluster health response: %w", err)
	}

	return &health, nil
}

// CreateIndex creates an index with Vietnamese analysis settings
func (c *Client) CreateIndex(ctx context.Context, indexName string, settings map[string]interface{}) error {
	if !c.config.Enabled || c.client == nil {
		c.logger.Printf("OpenSearch disabled, skipping index creation: %s", indexName)
		return nil
	}

	// Add Vietnamese analysis settings if enabled
	if c.config.IsVietnameseAnalysisEnabled() {
		settings = c.addVietnameseAnalysisSettings(settings)
	}

	settingsJSON, err := json.Marshal(settings)
	if err != nil {
		return fmt.Errorf("failed to marshal index settings: %w", err)
	}

	req := opensearchapi.IndicesCreateRequest{
		Index: indexName,
		Body:  strings.NewReader(string(settingsJSON)),
	}

	res, err := req.Do(ctx, c.client)
	if err != nil {
		return fmt.Errorf("create index request failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		// Check if index already exists
		if res.StatusCode == 400 {
			var errorResp map[string]interface{}
			if err := json.NewDecoder(res.Body).Decode(&errorResp); err == nil {
				if errorType, ok := errorResp["error"].(map[string]interface{})["type"].(string); ok {
					if errorType == "resource_already_exists_exception" {
						c.logger.Printf("Index %s already exists", indexName)
						return nil
					}
				}
			}
		}
		return fmt.Errorf("create index failed with status: %s", res.Status())
	}

	c.logger.Printf("Created index: %s", indexName)
	return nil
}

// DeleteIndex deletes an index
func (c *Client) DeleteIndex(ctx context.Context, indexName string) error {
	if !c.config.Enabled || c.client == nil {
		return nil
	}

	req := opensearchapi.IndicesDeleteRequest{
		Index: []string{indexName},
	}

	res, err := req.Do(ctx, c.client)
	if err != nil {
		return fmt.Errorf("delete index request failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() && res.StatusCode != 404 {
		return fmt.Errorf("delete index failed with status: %s", res.Status())
	}

	c.logger.Printf("Deleted index: %s", indexName)
	return nil
}

// IndexExists checks if an index exists
func (c *Client) IndexExists(ctx context.Context, indexName string) (bool, error) {
	if !c.config.Enabled || c.client == nil {
		return false, nil
	}

	req := opensearchapi.IndicesExistsRequest{
		Index: []string{indexName},
	}

	res, err := req.Do(ctx, c.client)
	if err != nil {
		return false, fmt.Errorf("index exists request failed: %w", err)
	}
	defer res.Body.Close()

	return res.StatusCode == 200, nil
}

// CreateAlias creates an alias for an index
func (c *Client) CreateAlias(ctx context.Context, indexName, aliasName string) error {
	if !c.config.Enabled || c.client == nil {
		return nil
	}

	aliasActions := map[string]interface{}{
		"actions": []map[string]interface{}{
			{
				"add": map[string]interface{}{
					"index": indexName,
					"alias": aliasName,
				},
			},
		},
	}

	actionsJSON, err := json.Marshal(aliasActions)
	if err != nil {
		return fmt.Errorf("failed to marshal alias actions: %w", err)
	}

	req := opensearchapi.IndicesUpdateAliasesRequest{
		Body: strings.NewReader(string(actionsJSON)),
	}

	res, err := req.Do(ctx, c.client)
	if err != nil {
		return fmt.Errorf("create alias request failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("create alias failed with status: %s", res.Status())
	}

	c.logger.Printf("Created alias %s -> %s", aliasName, indexName)
	return nil
}

// addVietnameseAnalysisSettings adds Vietnamese analysis configuration to index settings
func (c *Client) addVietnameseAnalysisSettings(settings map[string]interface{}) map[string]interface{} {
	if settings == nil {
		settings = make(map[string]interface{})
	}

	// Ensure settings.analysis exists
	if _, ok := settings["analysis"]; !ok {
		settings["analysis"] = make(map[string]interface{})
	}
	analysis := settings["analysis"].(map[string]interface{})

	// Add Vietnamese analyzers
	analysis["analyzer"] = map[string]interface{}{
		"vietnamese_content_analyzer": map[string]interface{}{
			"type":      "custom",
			"tokenizer": "standard",
			"filter": []string{
				"lowercase",
				"vietnamese_stop_words",
				"icu_folding",
				"education_synonyms",
				"phonetic_vietnamese",
			},
		},
		"vietnamese_search_analyzer": map[string]interface{}{
			"type":      "custom",
			"tokenizer": "standard",
			"filter": []string{
				"lowercase",
				"vietnamese_stop_words",
				"icu_folding",
				"education_synonyms",
				"phonetic_vietnamese",
			},
		},
		"vietnamese_exact_analyzer": map[string]interface{}{
			"type":      "custom",
			"tokenizer": "keyword",
			"filter": []string{
				"lowercase",
				"icu_folding",
			},
		},
	}

	// Add Vietnamese filters
	analysis["filter"] = map[string]interface{}{
		"vietnamese_stop_words": map[string]interface{}{
			"type": "stop",
			"stopwords": []string{
				"và", "của", "có", "là", "được", "trong", "với", "để", "từ", "theo",
				"về", "cho", "khi", "như", "đã", "sẽ", "bị", "bởi", "tại", "trên",
				"dưới", "giữa", "ngoài", "sau", "trước", "lúc", "lần", "các", "những",
				"mỗi", "tất", "cả", "một", "hai", "ba", "nhiều", "ít", "rất", "khá",
			},
		},
		"education_synonyms": map[string]interface{}{
			"type": "synonym",
			"synonyms": []string{
				"toán,toán học,mathematics,math",
				"lý,vật lý,physics",
				"hóa,hóa học,chemistry",
				"sinh,sinh học,biology",
				"văn,ngữ văn,literature",
				"đạo hàm,derivative",
				"tích phân,integral",
				"giới hạn,limit",
				"hàm số,function",
			},
		},
		"phonetic_vietnamese": map[string]interface{}{
			"type":    "phonetic",
			"encoder": "metaphone",
			"replace": false,
		},
	}

	return settings
}

// Close closes the OpenSearch client
func (c *Client) Close() error {
	// OpenSearch Go client doesn't have explicit close method
	c.logger.Printf("OpenSearch client closed")
	return nil
}

// IsEnabled returns true if OpenSearch is enabled
func (c *Client) IsEnabled() bool {
	return c.config.Enabled && c.client != nil
}

// GetConfig returns the client configuration
func (c *Client) GetConfig() *Config {
	return c.config
}

// ClusterHealth represents OpenSearch cluster health
type ClusterHealth struct {
	ClusterName         string `json:"cluster_name"`
	Status              string `json:"status"`
	TimedOut            bool   `json:"timed_out"`
	NumberOfNodes       int    `json:"number_of_nodes"`
	NumberOfDataNodes   int    `json:"number_of_data_nodes"`
	ActivePrimaryShards int    `json:"active_primary_shards"`
	ActiveShards        int    `json:"active_shards"`
	RelocatingShards    int    `json:"relocating_shards"`
	InitializingShards  int    `json:"initializing_shards"`
	UnassignedShards    int    `json:"unassigned_shards"`
}

// opensearchLogger implements OpenSearch logger interface
type opensearchLogger struct {
	logRequests  bool
	logResponses bool
}

func (l *opensearchLogger) LogRoundTrip(req *http.Request, res *http.Response, err error, start time.Time, dur time.Duration) error {
	if l.logRequests {
		log.Printf("[OpenSearch] %s %s", req.Method, req.URL.String())
	}
	if l.logResponses && res != nil {
		log.Printf("[OpenSearch] %s %s -> %s (%v)", req.Method, req.URL.String(), res.Status, dur)
	}
	if err != nil {
		log.Printf("[OpenSearch] %s %s -> ERROR: %v (%v)", req.Method, req.URL.String(), err, dur)
	}
	return nil
}

func (l *opensearchLogger) RequestBodyEnabled() bool  { return l.logRequests }
func (l *opensearchLogger) ResponseBodyEnabled() bool { return l.logResponses }
