# Part 1: Vercel + Supabase Contact Backend

This starter gives you a Level 1 backend for contact forms.

## What is included

- `api/contact.js`: Serverless endpoint for form submission
- `supabase/schema.sql`: Table + indexes + RLS policy
- `.env.example`: Required environment variables
- `vercel.json`: Function runtime config

## 1) Create Supabase table

1. Open Supabase dashboard.
2. Go to SQL Editor.
3. Run file: `supabase/schema.sql`.

## 2) Deploy backend to Vercel

1. Create a new GitHub repo for `backend-vercel` (recommended), or deploy this folder from monorepo settings.
2. Import repo to Vercel.
3. Set environment variables in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ALLOWED_ORIGIN` (example: `https://username.github.io`)
4. Deploy.
5. Confirm endpoint works:
   - `POST https://YOUR_BACKEND_DOMAIN/api/contact`

## 3) Connect frontend form

In `contact.html`, set form attribute:

- `data-api-base="https://YOUR_BACKEND_DOMAIN"`

The page script will send form data to:

- `https://YOUR_BACKEND_DOMAIN/api/contact`

## 4) Test checklist

1. Submit valid form: should show success message.
2. Submit invalid email: should show validation error.
3. Confirm row appears in Supabase table `contact_submissions`.
4. Confirm browser cannot query table directly due to RLS policy.

## 5) Free-tier safety tips

1. Keep payload small.
2. Add CAPTCHA in next step if spam appears.
3. Restrict `ALLOWED_ORIGIN` to your actual domain.
4. Rotate `SUPABASE_SERVICE_ROLE_KEY` if exposed.

---

## Part 2: Forms + Payments Backend (Paystack)

Included endpoints:

- `POST /api/payments-create-checkout`
- `POST /api/payments-webhook`
- `GET /api/payments-verify?reference=...`

### 1) Create payment tables

1. Open Supabase SQL Editor.
2. Run: `supabase/part2_payments_schema.sql`.

### 2) Add env vars in Vercel

Required additions:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_CALLBACK_URL`

Also ensure these already exist from Part 1:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGIN`

### 3) Configure Paystack webhook

In Paystack dashboard webhook URL, set:

- `https://YOUR_BACKEND_DOMAIN/api/payments-webhook`

### 4) Create checkout from frontend

Example request:

```json
{
   "email": "client@example.com",
   "fullName": "Client Name",
   "packageId": "consultation_deposit",
   "notes": "optional"
}
```

Allowed `packageId` values (backend-controlled amounts):

- `consultation_deposit`
- `starter_website`
- `business_website`
- `custom_quote_deposit`

Response includes `authorizationUrl` and `reference`.

### 5) Verify payment status

Call:

- `GET /api/payments-verify?reference=YOUR_REFERENCE`

Use this on your frontend success page to confirm paid status.

### 6) Security checks already implemented

1. Amount is not accepted from frontend.
2. Paystack webhook signature is verified.
3. Webhook events are stored with unique `event_id` for idempotency.
4. Public clients are blocked from direct table reads/writes by RLS.

---

## Part 3: Auth + Dashboard Starter (Supabase)

Added files:

- `supabase/part3_auth_dashboard_schema.sql`
- `../dashboard-login.html`
- `../dashboard.html`

### 1) Run Part 3 SQL

1. Open Supabase SQL Editor.
2. Run: `supabase/part3_auth_dashboard_schema.sql`.

This adds:

1. `profiles` table linked to `auth.users`.
2. Auto profile creation trigger on signup.
3. RLS policies so users can access only their own profile.
4. RLS policies so users can read only their own payment rows.

### 2) Configure frontend Supabase keys

In these files, set your real values:

1. `dashboard-login.html`
2. `dashboard.html`

Update:

1. `SUPABASE_URL`
2. `SUPABASE_ANON_KEY`

### 3) Test auth flow

1. Open `dashboard-login.html`.
2. Create account or sign in.
3. Open `dashboard.html`.
4. Confirm profile data loads.
5. Confirm payment rows load only for signed-in user email.

### 4) Production recommendation

For production, move Supabase URL/key to a small config file or build pipeline substitution, instead of hard-coding in HTML.
