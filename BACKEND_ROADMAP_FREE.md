# Wealth Hub Tech Backend Roadmap (Free Tier First)

This guide gives you 3 progressive backend levels:
1. Minimal forms backend
2. Forms plus payments backend
3. Full backend with auth, dashboard, and payments

You can do each level separately. You can also switch providers later.

Important rule:
- Keep your frontend on GitHub Pages if you want.
- Put backend on a free serverless platform.
- Never expose secret keys on frontend pages.

---

## 0) Before You Start (One-Time Setup)

1. Create a GitHub repo for your site.
2. Add environment variables only on backend provider dashboard, not in frontend code.
3. Create one folder in your project named backend-notes for your own notes and keys naming map.
4. Use this naming format for environment variables:
   - APP_BASE_URL
   - MAIL_PROVIDER_KEY
   - PAYSTACK_SECRET_KEY or STRIPE_SECRET_KEY
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - FIREBASE_PROJECT_ID

---

## 1) Minimal Forms Backend (Level 1)

Goal:
- Contact form submits data safely
- Optional email notification
- Optional save to database

You can do this with these free options:
1. Netlify Forms (fastest no-code)
2. Vercel Functions (simple custom API)
3. Cloudflare Workers (very cheap/free edge)
4. Supabase Edge Function (good if you already use Supabase)
5. Firebase Cloud Functions (good if already in Firebase ecosystem)

### 1A) Netlify (Fastest for forms)

Use this when you want form handling in minutes.

Steps:
1. Push site to GitHub.
2. Import repo into Netlify.
3. In your HTML form, add Netlify form attributes.
4. Add a hidden input for form-name.
5. Deploy.
6. Test submission on live URL.
7. Open Netlify dashboard, then Forms tab, to see entries.
8. Add email notifications in Netlify Forms settings.

Best for:
- Contact forms
- Lead capture
- Very fast setup

Not best for:
- Complex business logic
- Advanced workflows

### 1B) Vercel Functions (Simple custom endpoint)

Use this when you want full control of validation and custom responses.

Steps:
1. Create a separate backend repo or same repo with api folder.
2. Add one endpoint such as /api/contact.
3. Validate name, email, message on server.
4. Store in Supabase or send email through Resend.
5. Deploy to Vercel.
6. Connect your frontend form submit to this API URL.
7. Add CORS allow list for your domain only.
8. Test success and error states on frontend.

Best for:
- Custom validation
- Custom workflow and automations

### 1C) Cloudflare Workers (Free and fast globally)

Use this when you want edge speed and very low running cost.

Steps:
1. Create a Worker project.
2. Add route for POST /contact.
3. Validate payload on worker.
4. Save to Cloudflare D1 or send to Supabase REST API.
5. Add Turnstile captcha to reduce spam.
6. Deploy worker and use worker URL in your form action.
7. Add CORS and origin check.

Best for:
- Fast global form endpoint
- Good anti-abuse options

### 1D) Supabase Edge Function (if you want DB now)

Steps:
1. Create Supabase project.
2. Create table contact_submissions.
3. Add Row Level Security policies.
4. Create Edge Function to insert validated form data.
5. Deploy function.
6. Call function from frontend.
7. Review data in Supabase table.

### 1E) Firebase Cloud Functions (if you want Firestore now)

Steps:
1. Create Firebase project.
2. Enable Firestore.
3. Create HTTPS function for contact submit.
4. Validate payload and write document to Firestore.
5. Deploy function.
6. Call function from frontend.

---

## 2) Forms Plus Payments Backend (Level 2)

Goal:
- User submits form
- Backend creates secure checkout session
- Payment provider redirects user
- Webhook confirms payment
- You update status in database

Use providers:
1. Vercel or Netlify or Cloudflare for serverless backend
2. Paystack or Stripe for payment
3. Supabase or Firebase for payment records

Core flow:
1. Frontend sends order intent to backend
2. Backend creates checkout reference using secret key
3. Frontend redirects to payment page
4. Payment provider calls webhook endpoint
5. Backend verifies signature and marks payment successful
6. Frontend shows success page after verification

### 2A) Vercel plus Paystack or Stripe

Steps:
1. Create endpoint /api/create-checkout.
2. Receive amount, product, customer email.
3. Validate amount on backend from your product config, not from frontend.
4. Create transaction or checkout session with secret key.
5. Return payment URL to frontend.
6. Add endpoint /api/webhook/payment.
7. Verify webhook signature before processing.
8. Save payment event to database.
9. Build success page that checks backend payment status by reference.

### 2B) Netlify Functions plus Paystack or Stripe

