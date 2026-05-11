import axios, { AxiosError } from 'axios';

// IMPORTANT: `CircleMintService` is currently imported and called directly
// from a client component (`src/app/profile/page.tsx`). The Circle API key
// CANNOT live on the client — it grants real Circle API access. The key is
// therefore read from a non-`NEXT_PUBLIC_` env var here, meaning it is only
// available in server contexts (API routes / server actions). When this
// module is bundled for the browser, `CIRCLE_API_KEY` is `undefined` and
// every Circle call will fail with a missing-key error.
//
// To restore Circle-powered features in the browser, add server-side API
// routes (e.g. `/api/circle/balance`) that proxy these calls and call those
// routes from the client. Do NOT re-introduce `NEXT_PUBLIC_CIRCLE_API_KEY`.
const CIRCLE_API_BASE_URL = process.env.CIRCLE_API_BASE_URL || 'https://api-sandbox.circle.com';
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || '';

type Currency = 'USD' | 'EUR';

export interface DepositAddress {
  id: string;
  address: string;
  currency: Currency;
  chain: string;
}

export interface WireBankAccount {
  id: string;
  status: string;
  description: string;
  trackingRef: string;
  billingDetails: {
    name: string;
    line1: string;
    city: string;
    postalCode: string;
    district?: string;
    country: string;
  };
  bankAddress: {
    bankName: string;
    line1: string;
    city: string;
    district?: string;
    country: string;
  };
}

export interface WireInstructions {
  trackingRef: string;
  beneficiary: {
    name: string;
    address1: string;
    address2?: string;
  };
  beneficiaryBank: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    swiftCode?: string;
    routingNumber?: string;
    accountNumber: string;
    currency: string;
  };
}

export interface Balance {
  available: Array<{
    amount: string;
    currency: string;
  }>;
  unsettled: Array<{
    amount: string;
    currency: string;
  }>;
}

export interface Payout {
  id: string;
  amount: {
    amount: string;
    currency: string;
  };
  status: string;
  sourceWalletId: string;
  destination: {
    type: string;
    id: string;
    name?: string;
  };
  createDate: string;
  updateDate: string;
}

export interface Transfer {
  id: string;
  source: {
    type: string;
    id: string;
  };
  destination: {
    type: string;
    address?: string;
    addressId?: string;
    chain?: string;
  };
  amount: {
    amount: string;
    currency: string;
  };
  status: string;
  transactionHash?: string;
  createDate: string;
}

export class CircleMintService {
  private static getHeaders() {
    if (!CIRCLE_API_KEY) {
      console.warn('Circle API key is not configured');
    }
    return {
      'Authorization': `Bearer ${CIRCLE_API_KEY}`,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    };
  }

