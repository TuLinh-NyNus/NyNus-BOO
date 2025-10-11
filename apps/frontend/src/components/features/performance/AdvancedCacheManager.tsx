/**
 * Advanced Cache Manager Component
 * Component để quản lý multi-layer caching system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Database,
  HardDrive,
  Zap,
  RefreshCw,
  Trash2,
  TrendingUp,
  Activity,
  BarChart3,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

// ===== TYPES =====

export interface AdvancedCacheManagerProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface CacheLayer {
  id: string;
  name: string;
  type: 'memory' | 'localStorage' | 'serviceWorker' | 'indexedDB';
  size: number;
  maxSize: number;
  hitRate: number;
  missRate: number;
  entries: number;
  lastAccessed: Date;
  status: 'healthy' | 'warning' | 'critical';
}

interface CacheEntry {
  key: string;
  size: number;
  hitCount: number;
  lastAccessed: Date;
  expiresAt?: Date;
  layer: string;
  isStale: boolean;
}

interface CacheMetrics {
  totalSize: number;
  totalEntries: number;
  overallHitRate: number;
  memoryUsage: number;
  performanceScore: number;
  lastCleanup: Date;
}

interface CachePolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  maxAge: number;
  maxSize: number;
  evictionStrategy: 'LRU' | 'LFU' | 'FIFO' | 'TTL';
  autoCleanup: boolean;
}

// ===== CONSTANTS =====

const CACHE_LAYER_ICONS = {
  memory: Zap,
  localStorage: HardDrive,
  serviceWorker: Database,
  indexedDB: Database
};

const STATUS_COLORS = {
  healthy: 'text-green-600 bg-green-100',
  warning: 'text-yellow-600 bg-yellow-100',
  critical: 'text-red-600 bg-red-100'
};

// ===== MAIN COMPONENT =====

export const AdvancedCacheManager: React.FC<AdvancedCacheManagerProps> = ({
  className,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  // ===== STATE =====

  const [cacheLayers, setCacheLayers] = useState<CacheLayer[]>([]);
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);
  const [cachePolicies, setCachePolicies] = useState<CachePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // ===== EFFECTS =====

  useEffect(() => {
    loadCacheData();

    if (autoRefresh) {
      const interval = setInterval(loadCacheData, refreshInterval);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval]);

  // ===== HANDLERS =====

  const loadCacheData = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real cache service calls
      // const [layers, entries, metrics, policies] = await Promise.all([
      //   CacheService.getCacheLayers(),
      //   CacheService.getCacheEntries(),
      //   CacheService.getCacheMetrics(),
      //   CacheService.getCachePolicies()
      // ]);

      // Mock data generation
      const layers: CacheLayer[] = [
        {
          id: 'memory',
          name: 'Memory Cache',
          type: 'memory',
          size: 15.2 * 1024 * 1024, // 15.2MB
          maxSize: 50 * 1024 * 1024, // 50MB
          hitRate: 94.5,
          missRate: 5.5,
          entries: 1247,
          lastAccessed: new Date(Date.now() - 2 * 60 * 1000),
          status: 'healthy'
        },
        {
          id: 'localStorage',
          name: 'Local Storage',
          type: 'localStorage',
          size: 3.8 * 1024 * 1024, // 3.8MB
          maxSize: 5 * 1024 * 1024, // 5MB
          hitRate: 87.2,
          missRate: 12.8,
          entries: 456,
          lastAccessed: new Date(Date.now() - 5 * 60 * 1000),
          status: 'warning'
        },
        {
          id: 'serviceWorker',
          name: 'Service Worker Cache',
          type: 'serviceWorker',
          size: 28.5 * 1024 * 1024, // 28.5MB
          maxSize: 100 * 1024 * 1024, // 100MB
          hitRate: 91.8,
          missRate: 8.2,
          entries: 892,
          lastAccessed: new Date(Date.now() - 1 * 60 * 1000),
          status: 'healthy'
        },
        {
          id: 'indexedDB',
          name: 'IndexedDB Cache',
          type: 'indexedDB',
          size: 12.1 * 1024 * 1024, // 12.1MB
          maxSize: 50 * 1024 * 1024, // 50MB
          hitRate: 89.3,
          missRate: 10.7,
          entries: 234,
          lastAccessed: new Date(Date.now() - 10 * 60 * 1000),
          status: 'healthy'
        }
      ];

      const entries: CacheEntry[] = Array.from({ length: 20 }, (_, i) => ({
        key: `cache_entry_${i}`,
        size: Math.floor(Math.random() * 1024 * 1024), // Random size up to 1MB
        hitCount: Math.floor(Math.random() * 100),
        lastAccessed: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        expiresAt: Math.random() > 0.3 ? new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000) : undefined,
        layer: layers[Math.floor(Math.random() * layers.length)].id,
        isStale: Math.random() > 0.8
      }));

      const metrics: CacheMetrics = {
        totalSize: layers.reduce((sum, layer) => sum + layer.size, 0),
        totalEntries: layers.reduce((sum, layer) => sum + layer.entries, 0),
        overallHitRate: layers.reduce((sum, layer) => sum + layer.hitRate, 0) / layers.length,
        memoryUsage: 59.6, // MB
        performanceScore: 92.4,
        lastCleanup: new Date(Date.now() - 2 * 60 * 60 * 1000)
      };

      const policies: CachePolicy[] = [
        {
          id: 'user-data',
          name: 'User Data Policy',
          description: 'Caching policy cho user data và session',
          enabled: true,
          maxAge: 15 * 60 * 1000, // 15 minutes
          maxSize: 10 * 1024 * 1024, // 10MB
          evictionStrategy: 'LRU',
          autoCleanup: true
        },
        {
          id: 'api-responses',
          name: 'API Response Policy',
          description: 'Caching policy cho API responses',
          enabled: true,
          maxAge: 5 * 60 * 1000, // 5 minutes
          maxSize: 20 * 1024 * 1024, // 20MB
          evictionStrategy: 'TTL',
          autoCleanup: true
        },
        {
          id: 'static-assets',
          name: 'Static Assets Policy',
          description: 'Caching policy cho static assets',
          enabled: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          maxSize: 50 * 1024 * 1024, // 50MB
          evictionStrategy: 'LFU',
          autoCleanup: false
        }
      ];

      setCacheLayers(layers);
      setCacheEntries(entries);
      setCacheMetrics(metrics);
      setCachePolicies(policies);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load cache data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClearCache = useCallback(async (layerId?: string) => {
    try {
      // TODO: Replace with real cache service call
      // await CacheService.clearCache(layerId);
      
      console.log('Clearing cache:', layerId || 'all layers');
      await loadCacheData();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }, [loadCacheData]);

  const handleOptimizeCache = useCallback(async () => {
    try {
      // TODO: Replace with real cache optimization service
      // await CacheService.optimizeCache();
      
      console.log('Optimizing cache...');
      await loadCacheData();
    } catch (error) {
      console.error('Failed to optimize cache:', error);
    }
  }, [loadCacheData]);

  const handleTogglePolicy = useCallback(async (policyId: string, enabled: boolean) => {
    try {
      // TODO: Replace with real cache policy service
      // await CacheService.updatePolicy(policyId, { enabled });
      
      setCachePolicies(prev =>
        prev.map(policy =>
          policy.id === policyId ? { ...policy, enabled } : policy
        )
      );
    } catch (error) {
      console.error('Failed to toggle policy:', error);
    }
  }, []);

  // ===== RENDER FUNCTIONS =====

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderCacheOverview = () => {
    if (!cacheMetrics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng dung lượng</p>
                <p className="text-2xl font-bold">{formatBytes(cacheMetrics.totalSize)}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng entries</p>
                <p className="text-2xl font-bold">{cacheMetrics.totalEntries.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hit Rate</p>
                <p className="text-2xl font-bold">{cacheMetrics.overallHitRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance Score</p>
                <p className="text-2xl font-bold">{cacheMetrics.performanceScore.toFixed(1)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCacheLayers = () => (
    <div className="space-y-4">
      {cacheLayers.map((layer) => {
        const IconComponent = CACHE_LAYER_ICONS[layer.type];
        const utilizationPercentage = (layer.size / layer.maxSize) * 100;
        
        return (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <IconComponent className="h-6 w-6 text-blue-500" />
                <div>
                  <h4 className="font-medium">{layer.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {layer.entries.toLocaleString()} entries • {formatBytes(layer.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn('text-xs', STATUS_COLORS[layer.status])}>
                  {layer.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearCache(layer.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Storage Usage</span>
                  <span>{utilizationPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={utilizationPercentage} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Hit Rate</span>
                  <span className="text-green-600">{layer.hitRate.toFixed(1)}%</span>
                </div>
                <Progress value={layer.hitRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Miss Rate</span>
                  <span className="text-red-600">{layer.missRate.toFixed(1)}%</span>
                </div>
                <Progress value={layer.missRate} className="h-2" />
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Last accessed: {layer.lastAccessed.toLocaleString('vi-VN')}
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderCacheEntries = () => (
    <div className="space-y-2">
      {cacheEntries.slice(0, 10).map((entry) => (
        <div key={entry.key} className="flex items-center justify-between p-3 border rounded">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm">{entry.key}</span>
              {entry.isStale && (
                <Badge variant="secondary" className="text-xs">Stale</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatBytes(entry.size)} • {entry.hitCount} hits • {entry.layer}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>Last: {entry.lastAccessed.toLocaleTimeString('vi-VN')}</div>
            {entry.expiresAt && (
              <div>Expires: {entry.expiresAt.toLocaleTimeString('vi-VN')}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCachePolicies = () => (
    <div className="space-y-4">
      {cachePolicies.map((policy) => (
        <Card key={policy.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{policy.name}</h4>
                  <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                    {policy.enabled ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {policy.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{policy.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Max Age:</span>
                    <div>{Math.floor(policy.maxAge / 60000)} minutes</div>
                  </div>
                  <div>
                    <span className="font-medium">Max Size:</span>
                    <div>{formatBytes(policy.maxSize)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Strategy:</span>
                    <div>{policy.evictionStrategy}</div>
                  </div>
                  <div>
                    <span className="font-medium">Auto Cleanup:</span>
                    <div>{policy.autoCleanup ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
              
              <Button
                variant={policy.enabled ? "destructive" : "default"}
                size="sm"
                onClick={() => handleTogglePolicy(policy.id, !policy.enabled)}
              >
                {policy.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // ===== MAIN RENDER =====

  if (isLoading && !cacheMetrics) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải dữ liệu cache...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Cache Manager</h2>
          <p className="text-muted-foreground">
            Quản lý multi-layer caching system với optimization tự động
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadCacheData}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleOptimizeCache}
          >
            <Settings className="h-4 w-4 mr-2" />
            Optimize
          </Button>
        </div>
      </div>

      {/* Cache Overview */}
      {renderCacheOverview()}

      {/* Performance Alert */}
      {cacheMetrics && cacheMetrics.performanceScore < 80 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Performance Warning:</strong> Cache performance score is below optimal ({cacheMetrics.performanceScore.toFixed(1)}/100). 
            Consider running cache optimization or clearing stale entries.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="layers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="layers" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Cache Layers
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Entries
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layers">
          <Card>
            <CardHeader>
              <CardTitle>Cache Layers</CardTitle>
              <CardDescription>
                Multi-layer caching system với memory, localStorage, service worker và IndexedDB
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCacheLayers()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle>Cache Entries</CardTitle>
              <CardDescription>
                Chi tiết các cache entries với thông tin hit count và expiration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCacheEntries()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Cache Policies</CardTitle>
              <CardDescription>
                Cấu hình và quản lý các cache policies với eviction strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCachePolicies()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Cache Analytics</CardTitle>
              <CardDescription>
                Phân tích hiệu suất cache và recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Cache analytics dashboard với charts và performance insights sẽ được implement với chart library.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedCacheManager;
