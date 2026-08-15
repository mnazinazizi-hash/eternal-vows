type IntaSendConfig = {
  baseUrl: string;
  host: string;
  publishableKey: string;
  secretKey: string;
  webhookChallenge?: string;
};

type IntaSendStkResponse = {
  invoice_id?: string;
  id?: string;
  url?: string;
  state?: string;
  invoice?: {
    invoice_id?: string;
    id?: string;
    state?: string;
  };
  [key: string]: unknown;
};

export function normaliseKenyanPhoneNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const normalised = digits.startsWith("0")
    ? `254${digits.slice(1)}`
    : digits.startsWith("254")
      ? digits
      : `254${digits}`;

  if (!/^254[17]\d{8}$/.test(normalised)) {
    throw new Error("Enter a valid Kenyan M-Pesa number.");
  }

  return normalised;
}

export function getIntaSendConfig(): IntaSendConfig {
  const publishableKey = process.env.INTASEND_PUBLISHABLE_KEY;
  const secretKey = process.env.INTASEND_SECRET_KEY;
  const testMode = process.env.INTASEND_TEST_MODE !== "false";
  const configuredHost =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (!publishableKey || !secretKey) {
    throw new Error("IntaSend is not configured yet.");
  }

  return {
    baseUrl: testMode
      ? "https://sandbox.intasend.com"
      : "https://payment.intasend.com",
    host: configuredHost || "https://eternal-vows-seven.vercel.app",
    publishableKey,
    secretKey,
    webhookChallenge: process.env.INTASEND_WEBHOOK_CHALLENGE,
  };
}

export async function initiateIntaSendStkPush({
  amount,
  phoneNumber,
  apiRef,
}: {
  amount: number;
  phoneNumber: string;
  apiRef: string;
}) {
  const config = getIntaSendConfig();
  const response = await fetch(
    `${config.baseUrl}/api/v1/payment/mpesa-stk-push/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount.toFixed(2),
        phone_number: phoneNumber,
        api_ref: apiRef,
        host: config.host,
        mobile_tarrif: "BUSINESS-PAYS",
      }),
      cache: "no-store",
    }
  );

  const payload = (await response.json().catch(() => ({}))) as IntaSendStkResponse;

  if (!response.ok) {
    const detail =
      typeof payload.detail === "string"
        ? payload.detail
        : typeof payload.message === "string"
          ? payload.message
          : "IntaSend could not send the M-Pesa prompt.";
    throw new Error(detail);
  }

  const invoiceId =
    payload.invoice?.invoice_id ||
    payload.invoice?.id ||
    payload.invoice_id ||
    payload.id ||
    null;

  return {
    invoiceId,
    state: payload.invoice?.state || payload.state || "PENDING",
    rawResponse: payload,
  };
}
