# Frontend Components Agent Guide
*Hướng dẫn chi tiết cho AI agents develop React components*

## 📋 Tổng quan Components System

**NyNus Frontend Components** được tổ chức theo feature-based architecture với Shadcn UI, Tailwind CSS, và TypeScript.

### Component Categories
- **UI Components** - Base components (Button, Input, Modal, etc.)
- **Feature Components** - Business logic components
- **Layout Components** - Page layout và navigation
- **Admin Components** - Admin dashboard specific
- **Auth Components** - Authentication related
- **Question Components** - Question management
- **Common Components** - Shared utilities

## 🏗️ Component Structure

```
apps/frontend/src/components/
├── ui/                          # Shadcn UI base components
│   ├── button.tsx              # Button component
│   ├── input.tsx               # Input field
│   ├── modal.tsx               # Modal dialog
│   ├── table.tsx               # Data table
│   ├── form/                   # Form components
│   ├── loading/                # Loading states
│   └── navigation/             # Navigation components
├── auth/                       # Authentication components
│   ├── RoleBadge.tsx          # User role display
│   ├── SecurityAlertBanner.tsx # Security notifications
│   └── SessionLimitWarning.tsx # Session management
├── admin/                      # Admin dashboard components
│   ├── sidebar/               # Admin sidebar
│   ├── header/                # Admin header
│   ├── questions/             # Question management
│   ├── roles/                 # Role management
│   └── ui/                    # Admin-specific UI
├── question/                   # Question-related components
│   ├── QuestionForm.tsx       # Question creation/editing
│   ├── QuestionList.tsx       # Question listing
│   └── QuestionCard.tsx       # Question display
├── layout/                     # Layout components
│   ├── navbar.tsx             # Main navigation
│   ├── footer.tsx             # Site footer
│   ├── main-layout.tsx        # Main page layout
│   └── auth-modal.tsx         # Authentication modal
├── common/                     # Common utilities
│   ├── error-boundary.tsx     # Error handling
│   ├── hydration-safe.tsx     # SSR safety
│   └── browser-extension-cleanup.tsx
├── latex/                      # LaTeX rendering
│   ├── latex-renderer.tsx     # LaTeX content renderer
│   └── latex-content.tsx      # LaTeX content wrapper
└── performance/                # Performance optimizations
    ├── virtual-scrolling/     # Virtual scrolling
    └── image-optimization/    # Image optimization
```

## 🎨 UI Components (Shadcn UI)

### Button Component
```typescript
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Input Component with Validation
```typescript
// components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helperText, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
```

## 🔐 Authentication Components

### Role Badge Component
```typescript
// components/auth/RoleBadge.tsx
import { Badge } from "@/components/ui/badge"
import { UserRole } from "@/generated/common"

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

