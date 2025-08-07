'use client';

import { Upload, Download, Users, Shield, GraduationCap, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';

interface BulkRoleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currentRole: string;
  newRole?: string;
  selected: boolean;
}

interface BulkOperationResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{
    userId: string;
    email: string;
    error: string;
  }>;
}

const roleConfig = {
  ADMIN: {
    label: 'Quản trị viên',
    icon: Shield,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  },
  INSTRUCTOR: {
    label: 'Giảng viên',
    icon: GraduationCap,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  },
  STUDENT: {
    label: 'Học sinh',
    icon: User,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  },
  GUEST: {
    label: 'Khách',
    icon: Users,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
};

export function BulkRoleAssignment() {
  const [selectedUsers, setSelectedUsers] = useState<BulkRoleUser[]>([]);
  const [targetRole, setTargetRole] = useState<string>('');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BulkOperationResult | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const { toast } = useToast();

  // Mock users for demonstration
  const mockUsers: BulkRoleUser[] = [
    {
      id: '1',
      email: 'student1@example.com',
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      currentRole: 'STUDENT',
      selected: false
    },
    {
      id: '2',
      email: 'student2@example.com',
      firstName: 'Trần',
      lastName: 'Thị B',
      currentRole: 'STUDENT',
      selected: false
    },
    {
      id: '3',
      email: 'instructor1@example.com',
      firstName: 'Lê',
      lastName: 'Văn C',
      currentRole: 'INSTRUCTOR',
      selected: false
    }
  ];

  const handleUserSelection = (userId: string, selected: boolean) => {
    setSelectedUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, selected } : user
      )
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedUsers(prev => 
      prev.map(user => ({ ...user, selected }))
    );
  };

  const handleBulkRoleAssignment = async () => {
    const usersToUpdate = selectedUsers.filter(user => user.selected);
    
    if (usersToUpdate.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn ít nhất một người dùng',
        variant: 'destructive',
      });
      return;
    }

    if (!targetRole) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn vai trò mục tiêu',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);
      setProgress(0);
      
      // Simulate bulk operation
      const total = usersToUpdate.length;
      let success = 0;
      let failed = 0;
      const errors: BulkOperationResult['errors'] = [];

      for (let i = 0; i < usersToUpdate.length; i++) {
        const user = usersToUpdate[i];
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate some failures
        if (Math.random() > 0.8) {
          failed++;
          errors.push({
            userId: user.id,
            email: user.email,
            error: 'Không thể cập nhật vai trò'
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
        description: `Đã cập nhật ${success}/${total} người dùng thành công`,
      });

    } catch (error) {
      console.error('Error in bulk role assignment:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra trong quá trình cập nhật',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    
    // Parse CSV file (simplified)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
          return obj;
        }, {} as any);
      });
      
      setCsvPreview(preview);
    };
    
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = 'email,newRole,reason\nuser@example.com,INSTRUCTOR,Promotion to instructor\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_role_assignment_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Initialize with mock data
  useState(() => {
    setSelectedUsers(mockUsers);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gán vai trò hàng loạt
          </CardTitle>
          <CardDescription>
            Cập nhật vai trò cho nhiều người dùng cùng lúc
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="space-y-4">
            <TabsList>
              <TabsTrigger value="manual">Chọn thủ công</TabsTrigger>
              <TabsTrigger value="csv">Import từ CSV</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              {/* Role Selection */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="targetRole">Vai trò mục tiêu</Label>
                  <Select value={targetRole} onValueChange={setTargetRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleConfig).map(([role, config]) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Lý do thay đổi</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do thay đổi vai trò..."
                  />
                </div>
              </div>

              {/* User Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Chọn người dùng</h3>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedUsers.every(user => user.selected)}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label>Chọn tất cả</Label>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Vai trò hiện tại</TableHead>
                      <TableHead>Vai trò mới</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedUsers.map((user) => {
                      const currentRoleConfig = roleConfig[user.currentRole as keyof typeof roleConfig];
                      const newRoleConfig = targetRole ? roleConfig[targetRole as keyof typeof roleConfig] : null;
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={user.selected}
                              onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={currentRoleConfig.color}>
                              <currentRoleConfig.icon className="h-3 w-3 mr-1" />
                              {currentRoleConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.selected && newRoleConfig ? (
                              <Badge className={newRoleConfig.color}>
                                <newRoleConfig.icon className="h-3 w-3 mr-1" />
                                {newRoleConfig.label}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleBulkRoleAssignment}
                  disabled={processing || selectedUsers.filter(u => u.selected).length === 0 || !targetRole}
                >
                  {processing ? 'Đang xử lý...' : 'Cập nhật vai trò'}
                </Button>
              </div>

              {/* Progress */}
              {processing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Đang xử lý...</span>
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
                      Kết quả cập nhật
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
                              {error.email}: {error.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="csv" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Tải template CSV
                  </Button>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                    />
                  </div>
                </div>

                {csvPreview.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Xem trước dữ liệu CSV</CardTitle>
                      <CardDescription>
                        Hiển thị 5 dòng đầu tiên của file CSV
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(csvPreview[0] || {}).map(header => (
                              <TableHead key={header}>{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvPreview.map((row, index) => (
                            <TableRow key={index}>
                              {Object.values(row).map((value: any, cellIndex) => (
                                <TableCell key={cellIndex}>{value}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
