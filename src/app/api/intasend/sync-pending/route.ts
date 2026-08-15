import { NextResponse } from "next/server";
import { syncPendingIntaSendPayments } from "@/lib/intasend";

export const runtime = "nodejs";

export async function GET() {
  try {
    const synced = await syncPendingIntaSendPayments();
    return NextResponse.json({
      success: true,
      syncedCount: synced.length,
      synced,
    });
  } catch (error) {
    console.error("Failed to sync pending payments:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync pending payments",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
