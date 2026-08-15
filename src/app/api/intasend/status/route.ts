import { NextResponse } from "next/server";
import { syncAndRecordIntaSendPayment } from "@/lib/intasend";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId") || searchParams.get("id");

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const result = await syncAndRecordIntaSendPayment(invoiceId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("IntaSend status check failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to check status",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      invoiceId?: string;
    };
    const invoiceId = body.invoiceId;

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const result = await syncAndRecordIntaSendPayment(invoiceId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("IntaSend status sync failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to check status",
      },
      { status: 500 }
    );
  }
}
