export interface RZeroConfig {
    /**
     * Base API endpoint URL. Defaults to 'https://rzmail.my.id'.
     * Allows pointing to self-hosted custom domain instances.
     */
    baseUrl?: string;
    /**
     * Default domain to append when generating inboxes.
     */
    defaultDomain?: string;
    /**
     * HTTP request timeout in milliseconds. Default: 15000 (15s).
     */
    timeout?: number;
}
export interface DomainListResponse {
    success: boolean;
    domains: string[];
}
export interface InboxResponse {
    success: boolean;
    address: string;
    isLocked: boolean;
    isOwner?: boolean;
    created?: boolean;
}
export interface MessageSummary {
    id: string;
    from_address: string;
    subject: string;
    snippet?: string;
    otp_code?: string | null;
    received_at: string;
}
export interface MessagesResponse {
    success: boolean;
    address: string;
    isLocked: boolean;
    count: number;
    messages: MessageSummary[];
}
export interface MessageDetailResponse {
    success: boolean;
    message?: {
        id: string;
        from_address: string;
        to_address: string;
        subject: string;
        html_body?: string;
        text_body?: string;
        otp_code?: string | null;
        received_at: string;
    };
    error?: string;
}
export interface OtpResponse {
    success: boolean;
    address: string;
    has_otp: boolean;
    otp: string | null;
    from?: string;
    subject?: string;
    received_at?: string;
    message?: string;
}
export interface WaitForOtpOptions {
    /**
     * Maximum duration to wait before timing out (in ms). Default: 60000 (60s).
     */
    timeoutMs?: number;
    /**
     * Polling interval between checks (in ms). Default: 3000 (3s).
     */
    intervalMs?: number;
    /**
     * Inbox PIN if the inbox is locked.
     */
    pin?: string;
}
//# sourceMappingURL=types.d.ts.map