"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  RZeroMail: () => RZeroMail,
  default: () => RZeroMail
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var RZeroMail = class {
  baseUrl;
  defaultDomain;
  timeout;
  constructor(config = {}) {
    this.baseUrl = (config.baseUrl || "https://rzmail.my.id").replace(/\/+$/, "");
    this.defaultDomain = config.defaultDomain;
    this.timeout = config.timeout || 15e3;
  }
  async request(path, searchParams) {
    const url = new URL(`${this.baseUrl}${path}`);
    if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        if (value !== void 0) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "rzero-mail-sdk/1.0.0"
        },
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`RZero API Error (${response.status}): ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      if (err.name === "AbortError") {
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
  async getDomains() {
    const res = await this.request("/api/domains");
    return res.domains || [];
  }
  /**
   * Generate an instant random disposable email address.
   */
  async createRandom(options = {}) {
    const domain = options.domain || this.defaultDomain;
    const res = await this.request("/api/create", domain ? { domain } : void 0);
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
  async createCustom(nameOrEmail, options = {}) {
    let name = nameOrEmail;
    let domain = options.domain || this.defaultDomain;
    if (nameOrEmail.includes("@")) {
      const [u, d] = nameOrEmail.split("@");
      name = u;
      domain = d;
    }
    const params = {
      name,
      domain,
      pin: options.pin
    };
    const res = await this.request("/api/custom", params);
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
  async getMessages(address, pin) {
    return this.request(
      `/api/messages/${encodeURIComponent(address)}`,
      pin ? { pin } : void 0
    );
  }
  /**
   * Retrieve full details of a single message (HTML/Text bodies).
   */
  async getMessage(address, messageId, pin) {
    return this.request(
      `/api/inboxes/${encodeURIComponent(address)}/messages/${encodeURIComponent(messageId)}`,
      pin ? { pin } : void 0
    );
  }
  /**
   * Get latest extracted OTP code for an address.
   */
  async getOtp(address, pin) {
    return this.request(
      `/api/otp/${encodeURIComponent(address)}`,
      pin ? { pin } : void 0
    );
  }
  /**
   * Polls the inbox until an OTP arrives or timeout is reached.
   * Returns the clean OTP string (e.g. "482910").
   */
  async waitForOtp(address, options = {}) {
    const timeoutMs = options.timeoutMs ?? 6e4;
    const intervalMs = options.intervalMs ?? 3e3;
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const res = await this.getOtp(address, options.pin);
        if (res.success && res.has_otp && res.otp) {
          return res.otp;
        }
      } catch {
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error(`Timeout after ${timeoutMs}ms waiting for OTP on ${address}`);
  }
  /**
   * Lock an inbox with a security PIN.
   */
  async lock(address, pin) {
    return this.request(
      `/api/inboxes/${encodeURIComponent(address)}/lock`,
      { pin }
    );
  }
  /**
   * Delete or unlink an inbox.
   */
  async delete(address, pin) {
    return this.request(
      `/api/inboxes/${encodeURIComponent(address)}/delete`,
      pin ? { pin } : void 0
    );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RZeroMail
});
