/**
 * Admin Theory Management Dashboard
 * Trang quản lý lý thuyết LaTeX cho admin
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import {
  FileCode,
  BarChart3,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  HardDrive
} from 'lucide-react';

import { TheoryAdminStatistics } from '@/lib/types/admin/theory';
import { FileManager } from '@/components/admin/theory/FileManager';
import { LatexEditor } from '@/components/admin/theory/LatexEditor';
import { BatchOperations } from '@/components/admin/theory/BatchOperations';
import { TemplateManager } from '@/components/admin/theory/TemplateManager';

/**
 * Mock data cho development
 * Sẽ được thay thế bằng real API calls
 */
const mockStatistics: TheoryAdminStatistics = {
  filesByGrade: {
    'LỚP 10': 26,
    'LỚP 11': 33,
    'LỚP 12': 19,
  },
  totalFiles: 78,
  parsedFiles: 65,
  errorFiles: 3,
  pendingFiles: 10,
  totalWordCount: 125000,
  totalSections: 450,
  totalMathFormulas: 2800,
  averageParseTime: 150,
  lastParseTime: new Date(),
  totalStorageSize: 15 * 1024 * 1024, // 15MB
  backupStorageSize: 5 * 1024 * 1024,  // 5MB
};

/**
 * Statistics Card Component
 */
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

function StatCard({ title, value, description, icon, className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Grade Statistics Component
 */
function GradeStatistics({ statistics }: { statistics: TheoryAdminStatistics }) {
  const grades = Object.entries(statistics.filesByGrade);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Thống kê theo lớp
        </CardTitle>
        <CardDescription>
          Phân bố files LaTeX theo từng lớp học
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {grades.map(([grade, count]) => {
          const percentage = (count / statistics.totalFiles) * 100;
          return (
            <div key={grade} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{grade}</span>
                <span className="text-muted-foreground">{count} files ({percentage.toFixed(1)}%)</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Legacy BulkOperations component removed - replaced by BatchOperations

/**
 * Main Admin Theory Dashboard Component
 */
export default function AdminTheoryPage() {
  const [statistics] = useState<TheoryAdminStatistics>(mockStatistics);
  const [isLoading, setIsLoading] = useState(false);

  // Format file size
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Calculate parse success rate
  const parseSuccessRate = (statistics.parsedFiles / statistics.totalFiles) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Lý thuyết LaTeX</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi 78 files LaTeX (26 lớp 10 + 33 lớp 11 + 19 lớp 12)
          </p>
        </div>
        <Button 
          onClick={() => setIsLoading(true)}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Files"
          value={statistics.totalFiles}
          description="LaTeX files across all grades"
          icon={<FileCode className="h-4 w-4 text-muted-foreground" />}
        />
        
        <StatCard
          title="Parse Success Rate"
          value={`${parseSuccessRate.toFixed(1)}%`}
          description={`${statistics.parsedFiles}/${statistics.totalFiles} parsed`}
          icon={<CheckCircle className="h-4 w-4 text-green-600" />}
        />
        
        <StatCard
          title="Parse Errors"
          value={statistics.errorFiles}
          description="Files with parsing errors"
          icon={<AlertCircle className="h-4 w-4 text-red-600" />}
        />
        
        <StatCard
          title="Storage Used"
          value={formatFileSize(statistics.totalStorageSize)}
          description={`Backup: ${formatFileSize(statistics.backupStorageSize)}`}
          icon={<HardDrive className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">File Manager</TabsTrigger>
          <TabsTrigger value="editor">LaTeX Editor</TabsTrigger>
          <TabsTrigger value="operations">Batch Operations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <GradeStatistics statistics={statistics} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Content Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Words</span>
                  <span className="font-medium">{statistics.totalWordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Sections</span>
                  <span className="font-medium">{statistics.totalSections}</span>
                </div>
                <div className="flex justify-between">
                  <span>Math Formulas</span>
                  <span className="font-medium">{statistics.totalMathFormulas}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Parse Time</span>
                  <span className="font-medium">{statistics.averageParseTime}ms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <FileManager />
        </TabsContent>

        <TabsContent value="editor">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">LaTeX Editor</h3>
                <p className="text-sm text-muted-foreground">
                  Edit LaTeX files với syntax highlighting và live preview
                </p>
              </div>
            </div>

            <LatexEditor
              initialContent={`\\section{MỆNH ĐỀ}

Trong toán học, \\indam{mệnh đề} là một câu khẳng định có thể xác định được tính đúng sai.

\\begin{boxkn}
\\textbf{Định nghĩa:} Mệnh đề là một câu khẳng định có thể xác định được tính đúng hoặc sai của nó, nhưng không thể vừa đúng vừa sai.
\\end{boxkn}

\\subsection{Ví dụ về mệnh đề}

\\begin{vd}
Các câu sau đây là mệnh đề:
\\begin{itemize}
\\item[\\iconMT] $2 + 3 = 5$ (mệnh đề đúng)
\\item[\\iconMT] $\\pi > 4$ (mệnh đề sai)
\\item[\\iconMT] Hà Nội là thủ đô của Việt Nam (mệnh đề đúng)
\\end{itemize}
\\end{vd}`}
              fileName="sample-chapter.tex"
              height="500px"
              onContentChange={(content) => {
                console.log('Content changed:', content.length, 'characters');
              }}
              onSave={async (content) => {
                console.log('Saving content:', content.length, 'characters');
                // Simulate save delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('Content saved successfully');
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Batch Operations</h3>
                <p className="text-sm text-muted-foreground">
                  Thực hiện operations trên nhiều files với real-time progress tracking
                </p>
              </div>
            </div>

            <BatchOperations
              onOperationComplete={(result) => {
                console.log('Operation completed:', result);
                // TODO: Update statistics hoặc refresh data
              }}
              showAdvancedOptions={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Template Management</h3>
                <p className="text-sm text-muted-foreground">
                  Quản lý LaTeX templates, custom commands và styling configuration
                </p>
              </div>
            </div>

            <TemplateManager />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
