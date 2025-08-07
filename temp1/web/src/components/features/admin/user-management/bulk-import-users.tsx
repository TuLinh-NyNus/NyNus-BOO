'use client';

import { Upload, Download, FileText, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';
import { useState, useRef } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';

interface ImportUser {
  row: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password?: string;
  isActive?: boolean;
  errors: string[];
  warnings: string[];
}

interface ImportResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
}

const REQUIRED_COLUMNS = ['email', 'firstName', 'lastName', 'role'];
const VALID_ROLES = ['ADMIN', 'INSTRUCTOR', 'STUDENT', 'GUEST'];

export function BulkImportUsers() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<ImportUser[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Lỗi',
        description: 'Chỉ hỗ trợ file CSV và Excel (.xlsx)',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setValidationErrors(['File phải có ít nhất 1 dòng dữ liệu (ngoài header)']);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col.toLowerCase()));
      
      if (missingColumns.length > 0) {
        setValidationErrors([`Thiếu các cột bắt buộc: ${missingColumns.join(', ')}`]);
        return;
      }

      const users: ImportUser[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const user: ImportUser = {
          row: i + 1,
          email: '',
          firstName: '',
          lastName: '',
          role: '',
          errors: [],
          warnings: []
        };

        // Map values to user object
        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'email':
              user.email = value;
              break;
            case 'firstname':
              user.firstName = value;
              break;
            case 'lastname':
              user.lastName = value;
              break;
            case 'role':
              user.role = value.toUpperCase();
              break;
            case 'password':
              user.password = value;
              break;
            case 'isactive':
              user.isActive = value.toLowerCase() === 'true';
              break;
          }
        });

        // Validate user data
        validateUser(user);
        users.push(user);
      }

      setParsedData(users);
      setValidationErrors(errors);
    };

    reader.readAsText(file);
  };

  const validateUser = (user: ImportUser) => {
    // Email validation
    if (!user.email) {
      user.errors.push('Email là bắt buộc');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      user.errors.push('Email không hợp lệ');
    }

    // Name validation
    if (!user.firstName) {
      user.errors.push('Tên là bắt buộc');
    }
    if (!user.lastName) {
      user.errors.push('Họ là bắt buộc');
    }

    // Role validation
    if (!user.role) {
      user.errors.push('Vai trò là bắt buộc');
    } else if (!VALID_ROLES.includes(user.role)) {
      user.errors.push(`Vai trò không hợp lệ. Chỉ chấp nhận: ${VALID_ROLES.join(', ')}`);
    }

    // Password warning
    if (!user.password) {
      user.warnings.push('Không có mật khẩu, sẽ tạo mật khẩu mặc định');
    }
  };

  const handleImport = async () => {
    const validUsers = parsedData.filter(user => user.errors.length === 0);
    
    if (validUsers.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Không có dữ liệu hợp lệ để import',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);
      setProgress(0);

      // Simulate import process
      const total = validUsers.length;
      let success = 0;
      let failed = 0;
      const errors: ImportResult['errors'] = [];

      for (let i = 0; i < validUsers.length; i++) {
        const user = validUsers[i];
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Simulate some failures
        if (Math.random() > 0.9) {
          failed++;
          errors.push({
            row: user.row,
            email: user.email,
            error: 'Email đã tồn tại trong hệ thống'
          });
        } else {
          success++;
        }
        
        setProgress(((i + 1) / total) * 100);
      }

      setResult({
        success,
        failed,
        total,
        errors
      });

      toast({
        title: 'Hoàn thành',
        description: `Đã import ${success}/${total} người dùng thành công`,
      });

    } catch (error) {
      console.error('Error importing users:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra trong quá trình import',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'email,firstName,lastName,role,password,isActive\nuser@example.com,John,Doe,STUDENT,password123,true\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validUsers = parsedData.filter(user => user.errors.length === 0);
  const invalidUsers = parsedData.filter(user => user.errors.length > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import người dùng hàng loạt
          </CardTitle>
          <CardDescription>
            Upload file CSV hoặc Excel để tạo nhiều tài khoản cùng lúc
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Tải template CSV
            </Button>
            <p className="text-sm text-muted-foreground">
              Tải file mẫu để xem định dạng dữ liệu yêu cầu
            </p>
          </div>

          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Kéo thả file vào đây hoặc click để chọn
              </p>
              <p className="text-sm text-muted-foreground">
                Hỗ trợ file CSV và Excel (.xlsx)
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Chọn file
              </Button>
            </div>
          </div>

          {/* File Info */}
          {file && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={resetImport}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Lỗi validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">
                      • {error}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Data Summary */}
          {parsedData.length > 0 && validationErrors.length === 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{validUsers.length}</div>
                  <div className="text-sm text-muted-foreground">Hợp lệ</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{invalidUsers.length}</div>
                  <div className="text-sm text-muted-foreground">Lỗi</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{parsedData.length}</div>
                  <div className="text-sm text-muted-foreground">Tổng cộng</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          {parsedData.length > 0 && validationErrors.length === 0 && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setPreviewDialog(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem trước dữ liệu
              </Button>
              <Button
                onClick={handleImport}
                disabled={processing || validUsers.length === 0}
              >
                {processing ? 'Đang import...' : `Import ${validUsers.length} người dùng`}
              </Button>
            </div>
          )}

          {/* Progress */}
          {processing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Đang import...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Kết quả import
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.success}</div>
                    <div className="text-sm text-muted-foreground">Thành công</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                    <div className="text-sm text-muted-foreground">Thất bại</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{result.total}</div>
                    <div className="text-sm text-muted-foreground">Tổng cộng</div>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      Lỗi chi tiết:
                    </h4>
                    <div className="space-y-1">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600">
                          Dòng {error.row} - {error.email}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Xem trước dữ liệu import</DialogTitle>
            <DialogDescription>
              Kiểm tra dữ liệu trước khi import vào hệ thống
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {validUsers.length > 0 && (
              <div>
                <h4 className="font-medium text-green-600 mb-2">
                  Dữ liệu hợp lệ ({validUsers.length})
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dòng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Cảnh báo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validUsers.slice(0, 10).map((user) => (
                      <TableRow key={user.row}>
                        <TableCell>{user.row}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.warnings.map((warning, index) => (
                            <div key={index} className="text-sm text-amber-600">
                              {warning}
                            </div>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {validUsers.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Hiển thị 10/{validUsers.length} dòng đầu tiên
                  </p>
                )}
              </div>
            )}

            {invalidUsers.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2">
                  Dữ liệu có lỗi ({invalidUsers.length})
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dòng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Lỗi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invalidUsers.slice(0, 10).map((user) => (
                      <TableRow key={user.row}>
                        <TableCell>{user.row}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>
                          {user.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-600">
                              • {error}
                            </div>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {invalidUsers.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Hiển thị 10/{invalidUsers.length} dòng đầu tiên
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
