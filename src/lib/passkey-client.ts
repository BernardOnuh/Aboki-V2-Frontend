// ============= lib/passkey-client.ts =============
/**
 * Passkey Client for Transaction Verification
 * Handles WebAuthn passkey authentication for transaction signing
 */

import apiClient from './api-client';

interface PasskeyVerificationOptions {
  challenge: string;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
}

interface PasskeyVerificationResult {
  verified: boolean;
  token?: string;
  error?: string;
}

class PasskeyClient {
  private verificationToken: string | null = null;

  /**
   * Check if passkey is supported in this browser
   */
  isSupported(): boolean {
    return !!(
      window.PublicKeyCredential &&
      navigator.credentials &&
      navigator.credentials.get
    );
  }

  /**
   * Verify transaction with passkey biometric authentication
   * @param transactionData - Details about the transaction being verified
   */
  async verifyTransaction(transactionData: {
    type: 'send' | 'withdraw';
    amount: number;
    recipient: string;
    message?: string;
  }): Promise<PasskeyVerificationResult> {
    try {
      if (!this.isSupported()) {
        return {
          verified: false,
          error: 'Passkey authentication is not supported in this browser'
        };
      }

      // Step 1: Get verification challenge from backend
      console.log('🔐 Requesting passkey verification challenge...');
      const optionsResponse = await apiClient.post<{
        challenge: string;
        timeout: number;
        rpId: string;
        allowCredentials: Array<{
          id: string;
          type: 'public-key';
        }>;
      }>('/api/auth/passkey/transaction-verify-options', transactionData);

      if (!optionsResponse.success || !optionsResponse.data) {
        return {
          verified: false,
          error: optionsResponse.error || 'Failed to get verification challenge'
        };
      }

      const { challenge, timeout, rpId, allowCredentials } = optionsResponse.data;

      // Step 2: Trigger browser passkey authentication
      console.log('👆 Requesting biometric authentication...');
      
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: this.base64ToArrayBuffer(challenge),
          timeout: timeout || 60000,
          rpId: rpId || window.location.hostname,
          allowCredentials: allowCredentials.map(cred => ({
            id: this.base64ToArrayBuffer(cred.id),
            type: 'public-key' as const
          })),
          userVerification: 'required' as UserVerificationRequirement
        }
      }) as PublicKeyCredential | null;

      if (!credential) {
        return {
          verified: false,
          error: 'Authentication cancelled or failed'
        };
      }

      // Step 3: Verify the credential with backend
      console.log('✅ Biometric authentication successful, verifying...');
      
      const response = credential.response as AuthenticatorAssertionResponse;
      
      const verifyResponse = await apiClient.post<{
        verified: boolean;
        token: string;
      }>('/api/auth/passkey/transaction-verify', {
        credentialId: this.arrayBufferToBase64(credential.rawId),
        authenticatorData: this.arrayBufferToBase64(response.authenticatorData),
        clientDataJSON: this.arrayBufferToBase64(response.clientDataJSON),
        signature: this.arrayBufferToBase64(response.signature),
        userHandle: response.userHandle ? this.arrayBufferToBase64(response.userHandle) : null,
        transactionData
      });

      if (!verifyResponse.success || !verifyResponse.data?.verified) {
        return {
          verified: false,
          error: verifyResponse.error || 'Verification failed'
        };
      }

      // Store verification token
      this.verificationToken = verifyResponse.data.token;

      console.log('✅ Transaction verified with passkey');
      return {
        verified: true,
        token: verifyResponse.data.token
      };

    } catch (error: any) {
      console.error('❌ Passkey verification error:', error);
      
      // Handle specific WebAuthn errors
      if (error.name === 'NotAllowedError') {
        return {
          verified: false,
          error: 'Authentication was cancelled or timed out'
        };
      } else if (error.name === 'InvalidStateError') {
        return {
          verified: false,
          error: 'Passkey not found. Please register a passkey first.'
        };
      } else if (error.name === 'NotSupportedError') {
        return {
          verified: false,
          error: 'Passkey is not supported on this device'
        };
      }

      return {
        verified: false,
        error: error.message || 'Verification failed'
      };
    }
  }

  /**
   * Get the current verification token (for use in API requests)
   */
  getVerificationToken(): string | null {
    return this.verificationToken;
  }

  /**
   * Clear the verification token
   */
  clearVerificationToken(): void {
    this.verificationToken = null;
  }

  // Helper functions for base64 encoding/decoding
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

// Export singleton instance
const passkeyClient = new PasskeyClient();

export default passkeyClient;
export { PasskeyClient };
export type { PasskeyVerificationResult };