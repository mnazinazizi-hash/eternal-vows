import { NextResponse } from "next/server";
import { initiateStkPush, normaliseKenyanPhoneNumber } from "@/lib/mpesa";
import { createAdminClient } from "@/lib/supabase/admin";
import { WEDDING_ID } from "@/lib/wedding";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
    const adminClient = createAdminClient();
    const result = await initiateStkPush({ amount, phoneNumber });
    const { error: paymentError } = await adminClient
      .from("mpesa_payments")
      .insert({
        wedding_id: WEDDING_ID,
        amount,
        phone_number: phoneNumber,
        merchant_request_id: result.MerchantRequestID,
        checkout_request_id: result.CheckoutRequestID,
      });

    if (paymentError) {
      throw new Error(
        "The M-Pesa prompt was sent, but we could not prepare its payment record. Please contact the couple before trying again."
      );
    }

    return NextResponse.json({
      message: result.CustomerMessage,
      checkoutRequestId: result.CheckoutRequestID,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We could not send the M-Pesa prompt. Please try again.";
    const status =
      message === "M-Pesa is not configured yet." ||
      message === "Payment storage is not configured yet."
        ? 503
        : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
