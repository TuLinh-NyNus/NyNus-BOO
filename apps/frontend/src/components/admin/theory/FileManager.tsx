/**
 * Theory File Manager Component
 * Component quản lý files LaTeX cho admin
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FolderOpen, 
  FileText, 
  Upload, 
  Download,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Clock,
  FileCode
} from 'lucide-react';

import { TheoryFileAdminInfo, TheoryDirectoryAdminInfo, TheoryFileStatus } from '@/lib/types/admin/theory';

/**
 * Mock data cho development
 */
const mockDirectories: TheoryDirectoryAdminInfo[] = [
  {
    name: 'LỚP 10',
    path: '/content/TOÁN/LỚP 10',
    grade: 'LỚP 10',
    totalFiles: 26,
    parsedFiles: 24,
    errorFiles: 2,
    totalWordCount: 45000,
    totalSections: 150,
    canUpload: true,
    canCreateFolder: false,
  },
  {
    name: 'LỚP 11',
    path: '/content/TOÁN/LỚP 11',
    grade: 'LỚP 11',
    totalFiles: 33,
    parsedFiles: 30,
    errorFiles: 1,
    totalWordCount: 58000,
    totalSections: 180,
    canUpload: true,
    canCreateFolder: false,
  },
  {
    name: 'LỚP 12',
    path: '/content/TOÁN/LỚP 12',
    grade: 'LỚP 12',
    totalFiles: 19,
    parsedFiles: 18,
    errorFiles: 0,
    totalWordCount: 35000,
    totalSections: 120,
    canUpload: true,
    canCreateFolder: false,
  },
];

const mockFiles: TheoryFileAdminInfo[] = [
  {
    fileName: 'Chapter1-1.tex',
    filePath: '/content/TOÁN/LỚP 10/Chapter1-1.tex',
    grade: 'LỚP 10',
    subject: 'TOÁN',
    chapter: 'Chapter 1',
    status: 'parsed',
    canEdit: true,
    canDelete: true,
    canRename: true,
    wordCount: 1200,
    sectionCount: 5,
    mathFormulaCount: 25,
    hasBackup: true,
    backupCount: 3,
    parsedAt: new Date(),
    lastModified: new Date(),
    size: 15000,
  },
  {
    fileName: 'Chapter1-2.tex',
    filePath: '/content/TOÁN/LỚP 10/Chapter1-2.tex',
    grade: 'LỚP 10',
    subject: 'TOÁN',
    chapter: 'Chapter 1',
    status: 'error',
    parseError: 'Invalid LaTeX command: \\unknowncommand',
    canEdit: true,
    canDelete: true,
    canRename: true,
    wordCount: 980,
    sectionCount: 4,
    mathFormulaCount: 18,
    hasBackup: true,
    backupCount: 2,
    lastModified: new Date(),
    size: 12000,
  },
  // Add more mock files...
];

/**
 * File Status Icon Component
 */
function FileStatusIcon({ status }: { status: TheoryFileStatus }) {
  switch (status) {
    case 'parsed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case 'parsing':
      return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
    case 'outdated':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return <FileCode className="h-4 w-4 text-gray-400" />;
  }
}

/**
 * File Status Badge Component
 */
function FileStatusBadge({ status }: { status: TheoryFileStatus }) {
  const variants = {
    parsed: 'default',
    error: 'destructive',
    parsing: 'secondary',
    outdated: 'outline',
    not_parsed: 'outline',
  } as const;

  const labels = {
    parsed: 'Parsed',
    error: 'Error',
    parsing: 'Parsing',
    outdated: 'Outdated',
    not_parsed: 'Not Parsed',
  };

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  );
}

/**
 * Directory Tree Component
 */
function DirectoryTree({ 
  directories, 
  selectedDirectory, 
  onDirectorySelect 
}: {
  directories: TheoryDirectoryAdminInfo[];
  selectedDirectory: string;
  onDirectorySelect: (path: string) => void;
}) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/content/TOÁN']));

  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Directory Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Root TOÁN folder */}
          <div 
            className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted"
            onClick={() => toggleDirectory('/content/TOÁN')}
          >
            {expandedDirs.has('/content/TOÁN') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <FolderOpen className="h-4 w-4" />
            <span className="font-medium">TOÁN</span>
          </div>

          {/* Grade directories */}
          {expandedDirs.has('/content/TOÁN') && directories.map((dir) => (
            <div 
              key={dir.path}
              className={`ml-6 flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted ${
                selectedDirectory === dir.path ? 'bg-muted' : ''
              }`}
              onClick={() => onDirectorySelect(dir.path)}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span>{dir.name}</span>
                <Badge variant="outline" className="text-xs">
                  {dir.totalFiles} files
                </Badge>
              </div>
              
              <div className="flex items-center gap-1">
                {dir.errorFiles > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {dir.errorFiles} errors
                  </Badge>
                )}
                <Badge variant="default" className="text-xs">
                  {dir.parsedFiles}/{dir.totalFiles}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * File List Component
 */
function FileList({ 
  files, 
  onFileSelect,
  onFileAction 
}: {
  files: TheoryFileAdminInfo[];
  onFileSelect: (file: TheoryFileAdminInfo) => void;
  onFileAction: (action: string, file: TheoryFileAdminInfo) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFiles = files.filter(file => 
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.chapter?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Files
        </CardTitle>
        <CardDescription>
          {filteredFiles.length} files {searchTerm && `(filtered from ${files.length})`}
        </CardDescription>
        
        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <div 
              key={file.filePath}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
              onClick={() => onFileSelect(file)}
            >
              <div className="flex items-center gap-3">
                <FileStatusIcon status={file.status} />
                <div>
                  <div className="font-medium">{file.fileName}</div>
                  <div className="text-sm text-muted-foreground">
                    {file.chapter} • {formatFileSize(file.size || 0)} • {file.wordCount} words
                  </div>
                  {file.parseError && (
                    <div className="text-xs text-red-600 mt-1">
                      Error: {file.parseError}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FileStatusBadge status={file.status} />
                
                <div className="flex items-center gap-1">
                  {file.canEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileAction('edit', file);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileAction('download', file);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {file.canDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileAction('delete', file);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main File Manager Component
 */
export function FileManager() {
  const [selectedDirectory, setSelectedDirectory] = useState('/content/TOÁN/LỚP 10');
  const [files] = useState<TheoryFileAdminInfo[]>(mockFiles);

  const handleDirectorySelect = (path: string) => {
    setSelectedDirectory(path);
    // Load files for selected directory
    // In real implementation, this would fetch from API
  };

  const handleFileSelect = (file: TheoryFileAdminInfo) => {
    console.log('Selected file:', file);
    // Handle file selection
  };

  const handleFileAction = (action: string, file: TheoryFileAdminInfo) => {
    console.log('File action:', action, file);
    // Handle file actions (edit, delete, download, etc.)
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Directory Tree - 1/3 width */}
      <div className="md:col-span-1">
        <DirectoryTree
          directories={mockDirectories}
          selectedDirectory={selectedDirectory}
          onDirectorySelect={handleDirectorySelect}
        />
      </div>
      
      {/* File List - 2/3 width */}
      <div className="md:col-span-2">
        <FileList
          files={files}
          onFileSelect={handleFileSelect}
          onFileAction={handleFileAction}
        />
      </div>
    </div>
  );
}
