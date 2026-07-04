'use server';

const MOBBEX_API_URL = 'https://api.mobbex.com/p/checkout';

export async function createCheckout({ userId, planId, price, type }) {
  try {
    const apiKey = process.env.MOBBEX_API_KEY;
    const accessToken = process.env.MOBBEX_ACCESS_TOKEN;

    if (!apiKey || !accessToken) {
      return { success: false, error: 'Credenciales de Mobbex no configuradas en el servidor.' };
    }

    // Reference format required by our webhook logic: type_user_userId_plan_planId_time_timestamp
    const reference = `${type}_user_${userId}_plan_${planId}_time_${Date.now()}`;

    // Get the base URL from the environment or default to localhost for dev
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const data = {
      total: parseFloat(price),
      currency: 'ARS',
      reference: reference,
      description: `Pago en Portal Clasificados - Plan/Token: ${planId}`,
      return_url: `${baseUrl}/payment-success`,
      webhook: `${baseUrl}/api/webhooks/mobbex`,
      options: {
        domain: "tuportal.com" // You can change this to the real domain
      },
      ...(type === 'subscription' && {
        subscription: {
          reference: `sub_${userId}_${planId}`,
          name: `Suscripción Mensual Plan ${planId}`,
          interval: '1m', // Every 1 month
          limit: 0 // Infinite
        }
      })
    };

    const response = await fetch(MOBBEX_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'x-access-token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Mobbex Error:', responseData);
      return { success: false, error: responseData?.message || 'Error procesando el pago en Mobbex' };
    }

    // Return the URL for the frontend to redirect the user
    return { 
      success: true, 
      url: responseData.data.url 
    };

  } catch (error) {
    console.error('Error creating checkout:', error);
    return { success: false, error: 'Error interno al procesar el pago' };
  }
}
