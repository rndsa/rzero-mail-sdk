import type { RZeroConfig, InboxResponse, MessagesResponse, MessageDetailResponse, OtpResponse, WaitForOtpOptions } from './types';
export declare class RZeroMail {
    private readonly baseUrl;
    private readonly defaultDomain?;
    private readonly timeout;
    constructor(config?: RZeroConfig);
    private request;
    /**
     * Fetch list of active verified domains from server.
     */
    getDomains(): Promise<string[]>;
    /**
     * Generate an instant random disposable email address.
     */
    createRandom(options?: {
        domain?: string;
    }): Promise<InboxResponse>;
    /**
     * Create or bind a custom inbox with username, optional custom domain, and security PIN.
     */
    createCustom(nameOrEmail: string, options?: {
        domain?: string;
        pin?: string;
    }): Promise<InboxResponse>;
    /**
     * Retrieve list of messages received by an inbox.
     */
    getMessages(address: string, pin?: string): Promise<MessagesResponse>;
    /**
     * Retrieve full details of a single message (HTML/Text bodies).
     */
    getMessage(address: string, messageId: string, pin?: string): Promise<MessageDetailResponse>;
    /**
     * Get latest extracted OTP code for an address.
     */
    getOtp(address: string, pin?: string): Promise<OtpResponse>;
    /**
     * Polls the inbox until an OTP arrives or timeout is reached.
     * Returns the clean OTP string (e.g. "482910").
     */
    waitForOtp(address: string, options?: WaitForOtpOptions): Promise<string>;
    /**
     * Lock an inbox with a security PIN.
     */
    lock(address: string, pin: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    /**
     * Delete or unlink an inbox.
     */
    delete(address: string, pin?: string): Promise<{
        success: boolean;
        message?: string;
    }>;
}
//# sourceMappingURL=client.d.ts.map