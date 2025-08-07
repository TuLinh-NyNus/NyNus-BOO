'use client';

import { Send, Mail, Bell, MessageSquare, Users, Eye, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { useToast } from '@/hooks/use-toast';
import { AdminUser } from '@/lib/api/admin-users.service';

interface CommunicationToolsProps {
  user: AdminUser;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'EMAIL' | 'PUSH' | 'SMS';
  category: string;
}

interface SentMessage {
  id: string;
  type: 'EMAIL' | 'PUSH' | 'SMS';
  subject: string;
  content: string;
  sentAt: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  recipient: string;
}

const notificationTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Chào mừng người dùng mới',
    subject: 'Chào mừng bạn đến với NyNus!',
    content: 'Xin chào {{firstName}}, chào mừng bạn đến với nền tảng học tập NyNus...',
    type: 'EMAIL',
    category: 'Welcome',
  },
  {
    id: '2',
    name: 'Nhắc nhở hoàn thành khóa học',
    subject: 'Đừng quên hoàn thành khóa học của bạn',
    content: 'Bạn đã học được {{progress}}% khóa học {{courseName}}...',
    type: 'EMAIL',
    category: 'Reminder',
  },
  {
    id: '3',
    name: 'Thông báo khóa học mới',
    subject: 'Khóa học mới dành cho bạn',
    content: 'Chúng tôi có khóa học mới phù hợp với sở thích của bạn...',
    type: 'PUSH',
    category: 'Promotion',
  },
];

const sentMessages: SentMessage[] = [
  {
    id: '1',
    type: 'EMAIL',
    subject: 'Chào mừng bạn đến với NyNus!',
    content: 'Xin chào John, chào mừng bạn đến với nền tảng học tập NyNus...',
    sentAt: '2024-06-15T10:30:00Z',
    status: 'READ',
    recipient: 'john@example.com',
  },
  {
    id: '2',
    type: 'PUSH',
    subject: 'Nhắc nhở học tập',
    content: 'Bạn chưa truy cập khóa học trong 3 ngày...',
    sentAt: '2024-06-14T19:00:00Z',
    status: 'DELIVERED',
    recipient: 'Push notification',
  },
];

