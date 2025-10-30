package email

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"net/smtp"
	"os"
)

// EmailService handles email operations
type EmailService struct {
	smtpHost     string
	smtpPort     string
	smtpUsername string
	smtpPassword string
	fromEmail    string
	fromName     string
	isDev        bool // Development mode - just log emails instead of sending
}

// NewEmailService creates a new email service
func NewEmailService() *EmailService {
	// In development, we'll just log emails
	isDev := os.Getenv("ENV") != "production"

	return &EmailService{
		smtpHost:     os.Getenv("SMTP_HOST"),
		smtpPort:     os.Getenv("SMTP_PORT"),
		smtpUsername: os.Getenv("SMTP_USERNAME"),
		smtpPassword: os.Getenv("SMTP_PASSWORD"),
		fromEmail:    getEnvDefault("SMTP_FROM_EMAIL", "noreply@nynus.edu.vn"),
		fromName:     getEnvDefault("SMTP_FROM_NAME", "NyNus System"),
		isDev:        isDev,
	}
}

// SendVerificationEmail sends email verification link
func (s *EmailService) SendVerificationEmail(toEmail, userName, verificationToken string) error {
	subject := "XÃ¡c thá»±c email cá»§a báº¡n - NyNus"

	// Create verification URL
	baseURL := getEnvDefault("FRONTEND_URL", "http://localhost:3000")
	verificationURL := fmt.Sprintf("%s/verify-email?token=%s", baseURL, verificationToken)

	// HTML template for email
	htmlTemplate := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>XÃ¡c thá»±c Email</h1>
        </div>
        <div class="content">
            <h2>Xin chÃ o {{.UserName}}!</h2>
            <p>Cáº£m Æ¡n báº¡n Ä‘Ã£ Ä‘Äƒng kÃ½ tÃ i khoáº£n táº¡i NyNus. Vui lÃ²ng xÃ¡c thá»±c email cá»§a báº¡n báº±ng cÃ¡ch nháº¥n vÃ o nÃºt bÃªn dÆ°á»›i:</p>
            
            <div style="text-align: center;">
                <a href="{{.VerificationURL}}" class="button">XÃ¡c thá»±c Email</a>
            </div>
            
            <p>Hoáº·c copy vÃ  paste link sau vÃ o trÃ¬nh duyá»‡t:</p>
            <p style="word-break: break-all; color: #667eea;">{{.VerificationURL}}</p>
            
            <p><strong>LÆ°u Ã½:</strong> Link nÃ y sáº½ háº¿t háº¡n sau 24 giá».</p>
            
            <div class="footer">
                <p>Náº¿u báº¡n khÃ´ng Ä‘Äƒng kÃ½ tÃ i khoáº£n nÃ y, vui lÃ²ng bá» qua email nÃ y.</p>
                <p>&copy; 2025 NyNus. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`

	// Parse template
	tmpl, err := template.New("verification").Parse(htmlTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse email template: %v", err)
	}

	// Execute template
	var htmlBody bytes.Buffer
	data := struct {
		UserName        string
		VerificationURL string
	}{
		UserName:        userName,
		VerificationURL: verificationURL,
	}

	if err := tmpl.Execute(&htmlBody, data); err != nil {
		return fmt.Errorf("failed to execute email template: %v", err)
	}

	// In development mode, just log the email
	if s.isDev {
		log.Printf("ðŸ“§ [DEV MODE] Email Verification:\n")
		log.Printf("  To: %s\n", toEmail)
		log.Printf("  Subject: %s\n", subject)
		log.Printf("  Verification URL: %s\n", verificationURL)
		log.Printf("  Token: %s\n", verificationToken)
		return nil
	}

	// In production, send actual email via SMTP
	return s.sendEmail(toEmail, subject, htmlBody.String())
}

// SendPasswordResetEmail sends password reset link
func (s *EmailService) SendPasswordResetEmail(toEmail, userName, resetToken string) error {
	subject := "Äáº·t láº¡i máº­t kháº©u - NyNus"

	baseURL := getEnvDefault("FRONTEND_URL", "http://localhost:3000")
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", baseURL, resetToken)

	htmlTemplate := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Äáº·t láº¡i máº­t kháº©u</h1>
        </div>
        <div class="content">
            <h2>Xin chÃ o {{.UserName}}!</h2>
            <p>ChÃºng tÃ´i nháº­n Ä‘Æ°á»£c yÃªu cáº§u Ä‘áº·t láº¡i máº­t kháº©u cho tÃ i khoáº£n cá»§a báº¡n. Nháº¥n vÃ o nÃºt bÃªn dÆ°á»›i Ä‘á»ƒ Ä‘áº·t láº¡i máº­t kháº©u:</p>
            
            <div style="text-align: center;">
                <a href="{{.ResetURL}}" class="button">Äáº·t láº¡i máº­t kháº©u</a>
            </div>
            
            <p>Hoáº·c copy vÃ  paste link sau vÃ o trÃ¬nh duyá»‡t:</p>
            <p style="word-break: break-all; color: #f5576c;">{{.ResetURL}}</p>
            
            <p><strong>LÆ°u Ã½:</strong> Link nÃ y sáº½ háº¿t háº¡n sau 1 giá».</p>
            
            <div class="footer">
                <p>Náº¿u báº¡n khÃ´ng yÃªu cáº§u Ä‘áº·t láº¡i máº­t kháº©u, vui lÃ²ng bá» qua email nÃ y.</p>
                <p>&copy; 2025 NyNus. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`

	tmpl, err := template.New("reset").Parse(htmlTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse email template: %v", err)
	}

	var htmlBody bytes.Buffer
	data := struct {
		UserName string
		ResetURL string
	}{
		UserName: userName,
		ResetURL: resetURL,
	}

	if err := tmpl.Execute(&htmlBody, data); err != nil {
		return fmt.Errorf("failed to execute email template: %v", err)
	}

	if s.isDev {
		log.Printf("ðŸ“§ [DEV MODE] Password Reset Email:\n")
		log.Printf("  To: %s\n", toEmail)
		log.Printf("  Subject: %s\n", subject)
		log.Printf("  Reset URL: %s\n", resetURL)
		log.Printf("  Token: %s\n", resetToken)
		return nil
	}

	return s.sendEmail(toEmail, subject, htmlBody.String())
}

// sendEmail sends email via SMTP
func (s *EmailService) sendEmail(to, subject, htmlBody string) error {
	if s.smtpHost == "" || s.smtpPort == "" {
		return fmt.Errorf("SMTP configuration not set")
	}

	from := fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail)

	// Email headers
	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	// Build email message
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + htmlBody

	// SMTP authentication
	auth := smtp.PlainAuth("", s.smtpUsername, s.smtpPassword, s.smtpHost)

	// Send email
	addr := fmt.Sprintf("%s:%s", s.smtpHost, s.smtpPort)
	err := smtp.SendMail(addr, auth, s.fromEmail, []string{to}, []byte(message))

	if err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}

	log.Printf("âœ… Email sent successfully to %s", to)
	return nil
}

// Helper function to get environment variable with default
func getEnvDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
