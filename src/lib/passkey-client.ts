// ============= lib/passkey-client.ts (WITH BACKEND INTEGRATION) =============
/**
 * Passkey/WebAuthn Client for Transaction Verification
 */

const BASE_URL = 'https://apis.aboki.xyz';

interface TransactionData {
  type: 'send' | 'withdraw';
  amount: number;
  recipient: string;
  message?: string;
}

interface PasskeyVerificationResult {
  verified: boolean;
  token?: string;
  error?: string;
}

class PasskeyClient {
  private verificationToken: string | null = null;
  private rpId: string | null = null;
  private rpName: string = 'Aboki';
  private origin: string = '';
  private baseUrl: string = BASE_URL;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;

    if (typeof window !== 'undefined') {
      this.origin = window.location.origin;
      this.rpId = this.extractDomain(this.origin);
    }
  }

  /**
   * Extract hostname for RPID
   */
  private extractDomain(origin: string): string {
    try {
      return new URL(origin).hostname;
    } catch {
      return 'localhost';
    }
  }

  /**
   * Safari / iOS detection
   */
  private isSafari(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent;
    return /^((?!chrome|android).)*safari/i.test(ua);
  }

  /**
   * WebAuthn feature detection (TS-safe)
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;

    return (
      typeof window.PublicKeyCredential !== 'undefined' &&
      typeof navigator.credentials !== 'undefined' &&
      typeof navigator.credentials.get === 'function'
    );
  }

  /**
   * Normalize PublicKeyCredentialRequestOptions for Safari/iOS
   */
  private normalizeRequestOptions(
    options: PublicKeyCredentialRequestOptions
  ): PublicKeyCredentialRequestOptions {
    const normalized: PublicKeyCredentialRequestOptions = {
      ...options,

      // Safari/iOS prefers shorter timeouts
      timeout: options.timeout ?? (this.isSafari() ? 60000 : 120000),

      // Safari breaks if allowCredentials is an empty array
      allowCredentials:
        options.allowCredentials && options.allowCredentials.length > 0
          ? options.allowCredentials
          : undefined,

      // Explicitly disable unsupported features
      extensions: options.extensions ?? {}
    };

    return normalized;
  }

  /**
   * Verify a transaction using passkey / biometrics
   */
  async verifyTransaction(
    data: TransactionData
  ): Promise<PasskeyVerificationResult> {
    console.log('🔐 Passkey Verification - Starting', {
      ...data,
      origin: this.origin,
      rpId: this.rpId,
      isSafari: this.isSafari(),
      supported: this.isSupported()
    });

    try {
      // ============= STEP 1: Feature support =============
      if (!this.isSupported()) {
        return {
          verified: false,
          error: 'WebAuthn is not supported on this browser'
        };
      }

      // ============= STEP 1.5: Platform authenticator check =============
      try {
        const available =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!available) {
          return {
            verified: false,
            error: 'Biometric or device PIN authentication is not available'
          };
        }
      } catch {
        // Safari sometimes throws here — continue
      }

      // ============= STEP 2: Get challenge from backend =============
      const authToken = this.getAuthToken();
      if (!authToken) {
        return {
          verified: false,
          error: 'Not authenticated. Please log in again.'
        };
      }

      const optionsResponse = await fetch(
        `${this.baseUrl}/api/auth/passkey/transaction-verify-options`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            transactionType: data.type,
            amount: data.amount,
            recipient: data.recipient,
            message: data.message
          })
        }
      );

      const optionsJson = await optionsResponse.json();

      if (!optionsResponse.ok || !optionsJson.success) {
        return {
          verified: false,
          error:
            optionsJson?.error ??
            'Failed to retrieve passkey verification options'
        };
      }

      const { options, transactionId } = optionsJson.data;

      // ============= STEP 3: Biometric assertion =============
      const publicKey = this.normalizeRequestOptions(options);

      // IMPORTANT: Must be called from a user gesture (click/tap)
      const assertion = (await navigator.credentials.get({
        publicKey
      })) as PublicKeyCredential | null;

      if (!assertion) {
        return {
          verified: false,
          error: 'Biometric verification was cancelled'
        };
      }

      const response = assertion.response as AuthenticatorAssertionResponse;

      // ============= STEP 4: Send assertion to backend =============
      const verifyResponse = await fetch(
        `${this.baseUrl}/api/auth/passkey/transaction-verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            transactionId,
            clientAssertion: {
              id: Array.from(new Uint8Array(assertion.rawId)),
              clientDataJSON: Array.from(
                new Uint8Array(response.clientDataJSON)
              ),
              authenticatorData: Array.from(
                new Uint8Array(response.authenticatorData)
              ),
              signature: Array.from(new Uint8Array(response.signature)),
              userHandle: response.userHandle
                ? Array.from(new Uint8Array(response.userHandle))
                : null
            }
          })
        }
      );

      const verifyJson = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyJson.success) {
        return {
          verified: false,
          error: verifyJson?.error ?? 'Transaction verification failed'
        };
      }

      // ============= STEP 5: Store verification token =============
      const token = verifyJson.data.verificationToken;
      this.storeVerificationToken(token);

      return {
        verified: true,
        token
      };
    } catch (error: any) {
      console.error('❌ Passkey verification error', error);

      let message = 'Passkey verification failed';

      switch (error?.name) {
        case 'NotAllowedError':
          message =
            'Verification was cancelled or timed out. Please try again.';
          break;
        case 'SecurityError':
          message =
            'Security error. Please refresh the page or use the correct domain.';
          break;
        case 'NotSupportedError':
          message = 'This browser does not fully support passkeys.';
          break;
        case 'NetworkError':
          message = 'Network error. Please check your connection.';
          break;
      }

      return {
        verified: false,
        error: message
      };
    }
  }

  /**
   * Token helpers
   */
  getVerificationToken(): string | null {
    if (!this.verificationToken && typeof window !== 'undefined') {
      this.verificationToken = localStorage.getItem(
        'passkey_verification_token'
      );
    }
    return this.verificationToken;
  }

  private storeVerificationToken(token: string): void {
    this.verificationToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('passkey_verification_token', token);
    }
  }

  clearVerificationToken(): void {
    this.verificationToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('passkey_verification_token');
    }
  }

  /**
   * Auth token
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aboki_auth_token');
    }
    return null;
  }

  /**
   * Config debug helper
   */
  getConfig() {
    return {
      origin: this.origin,
      rpId: this.rpId,
      rpName: this.rpName,
      isSafari: this.isSafari(),
      supported: this.isSupported(),
      baseUrl: this.baseUrl,
      hasVerificationToken: !!this.verificationToken
    };
  }
}

const passkeyClient = new PasskeyClient();

export default passkeyClient;
export { PasskeyClient };
export type { PasskeyVerificationResult, TransactionData };