Steps:
1. Create Netlify function for checkout creation.
2. Create another function for webhooks.
3. Add secret keys in Netlify environment variables.
4. Validate events and write to database.
5. Connect frontend forms to function URL.

### 2C) Cloudflare Workers plus Paystack or Stripe

Steps:
1. Worker route for create-checkout.
2. Worker route for payment webhook.
3. Use KV or D1 or external DB for transaction state.
4. Verify signature and ensure idempotency.

Critical payment safety checks:
1. Never trust amount from frontend.
2. Use idempotency keys for webhook handling.
3. Store provider reference and your internal order id.
4. Mark status transitions clearly: pending, paid, failed, refunded.
5. Log all webhook events for audit.

---

## 3) Full Backend (Auth, Dashboard, Payments) (Level 3)

Goal:
- User signup and login
- User profile and role system
- Protected dashboard
- Forms and payment history
- Admin view

Two free-first strong paths:
1. Supabase first path
2. Firebase first path

### 3A) Supabase Full Path

What you get:
- Auth
- Postgres database
- Storage
- Edge functions
- Realtime

Steps:
1. Create Supabase project.
2. Enable Auth with email magic link or password.
3. Create tables:
   - profiles
   - orders
   - payments
   - contact_submissions
4. Add foreign keys and indexes.
5. Enable Row Level Security on all tables.
6. Write policies:
   - user sees only own data
   - admin role can see all data
7. Connect frontend auth flows.
8. Add protected dashboard routes.
9. Integrate payment create endpoint and webhook endpoint.
10. On payment success, update orders and payments tables.
11. Build admin dashboard for order and payment review.
12. Add backup and export routine.

Best for:
- SQL friendly structure
- Strong control and reporting

### 3B) Firebase Full Path

What you get:
- Firebase Auth
- Firestore
- Cloud Functions
- Hosting option
- Analytics integration

Steps:
1. Create Firebase project.
2. Enable Firebase Auth.
3. Set Firestore collections:
   - users
   - orders
   - payments
   - contactSubmissions
4. Configure Firestore security rules.
5. Create callable or HTTPS functions for business logic.
6. Integrate payments through function endpoints.
7. Build dashboard with role-based access.
8. Add admin custom claims for admin users.

Best for:
- Rapid app development
- Tight integration with Firebase tooling

---

## 4) Which Provider to Choose First (Simple Decision)

1. I want easiest forms now:
- Start with Netlify Forms

2. I want custom API quickly:
- Start with Vercel Functions

3. I want global edge and anti-bot:
- Start with Cloudflare Workers plus Turnstile

4. I want SQL and dashboard later:
- Start with Supabase now

5. I want Google ecosystem and mobile later:
- Start with Firebase now

---

## 5) Suggested Learning Sequence (Very Practical)

Week 1:
1. Build Level 1 on Netlify or Vercel.
2. Add spam protection and validation.
3. Save submissions to DB.

Week 2:
1. Add Level 2 payment creation endpoint.
2. Add webhook verification endpoint.
3. Add payment status page and logs.

Week 3 to 4:
1. Add auth.
2. Build user dashboard.
3. Add admin role and reporting.
4. Improve security and monitoring.

---

## 6) Free Tier Survival Checklist

1. Keep function runtime small and fast.
2. Cache read-heavy endpoints.
3. Use pagination on dashboard lists.
4. Avoid unnecessary background jobs.
5. Add simple rate limiting for form and checkout endpoints.
6. Compress images and static assets.
7. Monitor monthly usage limits on each provider.

---

## 7) Security Checklist (Do Not Skip)

1. Validate all payloads on backend.
2. Add domain allow list for CORS.
3. Verify payment webhook signatures.
4. Store secrets only in provider environment variables.
5. Enable captcha on public forms.
6. Use least privilege database keys.
7. Keep audit logs for payments and admin actions.

---

## 8) Ready-to-Build Path for Your Current Site

Start here:
1. Level 1 using Vercel Functions plus Supabase table for contact submissions.
2. Level 2 using Paystack webhook plus Vercel function endpoints.
3. Level 3 adding Supabase Auth and dashboard pages.

Why this path:
1. Very friendly free tier to start.
2. SQL data model is easier for business reports.
3. You can still move frontend to any host later.

---

## 9) Documentation Template You Can Reuse Per Project

For each project, document these 9 sections:
1. Frontend host
2. Backend provider
3. Database provider
4. Auth method
5. Payment provider
6. Environment variables list
7. API endpoints list
8. Webhook events handled
9. Deployment and rollback steps

---

## 10) What To Build Next in This Repository

1. Add one backend starter folder when you choose your first provider.
2. Add a simple architecture diagram in your notes.
3. Add one testing checklist for forms and one for payments.

You can now follow this guide without asking from scratch each time.
