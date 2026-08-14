type MpesaConfig = {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  transactionType: "CustomerPayBillOnline" | "CustomerBuyGoodsOnline";
};

function getMpesaConfig(): MpesaConfig {
  const environment = process.env.MPESA_ENV || "sandbox";
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  const transactionType = process.env.MPESA_TRANSACTION_TYPE;

  if (
    !consumerKey ||
    !consumerSecret ||
    !shortcode ||
    !passkey ||
    passkey.includes("YOUR_") ||
    !callbackUrl ||
    callbackUrl.includes("YOUR_")
  ) {
    throw new Error("M-Pesa is not configured yet.");
  }

  return {
    baseUrl:
      environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke",
    consumerKey,
    consumerSecret,
    shortcode,
    passkey,
    callbackUrl,
    transactionType:
      transactionType === "CustomerBuyGoodsOnline"
        ? "CustomerBuyGoodsOnline"
        : "CustomerPayBillOnline",
  };
}

function getTimestamp() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "";

  return `${value("year")}${value("month")}${value("day")}${value("hour")}${value("minute")}${value("second")}`;
}

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

export async function initiateStkPush({
  amount,
  phoneNumber,
}: {
  amount: number;
  phoneNumber: string;
}) {
  const config = getMpesaConfig();
  const tokenResponse = await fetch(
    `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64")}`,
      },
      cache: "no-store",
    }
  );

  if (!tokenResponse.ok) {
    throw new Error("Unable to authenticate with M-Pesa. Please try again shortly.");
  }

  const { access_token: accessToken } = (await tokenResponse.json()) as {
    access_token?: string;
  };

  if (!accessToken) {
    throw new Error("M-Pesa authentication did not return an access token.");
  }

  const timestamp = getTimestamp();
  const password = Buffer.from(
    `${config.shortcode}${config.passkey}${timestamp}`
  ).toString("base64");
  const response = await fetch(
    `${config.baseUrl}/mpesa/stkpush/v1/processrequest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: config.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: config.transactionType,
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: config.shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: config.callbackUrl,
        AccountReference: "EternalVows",
        TransactionDesc: "Eternal Vows support",
      }),
      cache: "no-store",
    }
  );

  const payload = (await response.json()) as {
    ResponseCode?: string;
    ResponseDescription?: string;
    CustomerMessage?: string;
    CheckoutRequestID?: string;
    MerchantRequestID?: string;
  };

  if (!response.ok || payload.ResponseCode !== "0") {
    throw new Error(
      payload.ResponseDescription || "M-Pesa could not send the payment prompt."
    );
  }

  if (!payload.CheckoutRequestID || !payload.MerchantRequestID) {
    throw new Error("M-Pesa did not return a payment reference.");
  }

  return payload as Required<
    Pick<
      typeof payload,
      "CustomerMessage" | "CheckoutRequestID" | "MerchantRequestID"
    >
  >;
}
