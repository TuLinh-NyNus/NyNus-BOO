'use client';

import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Shield, 
  BookOpen, 
  Settings,
  Star
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress
} from '@/components/ui';

/**
 * Onboarding Flow Component
 * 
 * Hướng dẫn người dùng mới hoàn thiện profile và làm quen với hệ thống:
 * - Multi-step wizard
 * - Progress tracking
 * - Interactive tutorials
 * - Profile completion prompts
 */

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  required: boolean;
  component?: React.ReactNode;
}

interface OnboardingFlowProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileCompleted?: boolean;
    twoFactorEnabled?: boolean;
  };
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingFlow({ user, onComplete, onSkip }: OnboardingFlowProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Định nghĩa các bước onboarding
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Chào mừng đến với NyNus!',
      description: 'Hãy cùng tìm hiểu về nền tảng học tập trực tuyến của chúng tôi',
      icon: <Star className="h-6 w-6" />,
      completed: false,
      required: true,
      component: <WelcomeStep user={user} />,
    },
    {
      id: 'profile',
      title: 'Hoàn thiện thông tin cá nhân',
      description: 'Cập nhật avatar và thông tin để có trải nghiệm tốt nhất',
      icon: <User className="h-6 w-6" />,
      completed: user.profileCompleted || false,
      required: true,
      component: <ProfileStep user={user} />,
    },
    {
      id: 'security',
      title: 'Bảo mật tài khoản',
      description: 'Thiết lập xác thực 2 lớp để bảo vệ tài khoản',
      icon: <Shield className="h-6 w-6" />,
      completed: user.twoFactorEnabled || false,
      required: false,
      component: <SecurityStep user={user} />,
    },
    {
      id: 'explore',
      title: 'Khám phá tính năng',
      description: 'Tìm hiểu các tính năng chính của hệ thống',
      icon: <BookOpen className="h-6 w-6" />,
      completed: false,
      required: true,
      component: <ExploreStep user={user} />,
    },
    {
      id: 'preferences',
      title: 'Cài đặt tùy chọn',
      description: 'Tùy chỉnh giao diện và thông báo theo ý muốn',
      icon: <Settings className="h-6 w-6" />,
      completed: false,
      required: false,
      component: <PreferencesStep user={user} />,
    },
  ];

  // Tính toán progress
  const totalSteps = steps.length;
  const completedCount = steps.filter(step => 
    step.completed || completedSteps.has(step.id)
  ).length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  // Xử lý next step
  const handleNext = () => {
    const currentStepData = steps[currentStep];
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  // Xử lý previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Xử lý complete onboarding
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  // Xử lý skip onboarding
  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  // Jump to specific step
  const jumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canSkipCurrent = !currentStepData.required;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thiết lập tài khoản
          </h1>
          <p className="text-gray-600">
            Hoàn thành các bước sau để có trải nghiệm tốt nhất với NyNus
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Tiến độ hoàn thành
            </span>
            <span className="text-sm text-gray-500">
              {completedCount}/{totalSteps} bước
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => jumpToStep(index)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  index === currentStep
                    ? 'bg-blue-100 text-blue-700'
                    : index < currentStep || step.completed || completedSteps.has(step.id)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {step.completed || completedSteps.has(step.id) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium whitespace-nowrap">
                  {step.title}
                </span>
                {step.required && (
                  <Badge variant="secondary" className="text-xs">
                    Bắt buộc
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {currentStepData.icon}
              </div>
              <div>
                <CardTitle>{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentStepData.component}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            {canSkipCurrent && (
              <Button variant="ghost" onClick={handleNext}>
                Bỏ qua
              </Button>
            )}
            
            <Button onClick={handleNext}>
              {isLastStep ? 'Hoàn thành' : 'Tiếp tục'}
              {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Skip All Option */}
        <div className="text-center mt-6">
          <Button variant="link" onClick={handleSkip} className="text-gray-500">
            Bỏ qua tất cả và vào hệ thống
          </Button>
        </div>
      </div>
    </div>
  );
}

// Welcome Step Component
function WelcomeStep({ user }: { user: any }): JSX.Element {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl">🎉</div>
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Xin chào {user.firstName}!
        </h3>
        <p className="text-gray-600">
          Chúc mừng bạn đã tham gia NyNus - nền tảng học tập trực tuyến hàng đầu. 
          Hãy cùng thiết lập tài khoản để bắt đầu hành trình học tập của bạn.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <h4 className="font-medium">Khóa học đa dạng</h4>
          <p className="text-sm text-gray-600">Hàng nghìn khóa học chất lượng cao</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <User className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <h4 className="font-medium">Giảng viên chuyên nghiệp</h4>
          <p className="text-sm text-gray-600">Đội ngũ giảng viên giàu kinh nghiệm</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
          <h4 className="font-medium">Bảo mật tuyệt đối</h4>
          <p className="text-sm text-gray-600">Thông tin được bảo vệ an toàn</p>
        </div>
      </div>
    </div>
  );
}

// Profile Step Component
function ProfileStep({ user }: { user: any }): JSX.Element {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Hoàn thiện thông tin cá nhân giúp chúng tôi cung cấp trải nghiệm tốt hơn cho bạn.
      </p>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Gợi ý:</strong> Thêm avatar và cập nhật thông tin liên hệ để dễ dàng 
          kết nối với giảng viên và bạn học.
        </p>
      </div>
      
      <Button className="w-full">
        Cập nhật thông tin cá nhân
      </Button>
    </div>
  );
}

