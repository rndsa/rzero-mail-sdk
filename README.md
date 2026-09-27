# @rndsa/rzero-mail

> High-speed developer SDK for [RZero Mail](https://github.com/rndsa/rzero-mail) — disposable temporary email, multi-domain routing, and automated OTP extraction.

Zero runtime dependencies. Dual ESM/CJS build with full TypeScript definitions. Works natively across Node.js 18+, Bun, Deno, and Cloudflare Workers.

---

## Installation

### From GitHub Packages:
```bash
# Set registry to GitHub Packages:
npm config set @rndsa:registry https://npm.pkg.github.com

# Install package:
npm install @rndsa/rzero-mail
```

---

## Quickstart

```typescript
import { RZeroMail } from '@rndsa/rzero-mail';

const mail = new RZeroMail();

// 1. Generate an instant random inbox:
const inbox = await mail.createRandom();
console.log('Address:', inbox.address); // e.g. swiftfox88@rzmail.my.id

// 2. Wait for incoming OTP code automatically (polls until received or timeout):
const otp = await mail.waitForOtp(inbox.address, { timeoutMs: 60000 });
console.log('Verification OTP:', otp); // e.g. "482910"
```

---

## Custom Domain Usage

### 1. Using a Custom Email Domain:
Select any active verified domain supported by the server:
```typescript
// Fetch list of available domains:
const domains = await mail.getDomains();
console.log(domains); // ['rzmail.my.id', 'zallpyx.xyz', 'rndsa.cyou', ...]

// Generate random inbox on a specific domain:
const inbox = await mail.createRandom({ domain: 'zallpyx.xyz' });

// Or create a custom named inbox:
const custom = await mail.createCustom('mybot', { domain: 'rndsa.cyou' });
console.log(custom.address); // mybot@rndsa.cyou
```

### 2. Pointing to a Self-Hosted RZero Instance:
If you deploy your own instance of RZero Mail on Cloudflare Workers with your own custom domain:
```typescript
const mail = new RZeroMail({
  baseUrl: 'https://mail.mycustomdomain.com',
  defaultDomain: 'mycustomdomain.com',
  timeout: 10000 // 10s timeout
});
```

---

## API Reference

### Methods

| Method | Parameters | Return Type | Description |
|---|---|---|---|
| `getDomains()` | - | `Promise<string[]>` | Returns list of active verified email domains. |
| `createRandom(options?)` | `{ domain?: string }` | `Promise<InboxResponse>` | Generates a new random temporary email address. |
| `createCustom(name, options?)` | `nameOrEmail, { domain?, pin? }` | `Promise<InboxResponse>` | Creates or binds a custom username and domain. |
| `getMessages(address, pin?)` | `address: string, pin?: string` | `Promise<MessagesResponse>` | Lists all received messages in an inbox. |
| `getMessage(address, id, pin?)` | `address, messageId, pin?` | `Promise<MessageDetailResponse>` | Fetches full message payload (HTML & raw text). |
| `getOtp(address, pin?)` | `address: string, pin?: string` | `Promise<OtpResponse>` | Returns latest extracted 4–8 digit verification code. |
| `waitForOtp(address, options?)`| `address, { timeoutMs?, intervalMs?, pin? }` | `Promise<string>` | Polling helper that resolves with the OTP string. |
| `lock(address, pin)` | `address: string, pin: string` | `Promise<{ success: boolean }>` | Locks an inbox with a security PIN. |
| `delete(address, pin?)` | `address: string, pin?: string` | `Promise<{ success: boolean }>` | Deletes or unlinks an inbox. |

---

## License

MIT © [ren](https://github.com/rndsa)
