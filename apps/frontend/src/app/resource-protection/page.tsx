/**
 * Resource Protection Test Page
 * Page để test và demo Resource Protection features
 */

'use client';

import React, { useState } from 'react';
import { useResourceProtection } from '@/hooks';
import { ResourceAccessMonitor } from '@/components/resource-protection/resource-access-monitor';
import { UserRiskProfile } from '@/components/resource-protection/user-risk-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks';
import {
  Shield,
  Play,
  Eye,
  TestTube,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

/**
 * Resource Access Simulator Component
 */
function ResourceAccessSimulator() {
  const { trackAccess } = useResourceProtection();
  const { toast } = useToast();
  
  const [isSimulating, setIsSimulating] = useState(false);
  // Interface for simulation results
  interface SimulationResult {
    result: {
      isBlocked: boolean;
      riskScore: number;
    };
    attempt: {
      action: string;
      resourceType: string;
      resourceId: string;
    };
  }

  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  
  // Simulation parameters
  const [resourceType, setResourceType] = useState('VIDEO');
  const [action, setAction] = useState('STREAM');
  const [resourceId, setResourceId] = useState('test-resource-123');
  const [simulationCount, setSimulationCount] = useState(1);

  const handleSimulateAccess = async () => {
    setIsSimulating(true);
    const results = [];

    try {
      for (let i = 0; i < simulationCount; i++) {
        const attempt = {
          userId: 'current-user',
          resourceType,
          resourceId: `${resourceId}-${i + 1}`,
          action,
          ipAddress: `192.168.1.${100 + i}`,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          sessionToken: `test-session-${Date.now()}`,
          duration: Math.floor(Math.random() * 10000) + 1000,
          metadata: {
            simulation: true,
            timestamp: new Date().toISOString()
          }
        };

        const result = await trackAccess(attempt);
        results.push({
          attempt,
          result,
          timestamp: new Date().toISOString()
        });

        // Add small delay between requests
        if (i < simulationCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setSimulationResults(results);
      
      toast({
        title: 'Simulation hoàn thành',
        description: `Đã simulate ${simulationCount} lần truy cập tài nguyên`,
      });
    } catch (error) {
      console.error('Simulation failed:', error);
      toast({
        title: 'Lỗi simulation',
        description: 'Không thể thực hiện simulation',
        variant: 'destructive',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateHighRisk = async () => {
    setIsSimulating(true);
    const results = [];

    try {
      // Simulate high-risk activities
      const highRiskScenarios = [
        {
          resourceType: 'PDF',
          action: 'DOWNLOAD',
          userAgent: 'curl/7.68.0',
          duration: 50
        },
        {
          resourceType: 'VIDEO',
          action: 'DOWNLOAD',
          userAgent: 'wget/1.20.3',
          duration: 100
        },
        {
          resourceType: 'PDF',
          action: 'DOWNLOAD',
          userAgent: 'python-requests/2.25.1',
          duration: 25
        }
      ];

      for (let i = 0; i < highRiskScenarios.length; i++) {
        const scenario = highRiskScenarios[i];
        const attempt = {
          userId: 'current-user',
          resourceType: scenario.resourceType,
          resourceId: `high-risk-resource-${i + 1}`,
          action: scenario.action,
          ipAddress: `10.0.0.${50 + i}`,
          userAgent: scenario.userAgent,
          sessionToken: `high-risk-session-${Date.now()}`,
          duration: scenario.duration,
          metadata: {
            simulation: true,
            highRisk: true,
            timestamp: new Date().toISOString()
          }
        };

        const result = await trackAccess(attempt);
        results.push({
          attempt,
          result,
          timestamp: new Date().toISOString()
        });

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setSimulationResults(results);
      
      toast({
        title: 'High-risk simulation hoàn thành',
        description: `Đã simulate ${highRiskScenarios.length} hoạt động có rủi ro cao`,
        variant: 'destructive',
      });
    } catch (error) {
      console.error('High-risk simulation failed:', error);
      toast({
        title: 'Lỗi simulation',
        description: 'Không thể thực hiện high-risk simulation',
        variant: 'destructive',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-5 w-5" />
          <span>Resource Access Simulator</span>
        </CardTitle>
        <CardDescription>
          Simulate resource access để test anti-piracy system
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Simulation Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Resource Type</label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDEO">Video</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="COURSE">Course</SelectItem>
                <SelectItem value="EXAM">Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Action</label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEW">View</SelectItem>
                <SelectItem value="STREAM">Stream</SelectItem>
                <SelectItem value="DOWNLOAD">Download</SelectItem>
                <SelectItem value="ACCESS">Access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Resource ID</label>
            <Input
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              placeholder="test-resource-123"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Số lần simulate</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={simulationCount}
              onChange={(e) => setSimulationCount(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Simulation Buttons */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleSimulateAccess}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Simulate Normal Access
              </>
            )}
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleSimulateHighRisk}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-1" />
                Simulate High Risk
              </>
            )}
          </Button>
        </div>

        {/* Simulation Results */}
        {simulationResults.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Kết quả Simulation</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {simulationResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded-full ${result.result.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {result.result.isBlocked ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {result.attempt.action} {result.attempt.resourceType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {result.attempt.resourceId}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={result.result.riskScore > 70 ? 'destructive' : result.result.riskScore > 40 ? 'secondary' : 'default'}>
                      Risk: {result.result.riskScore}
                    </Badge>
                    {result.result.isBlocked && (
                      <Badge variant="destructive">
                        Blocked
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main Resource Protection Page
 */
export default function ResourceProtectionPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Resource Protection System</h1>
          <p className="text-gray-600">
            Anti-piracy và monitoring system để bảo vệ tài nguyên học tập
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="simulator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simulator" className="flex items-center space-x-2">
            <TestTube className="h-4 w-4" />
            <span>Simulator</span>
          </TabsTrigger>
          <TabsTrigger value="risk-profile" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Risk Profile</span>
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Access Monitor</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="mt-6">
          <ResourceAccessSimulator />
        </TabsContent>

        <TabsContent value="risk-profile" className="mt-6">
          <UserRiskProfile />
        </TabsContent>

        <TabsContent value="monitor" className="mt-6">
          <ResourceAccessMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
