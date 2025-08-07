'use client';

import { Upload, Camera, Save, X, User, Settings, BookOpen, Target } from 'lucide-react';
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
  Switch
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { AdminUser } from '@/lib/api/admin-users.service';

interface AdvancedProfileManagerProps {
  user: AdminUser;
  onProfileUpdated: (updatedUser: AdminUser) => void;
}

interface ProfileFormData {
  bio: string;
  phoneNumber: string;
  address: string;
  birthDate: string;
  website: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    linkedin: string;
    github: string;
  };
  preferences: {
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  };
  learningSettings: {
    learningStyle: string;
    difficultyLevel: string;
    studyGoals: string[];
    weeklyTarget: number;
    reminderTime: string;
  };
}

const learningStyles = [
  { value: 'visual', label: 'Học qua hình ảnh' },
  { value: 'auditory', label: 'Học qua âm thanh' },
  { value: 'kinesthetic', label: 'Học qua thực hành' },
  { value: 'reading', label: 'Học qua đọc viết' },
];

const difficultyLevels = [
  { value: 'beginner', label: 'Người mới bắt đầu' },
  { value: 'intermediate', label: 'Trung cấp' },
  { value: 'advanced', label: 'Nâng cao' },
  { value: 'expert', label: 'Chuyên gia' },
];

const studyGoalOptions = [
  'Nâng cao kỹ năng nghề nghiệp',
  'Chuẩn bị cho kỳ thi',
  'Học để sở thích',
  'Chuyển đổi nghề nghiệp',
  'Cập nhật kiến thức mới',
  'Phát triển bản thân',
];

export function AdvancedProfileManager({ user, onProfileUpdated }: AdvancedProfileManagerProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    bio: user.profile?.bio || '',
    phoneNumber: user.profile?.phoneNumber || '',
    address: '',
    birthDate: '',
    website: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      github: '',
    },
    preferences: {
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
    },
    learningSettings: {
      learningStyle: 'visual',
      difficultyLevel: 'beginner',
      studyGoals: [],
      weeklyTarget: 5,
      reminderTime: '19:00',
    },
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user.profile?.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi',
        description: 'Chỉ chấp nhận file hình ảnh',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Lỗi',
        description: 'File không được vượt quá 5MB',
        variant: 'destructive',
      });
      return;
    }

    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStudyGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      learningSettings: {
        ...prev.learningSettings,
        studyGoals: prev.learningSettings.studyGoals.includes(goal)
          ? prev.learningSettings.studyGoals.filter(g => g !== goal)
          : [...prev.learningSettings.studyGoals, goal]
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Simulate API call for avatar upload
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        // In real implementation, upload to cloud storage
        await new Promise(resolve => setTimeout(resolve, 1000));
        avatarUrl = `https://example.com/avatars/${user.id}.jpg`;
      }

      // Simulate API call for profile update
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser: AdminUser = {
        ...user,
        profile: {
          ...user.profile,
          bio: formData.bio,
          phoneNumber: formData.phoneNumber,
          avatarUrl,
          completionRate: user.profile?.completionRate || 0,
        }
      };

      onProfileUpdated(updatedUser);

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin profile',
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Quản lý profile nâng cao
          </CardTitle>
          <CardDescription>
            Cập nhật thông tin chi tiết và cài đặt cho {user.firstName} {user.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="preferences">Tùy chọn</TabsTrigger>
              <TabsTrigger value="learning">Học tập</TabsTrigger>
              <TabsTrigger value="social">Mạng xã hội</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Avatar Upload */}
              <div className="space-y-4">
                <Label>Ảnh đại diện</Label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Cập nhật ảnh đại diện</p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG hoặc GIF. Tối đa 5MB.
                    </p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleAvatarSelect(e.target.files[0])}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Chọn file
                    </Button>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bio">Tiểu sử</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Giới thiệu về bản thân..."
                    rows={4}
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Số điện thoại</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="0123456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Ngày sinh</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Địa chỉ của bạn..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cài đặt chung</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Ngôn ngữ</Label>
                    <Select
                      value={formData.preferences.language}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, language: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Múi giờ</Label>
                    <Select
                      value={formData.preferences.timezone}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, timezone: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Bangkok">Bangkok (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Thông báo</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email thông báo</Label>
                        <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={formData.preferences.emailNotifications}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, emailNotifications: checked }
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
                        checked={formData.preferences.pushNotifications}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, pushNotifications: checked }
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
                        checked={formData.preferences.marketingEmails}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, marketingEmails: checked }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="learning" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Phong cách học tập
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="learningStyle">Cách học ưa thích</Label>
                    <Select
                      value={formData.learningSettings.learningStyle}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        learningSettings: { ...prev.learningSettings, learningStyle: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {learningStyles.map(style => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficultyLevel">Mức độ khó</Label>
                    <Select
                      value={formData.learningSettings.difficultyLevel}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        learningSettings: { ...prev.learningSettings, difficultyLevel: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Mục tiêu học tập
                  </h3>
                  
                  <div className="space-y-2">
                    <Label>Mục tiêu học tập</Label>
                    <div className="space-y-2">
                      {studyGoalOptions.map(goal => (
                        <div key={goal} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={goal}
                            checked={formData.learningSettings.studyGoals.includes(goal)}
                            onChange={() => handleStudyGoalToggle(goal)}
                            className="rounded"
                          />
                          <Label htmlFor={goal} className="text-sm">{goal}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weeklyTarget">Mục tiêu hàng tuần (giờ)</Label>
                    <Input
                      id="weeklyTarget"
                      type="number"
                      min="1"
                      max="40"
                      value={formData.learningSettings.weeklyTarget}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        learningSettings: { ...prev.learningSettings, weeklyTarget: parseInt(e.target.value) || 0 }
                      }))}
                    />
                    <Progress value={(formData.learningSettings.weeklyTarget / 40) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminderTime">Thời gian nhắc nhở</Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={formData.learningSettings.reminderTime}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        learningSettings: { ...prev.learningSettings, reminderTime: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Liên kết mạng xã hội</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.socialLinks.facebook}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                      }))}
                      placeholder="https://facebook.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                      }))}
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                      }))}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={formData.socialLinks.github}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, github: e.target.value }
                      }))}
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-6">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
