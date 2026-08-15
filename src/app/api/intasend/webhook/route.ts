import { NextResponse } from "next/server";
import { getIntaSendConfig } from "@/lib/intasend";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type IntaSendWebhookPayload = {
  invoice_id?: string;
  state?: string;
  provider?: string;
  charges?: string;
  net_amount?: string | number;
  currency?: string;
  value?: string | number;
  account?: string;
  api_ref?: string;
  failed_reason?: string | null;
  failed_code?: string | null;
  challenge?: string;
  provider_ref?: string;
  mpesa_reference?: string;
  tracking_id?: string;
  updated_at?: string;
};

function isComplete(state?: string) {
  return state?.toUpperCase() === "COMPLETE";
}

function isFailed(state?: string) {
  return state?.toUpperCase() === "FAILED";
}

export async function POST(request: Request) {
  try {
    const config = getIntaSendConfig();
    const payload = (await request.json()) as IntaSendWebhookPayload;

    if (
      config.webhookChallenge &&
      payload.challenge !== config.webhookChallenge
    ) {
      return NextResponse.json(
        { detail: "Invalid webhook challenge" },
        { status: 401 }
      );
    }

    if (!payload.api_ref && !payload.invoice_id) {
      return NextResponse.json(
        { detail: "Missing payment reference" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const status = isComplete(payload.state)
      ? "complete"
      : isFailed(payload.state)
        ? "failed"
        : String(payload.state || "pending").toLowerCase();
    const providerReference =
      payload.provider_ref || payload.mpesa_reference || payload.tracking_id || null;
    const query = adminClient
      .from("intasend_payments")
      .update({
        intasend_invoice_id: payload.invoice_id || null,
        status,
        provider: payload.provider || null,
        provider_reference: providerReference,
        charges: payload.charges ? Number(payload.charges) : null,
        net_amount: payload.net_amount ? Number(payload.net_amount) : null,
        currency: payload.currency || "KES",
        failed_reason: payload.failed_reason || null,
        raw_webhook: payload,
        paid_at: isComplete(payload.state)
          ? payload.updated_at || new Date().toISOString()
          : null,
      });

    const { data: payment, error: paymentError } = payload.api_ref
      ? await query.eq("api_ref", payload.api_ref).select("*").maybeSingle()
      : await query
          .eq("intasend_invoice_id", payload.invoice_id)
          .select("*")
          .maybeSingle();

    if (paymentError) {
      throw paymentError;
    }

    if (isComplete(payload.state) && payment && !payment.contribution_recorded) {
      const { error: contributionError } = await adminClient
        .from("contributions")
        .upsert(
          {
            wedding_id: payment.wedding_id,
            contributor_name: "Anonymous M-Pesa supporter",
            amount: payment.amount,
            currency: "KES",
            payment_method: "M-Pesa",
            payment_status: "received",
            transaction_reference: providerReference || payload.invoice_id || null,
            intasend_invoice_id: payload.invoice_id || payment.intasend_invoice_id,
            message: "Support Our Journey",
          },
          { onConflict: "intasend_invoice_id", ignoreDuplicates: true }
        );

      if (contributionError) {
        throw contributionError;
      }

      await adminClient
        .from("intasend_payments")
        .update({ contribution_recorded: true })
        .eq("id", payment.id);
    }

    return NextResponse.json({ detail: "Webhook received" });
  } catch (error) {
    console.error("IntaSend webhook processing failed", error);

    return NextResponse.json(
      { detail: "Webhook could not be processed" },
      { status: 500 }
    );
  }
}
