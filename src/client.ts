import type {
  RZeroConfig,
  DomainListResponse,
  InboxResponse,
  MessagesResponse,
  MessageDetailResponse,
  OtpResponse,
  WaitForOtpOptions
} from './types';

export class RZeroMail {
  private readonly baseUrl: string;
  private readonly defaultDomain?: string;
  private readonly timeout: number;

  constructor(config: RZeroConfig = {}) {
    this.baseUrl = (config.baseUrl || 'https://rzmail.my.id').replace(/\/+$/, '');
    this.defaultDomain = config.defaultDomain;
    this.timeout = config.timeout || 15000;
  }

  private async request<T>(
    path: string,
    searchParams?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'rzero-mail-sdk/1.0.0'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`RZero API Error (${response.status}): ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`RZero API Request Timed Out (${this.timeout}ms): ${url.toString()}`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fetch list of active verified domains from server.
   */
  async getDomains(): Promise<string[]> {
    const res = await this.request<DomainListResponse>('/api/domains');
    return res.domains || [];
  }

  /**
   * Generate an instant random disposable email address.
   */
  async createRandom(options: { domain?: string } = {}): Promise<InboxResponse> {
    const domain = options.domain || this.defaultDomain;
    const res = await this.request<any>('/api/create', domain ? { domain } : undefined);
    return {
      success: Boolean(res.success),
      address: res.address || res.inbox?.address,
      isLocked: Boolean(res.isLocked || res.inbox?.isLocked),
      isOwner: Boolean(res.isOwner || res.inbox?.isOwner),
      created: Boolean(res.created || res.inbox?.created)
    };
  }

  /**
   * Create or bind a custom inbox with username, optional custom domain, and security PIN.
   */
  async createCustom(
    nameOrEmail: string,
    options: { domain?: string; pin?: string } = {}
  ): Promise<InboxResponse> {
    let name = nameOrEmail;
    let domain = options.domain || this.defaultDomain;

    if (nameOrEmail.includes('@')) {
      const [u, d] = nameOrEmail.split('@');
      name = u;
      domain = d;
    }

    const params: Record<string, string | undefined> = {
      name,
      domain,
      pin: options.pin
    };

    const res = await this.request<any>('/api/custom', params);
    return {
      success: Boolean(res.success),
      address: res.address || res.inbox?.address || (domain ? `${name}@${domain}` : name),
      isLocked: Boolean(res.isLocked || res.inbox?.isLocked),
      isOwner: Boolean(res.isOwner || res.inbox?.isOwner),
      created: Boolean(res.created || res.inbox?.created)
    };
  }

  /**
   * Retrieve list of messages received by an inbox.
   */
  async getMessages(address: string, pin?: string): Promise<MessagesResponse> {
    return this.request<MessagesResponse>(
      `/api/messages/${encodeURIComponent(address)}`,
      pin ? { pin } : undefined
    );
  }

  /**
   * Retrieve full details of a single message (HTML/Text bodies).
   */
  async getMessage(address: string, messageId: string, pin?: string): Promise<MessageDetailResponse> {
    return this.request<MessageDetailResponse>(
      `/api/inboxes/${encodeURIComponent(address)}/messages/${encodeURIComponent(messageId)}`,
      pin ? { pin } : undefined
    );
  }

  /**
   * Get latest extracted OTP code for an address.
   */
  async getOtp(address: string, pin?: string): Promise<OtpResponse> {
    return this.request<OtpResponse>(
      `/api/otp/${encodeURIComponent(address)}`,
      pin ? { pin } : undefined
    );
  }

  /**
   * Polls the inbox until an OTP arrives or timeout is reached.
   * Returns the clean OTP string (e.g. "482910").
   */
  async waitForOtp(address: string, options: WaitForOtpOptions = {}): Promise<string> {
    const timeoutMs = options.timeoutMs ?? 60000;
    const intervalMs = options.intervalMs ?? 3000;
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const res = await this.getOtp(address, options.pin);
        if (res.success && res.has_otp && res.otp) {
          return res.otp;
        }
      } catch {
        // Suppress transient network hiccups during polling
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Timeout after ${timeoutMs}ms waiting for OTP on ${address}`);
  }

  /**
   * Lock an inbox with a security PIN.
   */
  async lock(address: string, pin: string): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>(
      `/api/inboxes/${encodeURIComponent(address)}/lock`,
      { pin }
    );
  }

  /**
   * Delete or unlink an inbox.
   */
  async delete(address: string, pin?: string): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>(
      `/api/inboxes/${encodeURIComponent(address)}/delete`,
      pin ? { pin } : undefined
    );
  }
}
