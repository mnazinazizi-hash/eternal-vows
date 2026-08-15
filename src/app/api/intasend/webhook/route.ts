import { NextResponse } from "next/server";
import { getIntaSendConfig, syncAndRecordIntaSendPayment } from "@/lib/intasend";

export const runtime = "nodejs";

type IntaSendWebhookPayload = {
  invoice_id?: string;
  state?: string;
  api_ref?: string;
  challenge?: string;
  [key: string]: unknown;
};

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

    const ref = payload.invoice_id || payload.api_ref;
    if (!ref) {
      return NextResponse.json(
        { detail: "Missing payment reference" },
        { status: 400 }
      );
    }

    await syncAndRecordIntaSendPayment(ref);

    return NextResponse.json({ detail: "Webhook received and processed" });
  } catch (error) {
    console.error("IntaSend webhook processing failed:", error);

    return NextResponse.json(
      { detail: "Webhook could not be processed" },
      { status: 500 }
    );
  }
}
