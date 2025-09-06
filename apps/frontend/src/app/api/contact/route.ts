import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Tất cả các trường là bắt buộc' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Nội dung tin nhắn phải có ít nhất 10 ký tự' },
        { status: 400 }
      );
    }

    // TODO: Integrate with actual email service (SendGrid, Nodemailer, etc.)
    // For now, just log the contact form submission
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TODO: Add to database
    // Example with database:
    // await db.contact.create({
    //   data: {
    //     name,
    //     email,
    //     subject,
    //     message,
    //     submittedAt: new Date(),
    //     status: 'pending'
    //   }
    // });

    // TODO: Send email notification
    // Example with SendGrid:
    // await sendContactEmail({
    //   to: 'support@nynus.edu.vn',
    //   from: 'noreply@nynus.edu.vn',
    //   subject: `Contact Form: ${subject}`,
    //   text: `
    //     Name: ${name}
    //     Email: ${email}
    //     Subject: ${subject}
    //     Message: ${message}
    //   `
    // });

    // TODO: Send auto-reply to user
    // await sendAutoReply({
    //   to: email,
    //   from: 'support@nynus.edu.vn',
    //   subject: 'Cảm ơn bạn đã liên hệ với NyNus',
    //   text: `
    //     Xin chào ${name},
    //     
    //     Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.
    //     
    //     Trân trọng,
    //     Đội ngũ NyNus
    //   `
    // });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
        data: { name, email, subject }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.' 
      },
      { status: 500 }
    );
  }
}























