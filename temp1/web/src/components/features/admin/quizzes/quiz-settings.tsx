'use client';

import {
  Clock,
  Target,
  Shuffle,
  Eye,
  EyeOff,
  RotateCcw,
  Calendar,
  Users,
  Shield,
  Settings,
  Save,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useState } from 'react';

import { Button, Badge, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea, Tabs, TabsContent, TabsList, TabsTrigger, Switch } from '@/components/ui';

interface QuizSettings {
  // Timing Settings
  timeLimit: number;
  timeLimitEnabled: boolean;
  showTimer: boolean;
  autoSubmit: boolean;

  // Attempt Settings
  maxAttempts: number;
  unlimitedAttempts: boolean;
  cooldownPeriod: number;

  // Scoring Settings
  passingScore: number;
  showScore: boolean;
  showcorrectanswers: boolean;
  showExplanations: boolean;

  // Question Settings
  shuffleQuestions: boolean;
  shuffleanswers: boolean;
  questionsPerPage: number;
  allowBacktrack: boolean;

  // Access Settings
  requirePassword: boolean;
  password: string;
  availableFrom: string;
  availableTo: string;
  ipRestrictions: string[];

  // Feedback Settings
  immediateResults: boolean;
  allowReview: boolean;
  showResultsAfter: 'immediately' | 'after_due' | 'manual';
  emailResults: boolean;

  // Security Settings
  preventCheating: boolean;
  lockdownBrowser: boolean;
  disableCopyPaste: boolean;
  randomizeQuestions: boolean;

  // Grading Settings
  gradingMethod: 'highest' | 'latest' | 'average';
  partialCredit: boolean;
  negativeMarking: boolean;
  negativeMarkingValue: number;
}

interface QuizSettingsProps {
  quizId?: string;
  initialSettings?: Partial<QuizSettings>;
  onSave?: (settings: QuizSettings) => void;
  onCancel?: () => void;
}

