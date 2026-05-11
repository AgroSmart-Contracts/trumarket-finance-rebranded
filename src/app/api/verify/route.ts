import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');
  const otp = searchParams.get('otp');

  if (!email || !otp) {
    return NextResponse.json(
      { error: 'Email and OTP are required' },
      { status: 400 }
    );
  }

  try {
    const response = await AuthService.requestJWTtoAccount({ email, otp });
    return NextResponse.json({ authOJWT: response.id_token });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.response?.data?.error_description || 'Invalid OTP' },
      { status: 500 }
    );
  }
}