  private static handleError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError;
    const message = axiosError.response?.data
      ? (axiosError.response.data as any)?.message || defaultMessage
      : defaultMessage;
    console.error(`Circle Mint ${defaultMessage.toLowerCase()}:`, axiosError.response?.status || axiosError.code, message);
    throw new Error(message);
  }

  static async createDepositAddress(currency: Currency, chain: string, idempotencyKey?: string) {
    try {
      const response = await axios.post(
        `${CIRCLE_API_BASE_URL}/v1/businessAccount/wallets/addresses/deposit`,
        {
          currency,
          chain,
          idempotencyKey: idempotencyKey || this.generateIdempotencyKey()
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create deposit address');
    }
  }

  static async getDepositAddresses() {
    try {
      const response = await axios.get(
        `${CIRCLE_API_BASE_URL}/v1/businessAccount/wallets/addresses/deposit`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get deposit addresses');
    }
  }

  static async createWireBankAccount(data: {
    billingDetails: {
      name: string;
      city: string;
      country: string;
      line1: string;
      line2?: string;
      district?: string;
      postalCode: string;
    };
    bankAddress: {
      bankName?: string;
      city: string;
      country: string;
      line1?: string;
      line2?: string;
      district?: string;
    };
    idempotencyKey: string;
    // US Bank Account
    accountNumber?: string;
    routingNumber?: string;
    // IBAN Supported
    iban?: string;
  }) {
    try {
      const response = await axios.post(
        `${CIRCLE_API_BASE_URL}/v1/businessAccount/banks/wires`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create wire bank account');
    }
  }

  static async getWireInstructions(bankAccountId: string, currency: Currency = 'USD') {
    try {
      const response = await axios.get(
        `${CIRCLE_API_BASE_URL}/v1/businessAccount/banks/wires/${bankAccountId}/instructions?currency=${currency}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get wire instructions');
    }
  }

  static async getWireBankAccounts() {
    try {
      const response = await axios.get(
        `${CIRCLE_API_BASE_URL}/v1/businessAccount/banks/wires`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get wire bank accounts');
    }
  }

  static async createMockWirePayment(data: {
    amount: {
      amount: string;
      currency: Currency;
    };
    beneficiaryBank: {
      accountNumber: string;
    };
  }) {
    try {
      const response = await axios.post(
        `${CIRCLE_API_BASE_URL}/v1/businessAccount/banks/wires`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create mock wire payment');
    }
  }

  static async createPayout(data: {
    destination: {
      type: 'wire';
      id: string;
    };
    amount: {
      currency: Currency;
      amount: string;
    };
    idempotencyKey: string;
    source?: {
      type: 'wallet';
      id: string;
    };
    toAmount?: {
      currency: Currency;
    };
  }) {
    if (!data.idempotencyKey || !data.destination?.id || !data.amount?.amount || !data.amount?.currency) {
      throw new Error('Missing required fields: idempotencyKey, destination.id, amount.amount, and amount.currency are required');
    }
    if (!CIRCLE_API_KEY) {
      throw new Error('Circle API key is not configured. Set CIRCLE_API_KEY (server-only) and route calls through a server API endpoint; do not call Circle directly from the browser.');
    }

    try {
      const requestData = {
        idempotencyKey: data.idempotencyKey,
        destination: data.destination,
        amount: data.amount,
        toAmount: {
          currency: data.toAmount?.currency || data.amount.currency,
        },
        ...(data.source && { source: data.source }),
      };

      const response = await axios.post(
        `${CIRCLE_API_BASE_URL}/v1/businessAccount/payouts`,
        requestData,
        {
          headers: this.getHeaders(),
          validateStatus: (status) => status < 500, // Don't throw on 4xx errors
        }
      );

      if (response.status >= 400) {
        const errorData = response.data || {};
        const errorMsg = this.extractErrorMessage(response.status, errorData);
        const error: any = new Error(errorMsg);
        error.response = response;
        error.status = response.status;
        error.data = errorData;
        error.isServerError = response.status === 500;
        throw error;
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const responseData = axiosError.response?.data as any;
      const status = axiosError.response?.status;

      let errorMessage = 'Failed to create payout';

      if (!axiosError.response) {
        errorMessage = this.getNetworkErrorMessage(axiosError);
      } else if (status) {
        errorMessage = this.extractErrorMessage(status, responseData);
        if (responseData?.errorId || responseData?.id) {
          errorMessage = `${errorMessage} [Error ID: ${responseData.errorId || responseData.id}]`;
        }
      }

      const enhancedError: any = new Error(errorMessage);
      enhancedError.response = axiosError.response;
      enhancedError.status = status;
      enhancedError.data = responseData;
      enhancedError.isNetworkError = !axiosError.response;
      enhancedError.isServerError = status === 500;
      enhancedError.errorCode = (axiosError as any).code;

      throw enhancedError;
    }
  }

  static async getPayout(payoutId: string) {
    try {
      const response = await axios.get(
        `${CIRCLE_API_BASE_URL}/v1/businessAccount/payouts/${payoutId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get payout');
    }
  }

  static async addRecipientAddress(data: {
    chain: string;
    idempotencyKey: string;
    address: string;
    currency: Currency;
    description?: string;
  }) {
    try {
      const response = await axios.post(
        `${CIRCLE_API_BASE_URL}/v1/businessAccount/wallets/addresses/recipient`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to add recipient address');
    }
  }

  static async createTransfer(data: {
    destination: {
      type: 'verified_blockchain';
      addressId: string;
    };
    amount: {
      currency: Currency;
      amount: string;
    };
    idempotencyKey: string;
  }) {
    try {
      const response = await axios.post(
        `${CIRCLE_API_BASE_URL}/v1/businessAccount/transfers`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create transfer');
    }
  }

  static async getTransfer(transferId: string) {
    try {
      const response = await axios.get(
        `${CIRCLE_API_BASE_URL}/v1/businessAccount/transfers/${transferId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get transfer');
    }
  }

  static async getBalance() {
    try {
      const response = await axios.get(
        `${CIRCLE_API_BASE_URL}/v1/businessAccount/balances`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get balance');
    }
  }

  private static extractErrorMessage(status: number, errorData: any): string {
    if (status === 500) {
      return errorData?.message
        ? `Server error: ${errorData.message}`
        : 'Internal server error from Circle Mint API. Please try again later or contact support.';
    }
    if (status === 400) return errorData?.message || 'Invalid request. Please check your bank account and amount.';
    if (status === 401) return 'Authentication failed. Please check your API key.';
    if (status === 403) return 'Access denied. Please check your permissions.';
    if (status === 404) return 'Bank account not found. Please verify the account exists.';

    return errorData?.message
      || errorData?.error?.message
      || (typeof errorData?.error === 'string' ? errorData.error : null)
      || errorData?.description
      || (Array.isArray(errorData?.errors) ? errorData.errors.map((e: any) => e.message || e).join(', ') : null)
      || `HTTP ${status}: ${errorData?.code ? `Error ${errorData.code}` : 'Bad Request'}`;
  }

  private static getNetworkErrorMessage(error: AxiosError): string {
    const code = (error as any).code;
    if (code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again.';
    }
    if (code === 'ENOTFOUND' || code === 'ECONNREFUSED') {
      return 'Cannot connect to Circle Mint API. Please check your network connection.';
    }
    return error.message || 'Network error. Please check your connection and try again.';
  }

  static generateIdempotencyKey(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
