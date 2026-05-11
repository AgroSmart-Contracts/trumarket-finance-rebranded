import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    );
  }

  try {
    const response = await AuthService.requestOTPtoAccount({ email });
    return NextResponse.json({ 
      message: `One time code successfully sent to ${response.email}` 
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.response?.data?.error_description || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

