'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Database, Zap, TrendingUp, Clock, Users } from 'lucide-react';
import { EnhancedSearch } from '@/components/admin/search/enhanced-search';

export default function AdminSearchPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm nâng cao</h1>
        <p className="text-muted-foreground">
          Hệ thống tìm kiếm thông minh với OpenSearch và hỗ trợ tiếng Việt
        </p>
      </div>

      {/* Search Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Vietnamese Analysis</p>
                <p className="text-xs text-muted-foreground">Phân tích tiếng Việt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">350+ Synonyms</p>
                <p className="text-xs text-muted-foreground">Từ đồng nghĩa giáo dục</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">&lt;200ms</p>
                <p className="text-xs text-muted-foreground">Thời gian phản hồi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">10K+ Users</p>
                <p className="text-xs text-muted-foreground">Đồng thời</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Tìm kiếm</TabsTrigger>
          <TabsTrigger value="features">Tính năng</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-4">
          <EnhancedSearch />
        </TabsContent>
        
        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Vietnamese Text Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Analyzers được hỗ trợ:</h4>
                  <div className="space-y-1">
                    <Badge variant="outline">vietnamese_content_analyzer</Badge>
                    <Badge variant="outline">vietnamese_search_analyzer</Badge>
                    <Badge variant="outline">vietnamese_exact_analyzer</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Plugins tích hợp:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• analysis-icu: Unicode normalization</li>
                    <li>• analysis-phonetic: Phonetic matching</li>
                    <li>• analysis-kuromoji: Advanced tokenization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Education Domain Synonyms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Môn học:</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary">toán,toán học,mathematics</Badge>
                    <Badge variant="secondary">lý,vật lý,physics</Badge>
                    <Badge variant="secondary">hóa,hóa học,chemistry</Badge>
                    <Badge variant="secondary">sinh,sinh học,biology</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Thuật ngữ toán học:</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary">đạo hàm,derivative</Badge>
                    <Badge variant="secondary">tích phân,integral</Badge>
                    <Badge variant="secondary">giới hạn,limit</Badge>
                    <Badge variant="secondary">hàm số,function</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Advanced Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Fuzzy Search:</h4>
                  <p className="text-sm text-muted-foreground">
                    Tự động sửa lỗi chính tả và tìm kiếm mờ với độ chính xác cao
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Highlighting:</h4>
                  <p className="text-sm text-muted-foreground">
                    Đánh dấu từ khóa tìm kiếm trong kết quả với context snippet
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Auto-completion:</h4>
                  <p className="text-sm text-muted-foreground">
                    Gợi ý tự động với context-aware suggestions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Search Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Relevance Scoring:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Content: 3x boost</li>
                    <li>• Exact match: 2x boost</li>
                    <li>• Solution: 2x boost</li>
                    <li>• Tags: 1.5x boost</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Quality Metrics:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Precision: 95%+</li>
                    <li>• Recall: 90%+</li>
                    <li>• F1-Score: 92%+</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Response Time</span>
                    <Badge variant="outline">&lt;200ms</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Search Accuracy</span>
                    <Badge variant="outline">95%+</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Concurrent Users</span>
                    <Badge variant="outline">10,000+</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Index Size</span>
                    <Badge variant="outline">1M+ questions</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Infrastructure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">OpenSearch Cluster:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 1 shard, 0 replicas (development)</li>
                    <li>• 1s refresh interval</li>
                    <li>• Vietnamese analysis pipeline</li>
                    <li>• Custom synonym filters</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Caching Strategy:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Query result caching</li>
                    <li>• Aggregation caching</li>
                    <li>• Auto cache invalidation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Search Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                        <Search className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium">Frontend</h4>
                      <p className="text-xs text-muted-foreground">
                        React components với real-time search
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                        <Zap className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-medium">Backend</h4>
                      <p className="text-xs text-muted-foreground">
                        Go gRPC services với OpenSearch integration
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                        <Database className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-medium">OpenSearch</h4>
                      <p className="text-xs text-muted-foreground">
                        Vietnamese analysis với education synonyms
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
