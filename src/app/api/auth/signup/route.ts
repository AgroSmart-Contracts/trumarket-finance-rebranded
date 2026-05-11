import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function handleApiError(error: unknown): NextResponse {
  const axiosError = error as AxiosError;
  const status = axiosError.response?.status || 500;
  const message = (axiosError.response?.data as { message?: string })?.message
    || axiosError.message
    || 'Request failed';

  return NextResponse.json(
    { error: message, code: status },
    { status }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { web3authToken, auth0Token, accountType = 'investor' } = body;

    if (!web3authToken) {
      return NextResponse.json(
        { error: 'web3authToken is required' },
        { status: 400 }
      );
    }

    if (!API_URL) {
      return NextResponse.json({ token: web3authToken });
    }

    const response = await axios.post(`${API_URL}/auth/signup`, {
      web3authToken,
      accountType,
      auth0Token,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