const statusColors = {
  SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  READ: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export function CommunicationTools({ user }: CommunicationToolsProps) {
  const [messageForm, setMessageForm] = useState({
    type: 'EMAIL' as 'EMAIL' | 'PUSH' | 'SMS',
    subject: '',
    content: '',
    template: '',
    scheduleDate: '',
    scheduleTime: '',
  });
  const [previewDialog, setPreviewDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    courseReminders: true,
    systemUpdates: true,
  });
  const { toast } = useToast();

  const handleTemplateSelect = (templateId: string) => {
    const template = notificationTemplates.find(t => t.id === templateId);
    if (template) {
      setMessageForm(prev => ({
        ...prev,
        template: templateId,
        subject: template.subject,
        content: template.content,
        type: template.type,
      }));
    }
  };

  const handleSendMessage = async () => {
    if (!messageForm.subject || !messageForm.content) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập đầy đủ tiêu đề và nội dung',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSending(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Thành công',
        description: `Đã gửi ${messageForm.type.toLowerCase()} đến ${user.firstName} ${user.lastName}`,
      });

      // Reset form
      setMessageForm({
        type: 'EMAIL',
        subject: '',
        content: '',
        template: '',
        scheduleDate: '',
        scheduleTime: '',
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi tin nhắn',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleUpdateNotificationSettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật cài đặt thông báo',
      });

    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật cài đặt',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const processContent = (content: string) => {
    return content
      .replace(/\{\{firstName\}\}/g, user.firstName)
      .replace(/\{\{lastName\}\}/g, user.lastName)
      .replace(/\{\{email\}\}/g, user.email);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Công cụ giao tiếp
          </CardTitle>
          <CardDescription>
            Gửi thông báo và quản lý cài đặt giao tiếp cho {user.firstName} {user.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="send" className="space-y-4">
            <TabsList>
              <TabsTrigger value="send">Gửi tin nhắn</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
              <TabsTrigger value="settings">Cài đặt</TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="messageType">Loại tin nhắn</Label>
                    <Select
                      value={messageForm.type}
                      onValueChange={(value: 'EMAIL' | 'PUSH' | 'SMS') => 
                        setMessageForm(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMAIL">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </div>
                        </SelectItem>
                        <SelectItem value="PUSH">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Push Notification
                          </div>
                        </SelectItem>
                        <SelectItem value="SMS">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            SMS
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template">Template (tùy chọn)</Label>
                    <Select
                      value={messageForm.template}
                      onValueChange={handleTemplateSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTemplates
                          .filter(t => t.type === messageForm.type)
                          .map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Tiêu đề</Label>
                    <Input
                      id="subject"
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Nhập tiêu đề tin nhắn..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Nội dung</Label>
                    <Textarea
                      id="content"
                      value={messageForm.content}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Nhập nội dung tin nhắn..."
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Có thể sử dụng: {'{'}{'{'} firstName {'}'}{'}'},  {'{'}{'{'} lastName {'}'}{'}'},  {'{'}{'{'} email {'}'}{'}'} 
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Lên lịch gửi (tùy chọn)</Label>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <Label htmlFor="scheduleDate" className="text-sm">Ngày</Label>
                        <Input
                          id="scheduleDate"
                          type="date"
                          value={messageForm.scheduleDate}
                          onChange={(e) => setMessageForm(prev => ({ ...prev, scheduleDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="scheduleTime" className="text-sm">Giờ</Label>
                        <Input
                          id="scheduleTime"
                          type="time"
                          value={messageForm.scheduleTime}
                          onChange={(e) => setMessageForm(prev => ({ ...prev, scheduleTime: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Thông tin người nhận</Label>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{user.firstName} {user.lastName}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Email: {user.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Vai trò: {user.role}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Xem trước</Label>
                    <div className="p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="font-medium">{messageForm.subject || 'Chưa có tiêu đề'}</div>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {processContent(messageForm.content) || 'Chưa có nội dung'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setPreviewDialog(true)}
                  disabled={!messageForm.subject || !messageForm.content}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem trước đầy đủ
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !messageForm.subject || !messageForm.content}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Đang gửi...' : messageForm.scheduleDate ? 'Lên lịch gửi' : 'Gửi ngay'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Lịch sử tin nhắn ({sentMessages.length})
                </h3>
              </div>

              {sentMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có tin nhắn nào được gửi</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại</TableHead>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Người nhận</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thời gian gửi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {message.type === 'EMAIL' && <Mail className="h-4 w-4" />}
                            {message.type === 'PUSH' && <Bell className="h-4 w-4" />}
                            {message.type === 'SMS' && <MessageSquare className="h-4 w-4" />}
                            <span>{message.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{message.subject}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {message.content}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{message.recipient}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[message.status]}>
                            {message.status === 'SENT' && 'Đã gửi'}
                            {message.status === 'DELIVERED' && 'Đã nhận'}
                            {message.status === 'READ' && 'Đã đọc'}
                            {message.status === 'FAILED' && 'Thất bại'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatDate(message.sentAt)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cài đặt thông báo</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email thông báo</Label>
                      <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        emailNotifications: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Push notifications</Label>
                      <p className="text-sm text-muted-foreground">Thông báo trên trình duyệt</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        pushNotifications: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">SMS thông báo</Label>
                      <p className="text-sm text-muted-foreground">Nhận thông báo qua SMS</p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        smsNotifications: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingEmails">Email marketing</Label>
                      <p className="text-sm text-muted-foreground">Nhận email khuyến mãi</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        marketingEmails: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="courseReminders">Nhắc nhở khóa học</Label>
                      <p className="text-sm text-muted-foreground">Nhắc nhở về tiến độ học tập</p>
                    </div>
                    <Switch
                      id="courseReminders"
                      checked={notificationSettings.courseReminders}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        courseReminders: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemUpdates">Cập nhật hệ thống</Label>
                      <p className="text-sm text-muted-foreground">Thông báo về cập nhật và bảo trì</p>
                    </div>
                    <Switch
                      id="systemUpdates"
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        systemUpdates: checked
                      }))}
                    />
                  </div>
                </div>

                <Button onClick={handleUpdateNotificationSettings}>
                  Lưu cài đặt
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xem trước tin nhắn</DialogTitle>
            <DialogDescription>
              Kiểm tra nội dung trước khi gửi
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {messageForm.type === 'EMAIL' && <Mail className="h-5 w-5" />}
                  {messageForm.type === 'PUSH' && <Bell className="h-5 w-5" />}
                  {messageForm.type === 'SMS' && <MessageSquare className="h-5 w-5" />}
                  <span className="font-medium">{messageForm.type}</span>
                </div>
                <div className="text-lg font-semibold">{messageForm.subject}</div>
                <div className="whitespace-pre-wrap">{processContent(messageForm.content)}</div>
                {messageForm.scheduleDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Lên lịch gửi: {messageForm.scheduleDate} {messageForm.scheduleTime}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialog(false)}>
              Đóng
            </Button>
            <Button onClick={() => {
              setPreviewDialog(false);
              handleSendMessage();
            }}>
              <Send className="h-4 w-4 mr-2" />
              Gửi tin nhắn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
