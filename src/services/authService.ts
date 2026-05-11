import axios, { AxiosError } from 'axios';

const AUTH0_API_URL = process.env.NEXT_PUBLIC_AUTH0_API_URL || '';
const AUTH0_CLIENT_ID = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '';
// Server-only — do NOT prefix with NEXT_PUBLIC_. The Auth0 client secret must
// never be inlined into the browser bundle. Used only by the methods below
// that are called exclusively from server-side API routes
// (`/api/request-otp`, `/api/verify`).
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class AuthService {
  /**
   * Request OTP to be sent to email
   */
  static async requestOTPtoAccount({ email }: { email: string }): Promise<{ email: string }> {
    const response = await axios.post(`${AUTH0_API_URL}/passwordless/start`, {
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      connection: 'email',
      email: email.trim(),
      send: 'code',
    });
    return response.data;
  }

  /**
   * Request JWT token using email and OTP
   */
  static async requestJWTtoAccount({ email, otp }: { email: string; otp: string }): Promise<{ id_token: string }> {
    const response = await axios.post(`${AUTH0_API_URL}/oauth/token`, {
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
      realm: 'email',
      username: email.trim(),
      scope: 'openid profile email',
      redirect_uri: APP_URL,
      otp,
    });
    return response.data;
  }

  static async checkUserExists({ email }: { email: string }): Promise<{ exists: boolean }> {
    if (!API_URL) {
      return { exists: false };
    }
    try {
      const response = await axios.post(`${API_URL}/auth/check-user-exists`, { email });
      return response.data;
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Save/Register user with investor account type
   */
  static async saveUser({
    web3authToken,
    auth0Token,
    accountType = 'investor',
  }: {
    web3authToken: string;
    auth0Token: string;
    accountType?: string;
  }): Promise<{ token: string }> {
    if (!API_URL) {
      return { token: web3authToken };
    }
    
    const response = await axios.post('/api/auth/signup', {
      web3authToken,
      accountType,
      auth0Token,
    });
    
    return response.data;
  }

  /**
   * Login user
   */
  static async loginUser({ web3authToken }: { web3authToken: string }): Promise<{ token: string }> {
    if (!API_URL) {
      return { token: web3authToken };
    }
    
    const response = await axios.post('/api/auth/login', {
      web3authToken,
    });
    
    return response.data;
  }
}

