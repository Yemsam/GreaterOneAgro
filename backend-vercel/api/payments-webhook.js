const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "PAYSTACK_SECRET_KEY"];

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  };
}

function safe(value, maxLen = 300) {
  return String(value || "").trim().slice(0, maxLen);
}

function verifyPaystackSignature(rawBody, signature, secret) {
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      return json(500, { error: `Missing environment variable: ${key}` });
    }
  }

  const rawBody = event.body || "";
  const signature = event.headers["x-paystack-signature"] || event.headers["X-Paystack-Signature"];

  if (!signature) {
    return json(401, { error: "Missing webhook signature" });
  }

  if (!verifyPaystackSignature(rawBody, signature, process.env.PAYSTACK_SECRET_KEY)) {
    return json(401, { error: "Invalid webhook signature" });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json(400, { error: "Invalid webhook payload" });
  }

  const eventType = safe(payload.event, 80);
  const reference = safe(payload.data?.reference, 120);

  if (!reference) {
    return json(400, { error: "Missing payment reference" });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  // Idempotency: event_id must be unique in DB.
  const webhookEventInsert = {
    event_id: safe(payload.data?.id, 120) || `${reference}_${eventType}`,
    event_type: eventType,
    reference,
    raw_payload: payload
  };

  const { error: eventInsertError } = await supabase.from("payment_events").insert(webhookEventInsert);

  if (eventInsertError && !String(eventInsertError.message).includes("duplicate")) {
    return json(500, { error: "Failed to store webhook event", details: eventInsertError.message });
  }

  // Handle success/failure status updates.
  if (eventType === "charge.success") {
    const amountKobo = Number(payload.data?.amount || 0);
    const paidAt = payload.data?.paid_at || null;

    await supabase
      .from("payment_orders")
      .update({
        status: "paid",
        amount_paid_kobo: Number.isFinite(amountKobo) ? amountKobo : null,
        paid_at: paidAt,
        gateway_status: safe(payload.data?.status, 50),
        gateway_channel: safe(payload.data?.channel, 50)
      })
      .eq("reference", reference);
  }

  if (eventType === "charge.failed") {
    await supabase
      .from("payment_orders")
      .update({
        status: "failed",
        gateway_status: safe(payload.data?.status, 50),
        gateway_error: safe(payload.data?.gateway_response, 500)
      })
      .eq("reference", reference);
  }

  return json(200, { ok: true });
};