const roleConfig = {
  [UserRole.USER_ROLE_GUEST]: {
    label: "Khách",
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-800"
  },
  [UserRole.USER_ROLE_STUDENT]: {
    label: "Học sinh",
    variant: "default" as const,
    className: "bg-blue-100 text-blue-800"
  },
  [UserRole.USER_ROLE_TUTOR]: {
    label: "Gia sư",
    variant: "secondary" as const,
    className: "bg-green-100 text-green-800"
  },
  [UserRole.USER_ROLE_TEACHER]: {
    label: "Giáo viên",
    variant: "secondary" as const,
    className: "bg-purple-100 text-purple-800"
  },
  [UserRole.USER_ROLE_ADMIN]: {
    label: "Quản trị",
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800"
  }
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role] || roleConfig[UserRole.USER_ROLE_GUEST]
  
  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  )
}
```

### Security Alert Banner
```typescript
// components/auth/SecurityAlertBanner.tsx
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, Shield, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface SecurityAlert {
  id: string
  type: "warning" | "error" | "info"
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function SecurityAlertBanner() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])

  useEffect(() => {
    // Check for security alerts
    const checkSecurityAlerts = async () => {
      if (!user) return

      const newAlerts: SecurityAlert[] = []

      // Check for suspicious login attempts
      if (user.riskScore && user.riskScore > 70) {
        newAlerts.push({
          id: "high-risk",
          type: "warning",
          message: "Phát hiện hoạt động đăng nhập bất thường. Vui lòng kiểm tra bảo mật tài khoản.",
          action: {
            label: "Xem chi tiết",
            onClick: () => {
              // Navigate to security settings
              window.location.href = "/profile/security"
            }
          }
        })
      }

      // Check for account lockout warning
      if (user.failedLoginAttempts && user.failedLoginAttempts >= 3) {
        newAlerts.push({
          id: "lockout-warning",
          type: "error",
          message: `Tài khoản sẽ bị khóa sau ${5 - user.failedLoginAttempts} lần đăng nhập sai nữa.`,
        })
      }

      setAlerts(newAlerts)
    }

    checkSecurityAlerts()
  }, [user])

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId))
  }

  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <Alert 
          key={alert.id}
          variant={alert.type === "error" ? "destructive" : "default"}
          className="relative"
        >
          {alert.type === "warning" && <Shield className="h-4 w-4" />}
          {alert.type === "error" && <AlertTriangle className="h-4 w-4" />}
          
          <AlertDescription className="pr-8">
            {alert.message}
            {alert.action && (
              <Button
                variant="link"
                size="sm"
                className="ml-2 p-0 h-auto"
                onClick={alert.action.onClick}
              >
                {alert.action.label}
              </Button>
            )}
          </AlertDescription>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={() => dismissAlert(alert.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}
```

## 📝 Question Components

### Question Form Component
```typescript
// components/question/QuestionForm.tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { QuestionType, DifficultyLevel } from "@/generated/common"
import { questionService } from "@/services/grpc/question.service"
import { useToast } from "@/hooks/use-toast"

const questionSchema = z.object({
  content: z.string().min(10, "Nội dung câu hỏi phải có ít nhất 10 ký tự"),
  questionType: z.nativeEnum(QuestionType),
  difficulty: z.nativeEnum(DifficultyLevel),
  subject: z.string().min(1, "Vui lòng chọn môn học"),
  topic: z.string().min(1, "Vui lòng nhập chủ đề"),
  tags: z.string().optional(),
  answers: z.array(z.object({
    content: z.string().min(1, "Nội dung đáp án không được để trống"),
    isCorrect: z.boolean(),
    explanation: z.string().optional(),
  })).min(2, "Phải có ít nhất 2 đáp án"),
})

type QuestionFormData = z.infer<typeof questionSchema>

interface QuestionFormProps {
  onSuccess?: (questionId: string) => void
  onCancel?: () => void
  initialData?: Partial<QuestionFormData>
}

export function QuestionForm({ onSuccess, onCancel, initialData }: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      content: initialData?.content || "",
      questionType: initialData?.questionType || QuestionType.QUESTION_TYPE_MULTIPLE_CHOICE,
      difficulty: initialData?.difficulty || DifficultyLevel.DIFFICULTY_LEVEL_MEDIUM,
      subject: initialData?.subject || "",
      topic: initialData?.topic || "",
      tags: initialData?.tags || "",
      answers: initialData?.answers || [
        { content: "", isCorrect: true, explanation: "" },
        { content: "", isCorrect: false, explanation: "" },
        { content: "", isCorrect: false, explanation: "" },
        { content: "", isCorrect: false, explanation: "" },
      ],
    },
  })

  const onSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await questionService.createQuestion({
        content: data.content,
        questionType: data.questionType,
        difficulty: data.difficulty,
        subject: data.subject,
        topic: data.topic,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        answers: data.answers,
      })

      if (response.success) {
        toast({
          title: "Thành công",
          description: "Câu hỏi đã được tạo thành công",
        })
        onSuccess?.(response.question?.id || "")
      } else {
        throw new Error(response.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo câu hỏi",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung câu hỏi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập nội dung câu hỏi (hỗ trợ LaTeX)"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="questionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại câu hỏi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại câu hỏi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={QuestionType.QUESTION_TYPE_MULTIPLE_CHOICE}>Trắc nghiệm</SelectItem>
                    <SelectItem value={QuestionType.QUESTION_TYPE_TRUE_FALSE}>Đúng/Sai</SelectItem>
                    <SelectItem value={QuestionType.QUESTION_TYPE_SHORT_ANSWER}>Câu trả lời ngắn</SelectItem>
                    <SelectItem value={QuestionType.QUESTION_TYPE_ESSAY}>Tự luận</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Độ khó</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn độ khó" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={DifficultyLevel.DIFFICULTY_LEVEL_EASY}>Dễ</SelectItem>
                    <SelectItem value={DifficultyLevel.DIFFICULTY_LEVEL_MEDIUM}>Trung bình</SelectItem>
                    <SelectItem value={DifficultyLevel.DIFFICULTY_LEVEL_HARD}>Khó</SelectItem>
                    <SelectItem value={DifficultyLevel.DIFFICULTY_LEVEL_EXPERT}>Chuyên gia</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Môn học</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Toán học" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chủ đề</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Đại số" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (tùy chọn)</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: phương trình, bậc hai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Answer fields would go here */}
        
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang tạo..." : "Tạo câu hỏi"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

## 🎨 Layout Components

### Main Layout Component
```typescript
// components/layout/main-layout.tsx
import { ReactNode } from "react"
import { Navbar } from "./navbar"
import { Footer } from "./footer"
import { SecurityAlertBanner } from "@/components/auth/SecurityAlertBanner"
import { useAuth } from "@/contexts/auth-context"

interface MainLayoutProps {
  children: ReactNode
  showNavbar?: boolean
  showFooter?: boolean
  className?: string
}

export function MainLayout({ 
  children, 
  showNavbar = true, 
  showFooter = true,
  className = ""
}: MainLayoutProps) {
  const { isAuthenticated } = useAuth()

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {showNavbar && <Navbar />}
      
      {isAuthenticated && (
        <div className="container mx-auto px-4 py-2">
          <SecurityAlertBanner />
        </div>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  )
}
```

## 🔧 Common Components

### Error Boundary
```typescript
// components/common/error-boundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
    
    // Log to error reporting service
    // errorReportingService.captureException(error, { extra: errorInfo })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Có lỗi xảy ra</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mb-4">
                  <summary className="cursor-pointer font-medium">Chi tiết lỗi</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <Button onClick={this.handleRetry} className="mr-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Tải lại trang
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
```

## 🧪 Component Testing

### Component Test Example
```typescript
// components/ui/__tests__/button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "../button"

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument()
  })

  it("handles click events", () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole("button"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("applies variant styles correctly", () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("bg-destructive")
  })

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })
})
```

---

**🚀 Quick Component Development:**
1. Create component with TypeScript interface
2. Use Shadcn UI base components
3. Implement proper error handling
4. Add accessibility attributes
5. Write unit tests
6. Document component props

**🔧 Best Practices:**
1. Use TypeScript for all components
2. Implement proper error boundaries
3. Follow accessibility guidelines
4. Use consistent naming conventions
5. Add proper loading states
6. Implement responsive design
