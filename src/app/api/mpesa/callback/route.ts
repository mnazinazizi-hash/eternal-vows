import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const callback = payload?.Body?.stkCallback as
      | {
          CheckoutRequestID?: string;
          ResultCode?: number;
          ResultDesc?: string;
          CallbackMetadata?: {
            Item?: Array<{ Name?: string; Value?: string | number }>;
          };
        }
      | undefined;

    if (!callback?.CheckoutRequestID || typeof callback.ResultCode !== "number") {
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Invalid callback payload" },
        { status: 400 }
      );
    }

    const metadata = callback.CallbackMetadata?.Item || [];
    const metadataValue = (name: string) =>
      metadata.find((item) => item.Name === name)?.Value;
    const isReceived = callback.ResultCode === 0;
    const adminClient = createAdminClient();
    const { data: payment, error: paymentError } = await adminClient
      .from("mpesa_payments")
      .update({
        status: isReceived ? "received" : "failed",
        result_code: callback.ResultCode,
        result_description: callback.ResultDesc || null,
        mpesa_receipt_number: isReceived
          ? String(metadataValue("MpesaReceiptNumber") || "") || null
          : null,
        raw_callback: payload,
        paid_at: isReceived ? new Date().toISOString() : null,
      })
      .eq("checkout_request_id", callback.CheckoutRequestID)
      .select("id, wedding_id, amount, contribution_recorded")
      .maybeSingle();

    if (paymentError) {
      throw paymentError;
    }

    if (isReceived && payment && !payment.contribution_recorded) {
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
            transaction_reference:
              String(metadataValue("MpesaReceiptNumber") || "") || null,
            mpesa_checkout_request_id: callback.CheckoutRequestID,
            message: "Support Our Journey",
          },
          { onConflict: "mpesa_checkout_request_id", ignoreDuplicates: true }
        );

      if (contributionError) {
        throw contributionError;
      }

      await adminClient
        .from("mpesa_payments")
        .update({ contribution_recorded: true })
        .eq("id", payment.id);
    }

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback received successfully",
    });
  } catch (error) {
    console.error("M-Pesa callback processing failed", error);

    return NextResponse.json(
      { ResultCode: 1, ResultDesc: "Callback could not be processed" },
      { status: 500 }
    );
  }
}
