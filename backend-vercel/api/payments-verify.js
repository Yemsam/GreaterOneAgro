const { createClient } = require("@supabase/supabase-js");

const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

function corsHeaders(origin) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  const corsOrigin = allowedOrigin === "*" ? "*" : origin || allowedOrigin;

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin"
  };
}

function json(statusCode, payload, origin) {
  return {
    statusCode,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  };
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || "";

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(origin), body: "" };
  }

  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" }, origin);
  }

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      return json(500, { error: `Missing environment variable: ${key}` }, origin);
    }
  }

  const reference = (event.queryStringParameters?.reference || "").trim();

  if (!reference) {
    return json(400, { error: "reference query param is required" }, origin);
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase
    .from("payment_orders")
    .select("reference, status, package_id, package_title, amount_ngn, created_at, paid_at")
    .eq("reference", reference)
    .maybeSingle();

  if (error) {
    return json(500, { error: "Failed to verify payment", details: error.message }, origin);
  }

  if (!data) {
    return json(404, { error: "Payment reference not found" }, origin);
  }

  return json(200, { ok: true, payment: data }, origin);
};