export function QuizSettings({
  quizId,
  initialSettings = {},
  onSave,
  onCancel
}: QuizSettingsProps): JSX.Element {
  const [settings, setSettings] = useState<QuizSettings>({
    // Default values
    timeLimit: 30,
    timeLimitEnabled: true,
    showTimer: true,
    autoSubmit: true,

    maxAttempts: 3,
    unlimitedAttempts: false,
    cooldownPeriod: 0,

    passingScore: 70,
    showScore: true,
    showcorrectanswers: true,
    showExplanations: true,

    shuffleQuestions: true,
    shuffleanswers: false,
    questionsPerPage: 1,
    allowBacktrack: true,

    requirePassword: false,
    password: '',
    availableFrom: '',
    availableTo: '',
    ipRestrictions: [],

    immediateResults: true,
    allowReview: true,
    showResultsAfter: 'immediately',
    emailResults: false,

    preventCheating: false,
    lockdownBrowser: false,
    disableCopyPaste: false,
    randomizeQuestions: false,

    gradingMethod: 'highest',
    partialCredit: false,
    negativeMarking: false,
    negativeMarkingValue: 0,

    ...initialSettings
  });

  const [activeTab, setActiveTab] = useState('timing');
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (key: keyof QuizSettings, value: QuizSettings[keyof QuizSettings]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave?.(settings);
    setHasChanges(false);
  };

  const renderTimingSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cài đặt thời gian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Giới hạn thời gian</Label>
              <p className="text-sm text-slate-600">Đặt thời gian tối đa để hoàn thành quiz</p>
            </div>
            <Switch
              checked={settings.timeLimitEnabled}
              onCheckedChange={(checked) => updateSetting('timeLimitEnabled', checked)}
            />
          </div>

          {settings.timeLimitEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-purple-200">
              <div className="space-y-2">
                <Label>Thời gian (phút)</Label>
                <Input
                  type="number"
                  min="1"
                  max="300"
                  value={settings.timeLimit}
                  onChange={(e) => updateSetting('timeLimit', parseInt(e.target.value) || 30)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Hiển thị đồng hồ đếm ngược</Label>
                  <Switch
                    checked={settings.showTimer}
                    onCheckedChange={(checked) => updateSetting('showTimer', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Tự động nộp bài khi hết giờ</Label>
                  <Switch
                    checked={settings.autoSubmit}
                    onCheckedChange={(checked) => updateSetting('autoSubmit', checked)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Thời gian mở/đóng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mở từ</Label>
              <Input
                type="datetime-local"
                value={settings.availableFrom}
                onChange={(e) => updateSetting('availableFrom', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Đóng lúc</Label>
              <Input
                type="datetime-local"
                value={settings.availableTo}
                onChange={(e) => updateSetting('availableTo', e.target.value)}
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Lưu ý về thời gian</p>
                <p>Để trống nếu không muốn giới hạn thời gian mở/đóng quiz</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAttemptSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Số lần làm bài
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Không giới hạn số lần làm</Label>
              <p className="text-sm text-slate-600">Học viên có thể làm bài nhiều lần</p>
            </div>
            <Switch
              checked={settings.unlimitedAttempts}
              onCheckedChange={(checked) => updateSetting('unlimitedAttempts', checked)}
            />
          </div>

          {!settings.unlimitedAttempts && (
            <div className="pl-4 border-l-2 border-purple-200 space-y-4">
              <div className="space-y-2">
                <Label>Số lần làm tối đa</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxAttempts}
                  onChange={(e) => updateSetting('maxAttempts', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label>Thời gian chờ giữa các lần làm (phút)</Label>
                <Input
                  type="number"
                  min="0"
                  value={settings.cooldownPeriod}
                  onChange={(e) => updateSetting('cooldownPeriod', parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-slate-500">
                  Đặt 0 để không có thời gian chờ
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Phương pháp tính điểm</Label>
            <select
              value={settings.gradingMethod}
              onChange={(e) => updateSetting('gradingMethod', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="highest">Điểm cao nhất</option>
              <option value="latest">Lần làm cuối</option>
              <option value="average">Điểm trung bình</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderScoringSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Cài đặt điểm số
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Điểm đậu (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.passingScore}
                onChange={(e) => updateSetting('passingScore', parseInt(e.target.value) || 70)}
              />
            </div>

            <div className="space-y-2">
              <Label>Điểm trừ khi sai (%)</Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={settings.negativeMarkingValue}
                onChange={(e) => updateSetting('negativeMarkingValue', parseInt(e.target.value) || 0)}
                disabled={!settings.negativeMarking}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Cho điểm một phần</Label>
              <Switch
                checked={settings.partialCredit}
                onCheckedChange={(checked) => updateSetting('partialCredit', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Trừ điểm khi trả lời sai</Label>
              <Switch
                checked={settings.negativeMarking}
                onCheckedChange={(checked) => updateSetting('negativeMarking', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Hiển thị kết quả
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Hiển thị điểm số</Label>
              <Switch
                checked={settings.showScore}
                onCheckedChange={(checked) => updateSetting('showScore', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Hiển thị đáp án đúng</Label>
              <Switch
                checked={settings.showcorrectanswers}
                onCheckedChange={(checked) => updateSetting('showcorrectanswers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Hiển thị giải thích</Label>
              <Switch
                checked={settings.showExplanations}
                onCheckedChange={(checked) => updateSetting('showExplanations', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Cho phép xem lại bài làm</Label>
              <Switch
                checked={settings.allowReview}
                onCheckedChange={(checked) => updateSetting('allowReview', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Thời điểm hiển thị kết quả</Label>
            <select
              value={settings.showResultsAfter}
              onChange={(e) => updateSetting('showResultsAfter', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="immediately">Ngay lập tức</option>
              <option value="after_due">Sau khi đóng quiz</option>
              <option value="manual">Thủ công</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuestionSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Cài đặt câu hỏi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Trộn thứ tự câu hỏi</Label>
                <Switch
                  checked={settings.shuffleQuestions}
                  onCheckedChange={(checked) => updateSetting('shuffleQuestions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Trộn thứ tự đáp án</Label>
                <Switch
                  checked={settings.shuffleanswers}
                  onCheckedChange={(checked) => updateSetting('shuffleanswers', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Cho phép quay lại câu trước</Label>
                <Switch
                  checked={settings.allowBacktrack}
                  onCheckedChange={(checked) => updateSetting('allowBacktrack', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Số câu hỏi mỗi trang</Label>
                <select
                  value={settings.questionsPerPage}
                  onChange={(e) => updateSetting('questionsPerPage', parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value={1}>1 câu/trang</option>
                  <option value={5}>5 câu/trang</option>
                  <option value={10}>10 câu/trang</option>
                  <option value={0}>Tất cả trong 1 trang</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Bảo mật và kiểm soát
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Yêu cầu mật khẩu</Label>
                <p className="text-sm text-slate-600">Học viên phải nhập mật khẩu để vào quiz</p>
              </div>
              <Switch
                checked={settings.requirePassword}
                onCheckedChange={(checked) => updateSetting('requirePassword', checked)}
              />
            </div>

            {settings.requirePassword && (
              <div className="pl-4 border-l-2 border-purple-200">
                <div className="space-y-2">
                  <Label>Mật khẩu</Label>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu..."
                    value={settings.password}
                    onChange={(e) => updateSetting('password', e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>Chống gian lận</Label>
              <Switch
                checked={settings.preventCheating}
                onCheckedChange={(checked) => updateSetting('preventCheating', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Vô hiệu hóa copy/paste</Label>
              <Switch
                checked={settings.disableCopyPaste}
                onCheckedChange={(checked) => updateSetting('disableCopyPaste', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Yêu cầu trình duyệt khóa</Label>
              <Switch
                checked={settings.lockdownBrowser}
                onCheckedChange={(checked) => updateSetting('lockdownBrowser', checked)}
              />
            </div>
          </div>

          {settings.preventCheating && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Chế độ chống gian lận</p>
                  <p>Sẽ theo dõi hành vi của học viên trong quá trình làm bài</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cài đặt Quiz</h1>
          <p className="text-slate-600">
            Cấu hình chi tiết các tùy chọn cho quiz
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Có thay đổi chưa lưu
            </Badge>
          )}

          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Lưu cài đặt
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="timing">Thời gian</TabsTrigger>
          <TabsTrigger value="attempts">Lần làm</TabsTrigger>
          <TabsTrigger value="scoring">Điểm số</TabsTrigger>
          <TabsTrigger value="questions">Câu hỏi</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="timing">
          {renderTimingSettings()}
        </TabsContent>

        <TabsContent value="attempts">
          {renderAttemptSettings()}
        </TabsContent>

        <TabsContent value="scoring">
          {renderScoringSettings()}
        </TabsContent>

        <TabsContent value="questions">
          {renderQuestionSettings()}
        </TabsContent>

        <TabsContent value="security">
          {renderSecuritySettings()}
        </TabsContent>
      </Tabs>

      {/* Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tóm tắt cài đặt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-slate-700">Thời gian</div>
              <div className="text-slate-600">
                {settings.timeLimitEnabled ? `${settings.timeLimit} phút` : 'Không giới hạn'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-medium text-slate-700">Số lần làm</div>
              <div className="text-slate-600">
                {settings.unlimitedAttempts ? 'Không giới hạn' : `${settings.maxAttempts} lần`}
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-medium text-slate-700">Điểm đậu</div>
              <div className="text-slate-600">{settings.passingScore}%</div>
            </div>

            <div className="space-y-1">
              <div className="font-medium text-slate-700">Trộn câu hỏi</div>
              <div className="text-slate-600">
                {settings.shuffleQuestions ? 'Có' : 'Không'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-medium text-slate-700">Hiển thị kết quả</div>
              <div className="text-slate-600">
                {settings.showResultsAfter === 'immediately' ? 'Ngay lập tức' :
                 settings.showResultsAfter === 'after_due' ? 'Sau khi đóng' : 'Thủ công'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-medium text-slate-700">Bảo mật</div>
              <div className="text-slate-600">
                {settings.requirePassword || settings.preventCheating ? 'Có' : 'Không'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