// Security Step Component
function SecurityStep({ user }: { user: any }): JSX.Element {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Bảo vệ tài khoản của bạn bằng xác thực 2 lớp (2FA) để tăng cường bảo mật.
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Khuyến nghị:</strong> Kích hoạt 2FA để bảo vệ tài khoản khỏi 
          các truy cập trái phép.
        </p>
      </div>
      
      <Button className="w-full">
        Thiết lập xác thực 2 lớp
      </Button>
    </div>
  );
}

// Explore Step Component
function ExploreStep({ user }: { user: any }): JSX.Element {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Khám phá các tính năng chính của NyNus để tận dụng tối đa nền tảng học tập.
      </p>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium mb-2">📚 Thư viện khóa học</h4>
          <p className="text-sm text-gray-600">Duyệt và đăng ký các khóa học phù hợp</p>
        </div>
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium mb-2">📝 Làm bài thi</h4>
          <p className="text-sm text-gray-600">Kiểm tra kiến thức với hệ thống thi trực tuyến</p>
        </div>
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium mb-2">📊 Theo dõi tiến độ</h4>
          <p className="text-sm text-gray-600">Xem báo cáo học tập và thành tích</p>
        </div>
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium mb-2">💬 Tương tác</h4>
          <p className="text-sm text-gray-600">Thảo luận với giảng viên và bạn học</p>
        </div>
      </div>
    </div>
  );
}

// Preferences Step Component
function PreferencesStep({ user }: { user: any }): JSX.Element {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Tùy chỉnh giao diện và thông báo theo sở thích cá nhân.
      </p>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <h4 className="font-medium">Chế độ tối</h4>
            <p className="text-sm text-gray-600">Bảo vệ mắt khi học vào ban đêm</p>
          </div>
          <Button variant="outline" size="sm">Bật</Button>
        </div>
        
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <h4 className="font-medium">Thông báo email</h4>
            <p className="text-sm text-gray-600">Nhận thông báo về khóa học và bài tập</p>
          </div>
          <Button variant="outline" size="sm">Cấu hình</Button>
        </div>
        
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <h4 className="font-medium">Ngôn ngữ</h4>
            <p className="text-sm text-gray-600">Chọn ngôn ngữ hiển thị</p>
          </div>
          <Button variant="outline" size="sm">Tiếng Việt</Button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingFlow;
