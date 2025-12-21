// ============= lib/api-client.ts (COMPLETE WITH FIXED HEADERS) =============
// API Client for Aboki Backend

const BASE_URL = 'https://apis.aboki.xyz';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private passkeyVerificationToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('aboki_auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('aboki_auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aboki_auth_token');
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('aboki_auth_token');
    }
    return this.token;
  }

  setPasskeyVerificationToken(token: string) {
    this.passkeyVerificationToken = token;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('passkey_verification_token', token);
    }
    console.log('✅ Passkey verification token stored');
  }

  getPasskeyVerificationToken(): string | null {
    if (!this.passkeyVerificationToken && typeof window !== 'undefined') {
      this.passkeyVerificationToken = sessionStorage.getItem('passkey_verification_token');
    }
    return this.passkeyVerificationToken;
  }

  clearPasskeyVerificationToken() {
    this.passkeyVerificationToken = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('passkey_verification_token');
    }
    console.log('🗑️ Passkey verification token cleared');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add custom headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Add authorization if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // ✅ FIXED: Add passkey verification header for offramp confirm endpoint
    if (endpoint.includes('/confirm-account-and-sign') || 
        endpoint.includes('/send/') || 
        endpoint.includes('/withdraw')) {
      const token = this.getPasskeyVerificationToken();
      if (token) {
        headers['X-Passkey-Verified'] = 'true';
        console.log('✅ Adding X-Passkey-Verified header');
        console.log('   Endpoint:', endpoint);
        console.log('   Token present:', 'YES');
      } else {
        console.warn('⚠️ Passkey verification token missing!');
        console.warn('   Endpoint:', endpoint);
        console.warn('   This request will likely fail');
      }
    }

    try {
      console.log('🌐 API Request:', {
        method: options.method || 'GET',
        endpoint,
        headers: Object.keys(headers),
        hasPasskeyHeader: !!headers['X-Passkey-Verified']
      });

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', {
          status: response.status,
          error: data.error || data.message
        });
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        };
      }

      return data;
    } catch (error: any) {
      console.error('❌ API Request Error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // ========== PUBLIC HTTP METHODS ==========

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // ========== TRANSFER ENDPOINTS ==========

  async validateUsername(username: string): Promise<ApiResponse<{
    username: string;
    name: string;
  }>> {
    return this.get(`/api/transfer/validate-username/${username}`);
  }

  async getContacts(): Promise<ApiResponse<Array<{
    id: string;
    username: string;
    name: string;
    address: string;
    interactionCount: number;
    transferCount: number;
    totalAmountTransferred: number;
    lastInteractedAt: string;
  }>>> {
    return this.get('/api/transfer/contacts');
  }

  async getRecentContacts(limit: number = 5): Promise<ApiResponse<Array<{
    username: string;
    name: string;
    lastInteractedAt: string;
  }>>> {
    return this.get(`/api/transfer/contacts/recent?limit=${limit}`);
  }

  /**
   * Send USDC to another user by username
   * Automatically includes passkey verification if available
   */
  async sendToUsername(params: {
    username: string;
    amount: number;
    message?: string;
  }): Promise<ApiResponse<{
    transferId: string;
    from: string;
    to: string;
    amount: number;
    transactionHash: string;
    explorerUrl: string;
    gasSponsored: boolean;
    message?: string;
  }>> {
    return this.post('/api/transfer/send/username', params);
  }

  /**
   * Send USDC to external wallet
   * Automatically includes passkey verification if available
   */
  async sendToExternal(params: {
    address: string;
    amount: number;
    message?: string;
  }): Promise<ApiResponse<{
    transferId: string;
    from: string;
    to: string;
    amount: number;
    transactionHash: string;
    explorerUrl: string;
    gasSponsored: boolean;
  }>> {
    return this.post('/api/transfer/send/external', params);
  }

  async createPaymentLink(params: {
    amount: number;
    message?: string;
  }): Promise<ApiResponse<{
    transferId: string;
    linkCode: string;
    claimUrl: string;
    amount: number;
    message?: string;
    inviteCode?: string;
    expiresAt: string;
    status: string;
  }>> {
    return this.post('/api/transfer/create-link', params);
  }

  async getPaymentLinkDetails(linkCode: string): Promise<ApiResponse<{
    from: string;
    fromName: string;
    amount: number;
    message?: string;
    status: string;
    isClaimed: boolean;
    isExpired: boolean;
    claimedBy?: string;
    claimedAt?: string;
    expiresAt: string;
    transactionHash?: string;
    inviteCode?: string;
    requiresSignup: boolean;
  }>> {
    return this.get(`/api/transfer/link/${linkCode}`);
  }

  async claimPaymentLink(linkCode: string): Promise<ApiResponse<{
    transferId: string;
    from: string;
    amount: number;
    transactionHash: string;
    explorerUrl: string;
    gasSponsored: boolean;
    message?: string;
  }>> {
    return this.post(`/api/transfer/claim/${linkCode}`);
  }

  async cancelPaymentLink(linkCode: string): Promise<ApiResponse> {
    return this.delete(`/api/transfer/link/${linkCode}`);
  }

  async getTransferHistory(): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    direction: 'SENT' | 'RECEIVED';
    from: string;
    to: string;
    amount: number;
    status: string;
    message?: string;
    transactionHash?: string;
    linkCode?: string;
    createdAt: string;
    claimedAt?: string;
  }>>> {
    return this.get('/api/transfer/history');
  }

  async getWalletBalance(): Promise<ApiResponse<{
    ownerAddress: string;
    smartAccountAddress: string;
    network: string;
    ethBalance: string;
    usdcBalance: string;
    balances: {
      ETH: {
        balance: string;
        balanceInWei: string;
      };
      USDC: {
        balance: string;
        balanceInWei: string;
      };
    };
    isReal: boolean;
    // Legacy fields for backward compatibility
    balance?: string;
    formattedBalance?: string;
    address?: string;
  }>> {
    return this.get('/api/wallet/balance');
  }

  // ========== OFFRAMP ENDPOINTS ==========

  /**
   * Verify Nigerian bank account details
   */
  async verifyBankAccount(params: {
    accountNumber: string;
    bankCode: string;
  }): Promise<ApiResponse<{
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
  }>> {
    return this.post('/api/offramp/verify-account', params);
  }

  /**
   * Get current offramp exchange rate
   * Updated to match actual API response structure
   * @param amountUSDC - Optional amount in USDC to get specific calculation
   */
  async getOfframpRate(amountUSDC?: number): Promise<ApiResponse<{
    baseRate: number;
    offrampRate: number;
    markup: number;
    fee: {
      percentage: number;
      amountUSDC: number;
      amountNGN: number;
      maxFeeUSD: number;
      effectiveFeePercent: number;
    };
    calculation?: {
      amountUSDC: number;
      feeUSDC: number;
      netUSDC: number;
      ngnAmount: number;
      effectiveRate: number;
      lpFeeUSDC: number;
      breakdown: string;
    };
    source?: string;
    cached?: boolean;
    timestamp?: string;
  }>> {
    const endpoint = amountUSDC 
      ? `/api/offramp/rate?amountUSDC=${amountUSDC}`
      : '/api/offramp/rate';
    return this.get(endpoint);
  }

  /**
   * Initiate offramp transaction
   */
  async initiateOfframp(params: {
    amountUSDC: number;
    accountNumber: string;
    bankCode: string;
    name?: string;
  }): Promise<ApiResponse<{
    transactionReference: string;
    status: string;
    amountUSDC: number;
    amountNGN: number;
    accountName: string;
    nextStep: string;
  }>> {
    // Backend expects beneficiary object with name, accountNumber, bankCode
    return this.post('/api/offramp/initiate', {
      amountUSDC: params.amountUSDC,
      beneficiary: {
        name: params.name || '', // Backend will use verified name from Lenco
        accountNumber: params.accountNumber,
        bankCode: params.bankCode
      }
    });
  }

  /**
   * Confirm account and sign with passkey
   */
  async confirmOfframpAndSign(params: {
    transactionReference: string;
    accountNumber: string;
    bankCode: string;
  }): Promise<ApiResponse<{
    transactionReference: string;
    status: string;
    amountUSDC: number;
    amountNGN: number;
    accountName: string;
    lencoReference: string;
    estimatedTime: string;
    verifiedWithPasskey: boolean;
  }>> {
    return this.post('/api/offramp/confirm-account-and-sign', params);
  }

  /**
   * Get offramp transaction status
   */
  async getOfframpStatus(reference: string): Promise<ApiResponse<{
    status: string;
    amountUSDC: number;
    amountNGN: number;
    accountName: string;
    createdAt: string;
    completedAt?: string;
  }>> {
    return this.get(`/api/offramp/status/${reference}`);
  }

  /**
   * Get offramp history
   */
  async getOfframpHistory(): Promise<ApiResponse<Array<{
    id: string;
    transactionReference: string;
    status: string;
    amountUSDC: number;
    amountNGN: number;
    accountName: string;
    bankName: string;
    createdAt: string;
  }>>> {
    return this.get('/api/offramp/history');
  }

  // ========== BENEFICIARY ENDPOINTS ==========

  /**
   * Add new beneficiary
   */
  async addBeneficiary(params: {
    name: string;
    accountNumber: string;
    bankCode: string;
  }): Promise<ApiResponse<{
    id: string;
    name: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
  }>> {
    return this.post('/api/offramp/beneficiaries', params);
  }

  /**
   * Get all beneficiaries
   */
  async getBeneficiaries(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    isDefault: boolean;
    createdAt: string;
  }>>> {
    return this.get('/api/offramp/beneficiaries');
  }

  /**
   * Delete beneficiary
   */
  async deleteBeneficiary(id: string): Promise<ApiResponse> {
    return this.delete(`/api/offramp/beneficiaries/${id}`);
  }

  /**
   * Set default beneficiary
   */
  async setDefaultBeneficiary(id: string): Promise<ApiResponse> {
    return this.put(`/api/offramp/beneficiaries/${id}/default`);
  }

  /**
   * Get frequently used accounts
   */
  async getFrequentAccounts(): Promise<ApiResponse<Array<{
    accountNumber: string;
    bankCode: string;
    bankName: string;
    accountName: string;
    transactionCount: number;
    lastUsed: string;
  }>>> {
    return this.get('/api/offramp/frequent-accounts');
  }
}

const apiClient = new ApiClient(BASE_URL);

export default apiClient;
export { ApiClient };
export type { ApiResponse };