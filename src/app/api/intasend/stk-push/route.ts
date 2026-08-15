import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  initiateIntaSendStkPush,
  normaliseKenyanPhoneNumber,
} from "@/lib/intasend";
import { createAdminClient } from "@/lib/supabase/admin";
import { WEDDING_ID } from "@/lib/wedding";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let paymentId: string | null = null;

  try {
    const body = (await request.json()) as {
      amount?: unknown;
      phoneNumber?: unknown;
    };
    const amount = Number(body.amount);

    if (!Number.isInteger(amount) || amount < 1 || amount > 150000) {
      return NextResponse.json(
        { error: "Enter a whole amount between KES 1 and KES 150,000." },
        { status: 400 }
      );
    }

    if (typeof body.phoneNumber !== "string") {
      return NextResponse.json(
        { error: "Enter the phone number to receive the M-Pesa prompt." },
        { status: 400 }
      );
    }

    const phoneNumber = normaliseKenyanPhoneNumber(body.phoneNumber);
    const apiRef = `EV-${randomUUID()}`;
    const adminClient = createAdminClient();
    const { data: payment, error: insertError } = await adminClient
      .from("intasend_payments")
      .insert({
        wedding_id: WEDDING_ID,
        amount,
        phone_number: phoneNumber,
        api_ref: apiRef,
      })
      .select("id")
      .single();

    if (insertError || !payment) {
      throw new Error("Payment storage is not configured yet.");
    }

    paymentId = payment.id;

    const result = await initiateIntaSendStkPush({
      amount,
      phoneNumber,
      apiRef,
    });

    await adminClient
      .from("intasend_payments")
      .update({
        intasend_invoice_id: result.invoiceId,
        status: String(result.state).toLowerCase(),
        raw_response: result.rawResponse,
      })
      .eq("id", paymentId);

    return NextResponse.json({
      message: "M-Pesa prompt sent. Please enter your PIN on your phone.",
      invoiceId: result.invoiceId,
      apiRef,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We could not send the M-Pesa prompt. Please try again.";

    if (paymentId) {
      try {
        const adminClient = createAdminClient();
        await adminClient
          .from("intasend_payments")
          .update({
            status: "failed",
            failed_reason: message,
          })
          .eq("id", paymentId);
      } catch {
        // Keep the customer-facing error focused on the STK Push.
      }
    }

    const status =
      message === "IntaSend is not configured yet." ||
      message === "Payment storage is not configured yet."
        ? 503
        : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
