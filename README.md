# FitForge Nutrition admin

Shop desk for a fitness retailer: products, FEFO inventory, counter billing, GST-style invoices, purchases, expenses, and reports. The seeded shop is **sample data for local development**, not a real business.

## Prerequisites

- Node.js 20+
- MySQL on localhost port 3306

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

This folder is the shop desk. Its `.env` only has `NEXT_PUBLIC_API_URL`. The database, Prisma, mail, storage, and WhatsApp settings live in `../GYM-API`.

From `GYM-API`, run `npm install` and `npm run dev`. That API listens on http://localhost:4000. Apply migrations and seed from that folder with `npx prisma migrate deploy` and `npm run db:seed`.

Open http://localhost:3000 and sign in:

| Role | Email | Password |
| --- | --- | --- |
| Owner | owner@fitforge.demo | FitForge#2026 |
| Manager | manager@fitforge.demo | FitForge#2026 |
| Cashier | cashier@fitforge.demo | FitForge#2026 |
| Inventory | inventory@fitforge.demo | FitForge#2026 |
| Accountant | accountant@fitforge.demo | FitForge#2026 |

## Scripts

- `npm run dev` starts the shop desk on port 3000
- Start the API from `../GYM-API` with `npm run dev`. It listens on port **4000**
- `npm run test` runs unit tests
- `npm run test:e2e` runs Playwright (requires the database and `npx playwright install`)
- `npm run typecheck` and `npm run lint`

## Money, stock, and invoices

- Amounts are MySQL decimals. The app does not calculate money with binary floats in the pricing, tax, or register logic.
- Timestamps are stored in UTC. Shop dates use `Asia/Kolkata`.
- **Net sales** are merchandise after discounts and returns, excluding GST.
- **Invoice total** includes GST and rupee rounding.
- **Cash collected** is cash payments minus cash refunds. UPI, card, and bank receipts are reported with payment methods, not as cash.
- **Gross profit** is net sales minus the cost of the batches actually sold.
- **Operating profit** is gross profit minus recorded expenses.
- Stock changes only inside a database transaction that also writes a stock movement.
- Sales use **FEFO**: earliest expiry first. Expired and recalled batches cannot be sold.
- Negative stock is rejected unless an authorized role explicitly overrides it.
- Purchase orders do not increase stock. Goods receipts do.
- Issued invoices are not edited. Use a return, which creates a credit note.
- Repeating a checkout with the same idempotency key does not bill twice.
- Invoice numbers are `PREFIX-FY-00001`, allocated with a locked sequence. The financial year starts in April.

## WhatsApp and email

Leave `WHATSAPP_PROVIDER=none` to use a click-to-chat link. That link is stored as `CLICK_TO_CHAT` and is **not** a delivered message.

For the WhatsApp Cloud API set `WHATSAPP_PROVIDER=meta`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, and `WHATSAPP_VERIFY_TOKEN`. Point the webhook to `/api/whatsapp/webhook`. Templates must be approved in Meta; the app does not bypass that.

Twilio uses `WHATSAPP_PROVIDER=twilio` plus `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_FROM`.

Customers must opt in before the app calls the provider. Credentials stay in environment variables.

Email (password reset and optional invoice mail) needs `SMTP_HOST` and `SMTP_FROM`. Without them, development shows the reset link on screen and does not claim an email was sent.

## Images

The API stores new product images in this app's `public/uploads` folder unless S3 is configured in `GYM-API/.env`. Seed photos use Unsplash source URLs. If a remote image fails, the product image falls back to `/placeholders/product.svg`.

## Backups and deployment

```bash
mysqldump -uroot -p gym_admin > fitforge.sql
```

The API that can be uploaded to Lambda lives in `../GYM-API`. Invoice PDFs open inline at `/api/invoices/<id>/pdf` and download with `?download=1`.

For production, set the API `.env`, serve this desk with `npm run build` and `npm start`, put TLS in front of it, and keep both `.env` files out of git. Session cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` in production. Passwords are hashed with bcrypt. Login attempts are rate-limited and accounts lock after repeated failures.

## Health

`GET /api/health` reports database, storage, email, and WhatsApp configuration without revealing secrets.
