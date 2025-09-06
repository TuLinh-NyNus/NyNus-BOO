import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email là bắt buộc' },
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

    // TODO: Integrate with actual newsletter service (Mailchimp, SendGrid, etc.)
    // For now, just log the subscription
    console.log('Newsletter subscription:', email);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TODO: Add to database or external service
    // Example with database:
    // await db.newsletter.create({
    //   data: {
    //     email,
    //     subscribedAt: new Date(),
    //     status: 'active'
    //   }
    // });

    // TODO: Send welcome email
    // await sendWelcomeEmail(email);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Đăng ký thành công! Cảm ơn bạn đã quan tâm đến NyNus.',
        data: { email }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.' 
      },
      { status: 500 }
    );
  }
}























