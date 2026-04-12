const { createClient } = require("@supabase/supabase-js");

const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

function getCorsHeaders(origin) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  const corsOrigin = allowedOrigin === "*" ? "*" : origin || allowedOrigin;

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin"
  };
}

function json(statusCode, payload, origin) {
  return {
    statusCode,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  };
}

function sanitizeText(value, maxLen = 500) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLen);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || "";

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: getCorsHeaders(origin),
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" }, origin);
  }

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      return json(500, { error: `Missing environment variable: ${key}` }, origin);
    }
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON body" }, origin);
  }

  // Honeypot: bots often fill hidden fields.
  if (body.company) {
    return json(200, { ok: true, message: "Submission accepted." }, origin);
  }

  const payload = {
    full_name: sanitizeText(body.fullName, 120),
    email: sanitizeText(body.email, 150).toLowerCase(),
    company_name: sanitizeText(body.companyName, 120),
    website_url: sanitizeText(body.websiteUrl, 250),
    project_type: sanitizeText(body.projectType, 80),
    budget: sanitizeText(body.budget, 60),
    timeline: sanitizeText(body.timeline, 80),
    message: sanitizeText(body.message, 3000),
    source: sanitizeText(body.source || "website", 40)
  };

  if (!payload.full_name || payload.full_name.length < 2) {
    return json(400, { error: "Full name is required." }, origin);
  }

  if (!isValidEmail(payload.email)) {
    return json(400, { error: "A valid email is required." }, origin);
  }

  if (!payload.message || payload.message.length < 10) {
    return json(400, { error: "Project details must be at least 10 characters." }, origin);
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  const { error } = await supabase.from("contact_submissions").insert(payload);

  if (error) {
    return json(500, { error: "Failed to save submission.", details: error.message }, origin);
  }

  return json(200, { ok: true, message: "Thanks. We will contact you within 1 business day." }, origin);
};
