const Stripe = require('stripe');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const amountInNaira = Number(payload.amountInNaira || 710600);

    if (!Number.isFinite(amountInNaira) || amountInNaira <= 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid payment amount' })
      };
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = event.headers.origin || event.headers.Origin || 'http://localhost:8888';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: payload.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'ngn',
            product_data: {
              name: 'Greater One Agro Partnership Slot'
            },
            unit_amount: Math.round(amountInNaira * 100)
          },
          quantity: 1
        }
      ],
      metadata: {
        fullName: String(payload.fullName || ''),
        phone: String(payload.phone || ''),
        slots: String(payload.slots || ''),
        paymentMethod: String(payload.paymentMethod || ''),
        notes: String(payload.notes || '')
      },
      success_url: `${origin}/application-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/partnership-project.html?payment=cancelled`
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message || 'Unable to create Stripe checkout session' })
    };
  }
};
