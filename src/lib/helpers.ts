export function uiConsole(...args: unknown[]): void {
  if (typeof window !== "undefined") {
    console.log(...args);
  }
}

export const parseToken = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const checkMetaMaskExtension = (): boolean => {
  if (typeof window === "undefined") return false;
  const ethereum = (window as Window & { ethereum?: { isMetaMask?: boolean } }).ethereum;
  return Boolean(ethereum?.isMetaMask);
};

interface ApiResponse {
  message?: string;
  error?: string;
  authOJWT?: string;
}

const showToast = async (type: 'success' | 'error', message: string) => {
  const { toast } = await import('react-toastify');
  toast[type](message);
};

export const handleOTP = async (email: string, action: () => void): Promise<void> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/request-otp?email=${encodeURIComponent(email.trim())}`;
    const response = await fetch(url);
    const data = (await response.json()) as ApiResponse;
    
    if (response.ok && data.message) {
      await showToast('success', data.message);
      action();
    } else {
      await showToast('error', data.error || 'Failed to send OTP');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send OTP';
    await showToast('error', message);
  }
};

export const handleRequestAuth0JWT = async (
  email: string,
  otp: string,
  action: (authOJWT: string) => Promise<void>,
): Promise<void> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/verify?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`;
    const response = await fetch(url);
    const data = (await response.json()) as ApiResponse;
    
    if (response.ok && data.authOJWT) {
      await action(data.authOJWT);
    } else {
      await showToast('error', data.error || 'Invalid OTP');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to verify OTP';
    await showToast('error', message);
  }
};


