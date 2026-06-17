const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const requiredEnv = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PAYSTACK_SECRET_KEY",
  "PAYSTACK_CALLBACK_URL"
];

// Keep amounts on backend only.
const PACKAGE_CONFIG = {
  consultation_deposit: { amountNgn: 25000, title: "Consultation Deposit" },
  starter_website: { amountNgn: 150000, title: "Starter Website" },
  business_website: { amountNgn: 350000, title: "Business Website" },
  custom_quote_deposit: { amountNgn: 50000, title: "Custom Quote Deposit" }
};

function corsHeaders(origin) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  const corsOrigin = allowedOrigin === "*" ? "*" : origin || allowedOrigin;

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin"
  };
}

function response(statusCode, payload, origin) {
  return {
    statusCode,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  };
}

function sanitize(value, maxLen = 200) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLen);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

function makeReference() {
  return `wht_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || "";

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(origin), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return response(405, { error: "Method not allowed" }, origin);
  }

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      return response(500, { error: `Missing environment variable: ${key}` }, origin);
    }
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return response(400, { error: "Invalid JSON body" }, origin);
  }

  const email = sanitize(body.email, 150).toLowerCase();
  const fullName = sanitize(body.fullName, 120);
  const packageId = sanitize(body.packageId, 60);
  const notes = sanitize(body.notes, 500);

  if (!isEmail(email)) {
    return response(400, { error: "Valid email is required." }, origin);
  }

  if (!fullName || fullName.length < 2) {
    return response(400, { error: "Full name is required." }, origin);
  }

  if (!PACKAGE_CONFIG[packageId]) {
    return response(400, { error: "Invalid package selected." }, origin);
  }

  const selectedPackage = PACKAGE_CONFIG[packageId];
  const reference = makeReference();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  const orderInsert = {
    reference,
    status: "pending",
    customer_email: email,
    customer_name: fullName,
    package_id: packageId,
    package_title: selectedPackage.title,
    amount_ngn: selectedPackage.amountNgn,
    notes
  };

  const { error: orderError } = await supabase.from("payment_orders").insert(orderInsert);

  if (orderError) {
    return response(500, { error: "Failed to create payment order.", details: orderError.message }, origin);
  }

  const paystackPayload = {
    email,
    amount: selectedPackage.amountNgn * 100,
    reference,
    callback_url: process.env.PAYSTACK_CALLBACK_URL,
    metadata: {
      customer_name: fullName,
      package_id: packageId,
      package_title: selectedPackage.title,
      notes
    }
  };

  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(paystackPayload)
  });

  const paystackData = await paystackRes.json();

  if (!paystackRes.ok || !paystackData.status || !paystackData.data?.authorization_url) {
    await supabase
      .from("payment_orders")
      .update({ status: "failed", gateway_error: sanitize(paystackData.message || "Initialize failed", 500) })
      .eq("reference", reference);

    return response(502, { error: "Payment provider initialize failed.", details: paystackData.message || "Unknown error" }, origin);
  }

  await supabase
    .from("payment_orders")
    .update({
      gateway_access_code: paystackData.data.access_code || null,
      gateway_authorization_url: paystackData.data.authorization_url || null
    })
    .eq("reference", reference);

  return response(
    200,
    {
      ok: true,
      reference,
      amountNgn: selectedPackage.amountNgn,
      authorizationUrl: paystackData.data.authorization_url
    },
    origin
  );
};
