import { createAdminClient } from "@/lib/supabase/admin";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const IntaSend = require("intasend-node");

type IntaSendConfig = {
  baseUrl: string;
  host: string;
  publishableKey: string;
  secretKey: string;
  testMode: boolean;
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

export type IntaSendInvoiceStatusResult = {
  invoiceId: string;
  state: "COMPLETE" | "PENDING" | "FAILED" | "PROCESSING" | string;
  mpesaReference: string | null;
  amount: number | null;
  charges: number | null;
  netAmount: number | null;
  failedReason: string | null;
  rawInvoice: Record<string, unknown> | null;
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
    testMode,
    webhookChallenge: process.env.INTASEND_WEBHOOK_CHALLENGE,
  };
}

export function getIntaSendSdk() {
  const config = getIntaSendConfig();
  return new IntaSend(
    config.publishableKey,
    config.secretKey,
    config.testMode
  );
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

export async function checkIntaSendInvoiceStatus(
  invoiceId: string
): Promise<IntaSendInvoiceStatusResult> {
  const intasend = getIntaSendSdk();
  const collection = intasend.collection();
  const res = await collection.status(invoiceId);
  const inv = res?.invoice || {};

  const state = String(inv.state || res?.state || "PENDING").toUpperCase();
  const mpesaReference =
    inv.mpesa_reference ||
    inv.provider_ref ||
    inv.tracking_id ||
    null;
  const amount = inv.value ? Number(inv.value) : null;
  const charges = inv.charges !== undefined ? Number(inv.charges) : null;
  const netAmount = inv.net_amount ? Number(inv.net_amount) : null;
  const failedReason = inv.failed_reason || null;

  return {
    invoiceId,
    state,
    mpesaReference,
    amount,
    charges,
    netAmount,
    failedReason,
    rawInvoice: inv,
  };
}

export async function syncAndRecordIntaSendPayment(invoiceId: string) {
  const adminClient = createAdminClient();

  const { data: payment, error: paymentError } = await adminClient
    .from("intasend_payments")
    .select("*")
    .or(`intasend_invoice_id.eq.${invoiceId},api_ref.eq.${invoiceId}`)
    .maybeSingle();

  if (paymentError) {
    console.error("Error fetching intasend payment for sync:", paymentError);
  }

  const targetInvoiceId = payment?.intasend_invoice_id || invoiceId;
  const statusResult = await checkIntaSendInvoiceStatus(targetInvoiceId);
  const isCompleted = statusResult.state === "COMPLETE";
  const isFailed = statusResult.state === "FAILED";
  const statusStr = isCompleted
    ? "complete"
    : isFailed
      ? "failed"
      : statusResult.state.toLowerCase();

  if (payment) {
    await adminClient
      .from("intasend_payments")
      .update({
        status: statusStr,
        provider: "M-PESA",
        provider_reference: statusResult.mpesaReference || payment.provider_reference,
        charges: statusResult.charges ?? payment.charges,
        net_amount: statusResult.netAmount ?? payment.net_amount,
        failed_reason: statusResult.failedReason || payment.failed_reason,
        paid_at: isCompleted ? new Date().toISOString() : payment.paid_at,
      })
      .eq("id", payment.id);

    if (isCompleted && !payment.contribution_recorded) {
      const contributorLabel = payment.contributor_name || `M-Pesa supporter (${payment.phone_number})`;
      const { error: contributionError } = await adminClient
        .from("contributions")
        .upsert(
          {
            wedding_id: payment.wedding_id,
            contributor_name: contributorLabel,
            amount: statusResult.amount || payment.amount,
            currency: "KES",
            payment_method: "M-Pesa",
            payment_status: "completed",
            transaction_reference:
              statusResult.mpesaReference || targetInvoiceId,
            intasend_invoice_id: targetInvoiceId,
            message: "Support Our Journey contribution via M-Pesa",
          },
          { onConflict: "intasend_invoice_id", ignoreDuplicates: true }
        );

      if (contributionError) {
        console.error("Failed to record contribution in sync:", contributionError);
        throw contributionError;
      }

      await adminClient
        .from("intasend_payments")
        .update({ contribution_recorded: true })
        .eq("id", payment.id);
    }
  }

  return {
    invoiceId: targetInvoiceId,
    state: statusResult.state,
    status: statusStr,
    isComplete: isCompleted,
    mpesaReference: statusResult.mpesaReference,
    amount: statusResult.amount || payment?.amount,
    failedReason: statusResult.failedReason,
  };
}

export async function syncPendingIntaSendPayments() {
  const adminClient = createAdminClient();

  const { data: pendingPayments, error } = await adminClient
    .from("intasend_payments")
    .select("intasend_invoice_id")
    .not("intasend_invoice_id", "is", null)
    .or("status.eq.pending,contribution_recorded.eq.false")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !pendingPayments) {
    return [];
  }

  const results = [];
  for (const row of pendingPayments) {
    if (!row.intasend_invoice_id) continue;
    try {
      const res = await syncAndRecordIntaSendPayment(row.intasend_invoice_id);
      results.push(res);
    } catch (err) {
      console.error(`Failed to sync invoice ${row.intasend_invoice_id}:`, err);
    }
  }

  return results;
}
