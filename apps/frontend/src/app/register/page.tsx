'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone, School, Calendar, MapPin, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { BackendHealthAlert } from '@/components/features/auth/BackendHealthIndicator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { authService, AuthService } from '@/services/grpc/auth.service';
import { convertProtobufRegisterResponse } from '@/lib/utils/protobuf-converters';

interface FormData {
  // Step 1: Account
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  
  // Step 2: Personal Info
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  
  // Step 3: Education
  role: string;
  school: string;
  level?: number;
  address: string;
  bio: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    role: 'STUDENT',
    school: '',
    level: 10,
    address: '',
    bio: ''
  });

  const steps = [
    { id: 1, title: 'Tài khoản', description: 'Thông tin đăng nhập' },
    { id: 2, title: 'Cá nhân', description: 'Thông tin cơ bản' },
    { id: 3, title: 'Học vấn', description: 'Trình độ học vấn' }
  ];

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.username) {
          setError('Vui lòng điền đầy đủ thông tin');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Email không hợp lệ');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Mật khẩu xác nhận không khớp');
          return false;
        }
        if (formData.username.length < 3) {
          setError('Username phải có ít nhất 3 ký tự');
          return false;
        }
        break;
      case 2:
        if (!formData.fullName || !formData.phone || !formData.dateOfBirth || !formData.gender) {
          setError('Vui lòng điền đầy đủ thông tin');
          return false;
        }
        if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
          setError('Số điện thoại không hợp lệ');
          return false;
        }
        break;
      case 3:
        if (!formData.role || !formData.school) {
          setError('Vui lòng điền đầy đủ thông tin');
          return false;
        }
        if ((formData.role === 'STUDENT' || formData.role === 'TUTOR' || formData.role === 'TEACHER') && !formData.level) {
          setError('Vui lòng chọn cấp độ');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setError('');
    setLoading(true);

    try {
      // Call backend register API
      const protobufResponse = await authService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.fullName.split(' ')[0] || '',
        lastName: formData.fullName.split(' ').slice(1).join(' ') || ''
      });

      const response = convertProtobufRegisterResponse(protobufResponse);

      if (response.success) {
        toast({
          title: 'Đăng ký thành công!',
          description: 'Vui lòng kiểm tra email để xác thực tài khoản.',
        });
        
        // Auto login after successful registration
        try {
          const loginResult = await AuthService.login(formData.email, formData.password);
          
          // gRPC LoginResponse uses getters, tokens are auto-saved by AuthService
          if (loginResult.getAccessToken() && loginResult.getUser()) {
            // Store user info - convert protobuf to plain object
            if (typeof window !== 'undefined') {
              const userObj = loginResult.getUser()?.toObject();
              localStorage.setItem('nynus-user', JSON.stringify(userObj));
            }
            
            router.push('/dashboard');
          } else {
            // If auto-login fails, redirect to login page
            router.push('/login');
          }
        } catch {
          // If auto-login fails, redirect to login page
          router.push('/login');
        }
      } else {
        setError(response.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError((err as Error).message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);

    try {
      // TODO: Implement Google OAuth registration when credentials are configured
      setError('Google registration chưa được cấu hình. Vui lòng sử dụng form đăng ký.');
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể đăng ký với Google';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Đăng ký tài khoản</CardTitle>
          <CardDescription className="text-center">
            Tạo tài khoản mới để bắt đầu học tập cùng NyNus
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Backend Health Alert */}
          <BackendHealthAlert />

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${currentStep === step.id ? 'text-primary' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 w-24 mx-2 transition-colors ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Account Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Google Register Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleRegister}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Đăng ký với Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Hoặc</span>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-9 pr-9"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground h-auto p-0"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-9 pr-9"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground h-auto p-0"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>Giới tính</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value: string) => handleInputChange('gender', value)}
                  disabled={loading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Nam</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Nữ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Khác</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 3: Education Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Học sinh</SelectItem>
                    <SelectItem value="TUTOR">Gia sư</SelectItem>
                    <SelectItem value="TEACHER">Giáo viên</SelectItem>
                    <SelectItem value="GUEST">Khách</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Level (only for STUDENT, TUTOR, TEACHER) */}
              {(formData.role === 'STUDENT' || formData.role === 'TUTOR' || formData.role === 'TEACHER') && (
                <div className="space-y-2">
                  <Label htmlFor="level">Cấp độ (Lớp)</Label>
                  <Select
                    value={formData.level?.toString()}
                    onValueChange={(value) => handleInputChange('level', parseInt(value))}
                    disabled={loading}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Chọn cấp độ" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Lớp {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* School */}
              <div className="space-y-2">
                <Label htmlFor="school">Trường</Label>
                <div className="relative">
                  <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="school"
                    type="text"
                    placeholder="Tên trường"
                    value={formData.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Địa chỉ"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu bản thân</Label>
                <Textarea
                  id="bio"
                  placeholder="Viết vài dòng giới thiệu về bản thân..."
                  value={formData.bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                Quay lại
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className={currentStep === 1 ? 'w-full' : 'ml-auto'}
              >
                Tiếp theo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="ml-auto"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Đang đăng ký...
                  </span>
                ) : (
                  'Hoàn tất đăng ký'
                )}
              </Button>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-center w-full text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}