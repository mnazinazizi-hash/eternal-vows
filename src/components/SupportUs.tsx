"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const quickAmounts = [500, 1000, 2500, 5000];

type PaymentState = "idle" | "waiting_pin" | "complete" | "failed";

export default function SupportUs() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [mpesaReference, setMpesaReference] = useState<string | null>(null);
  const [statusReason, setStatusReason] = useState<string>("");

  const [contributorName, setContributorName] = useState("");

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Polling for invoice status after STK push
  useEffect(() => {
    if (paymentState !== "waiting_pin" || !invoiceId) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    attemptsRef.current = 0;

    const checkStatus = async () => {
      attemptsRef.current += 1;
      try {
        const res = await fetch(`/api/intasend/status?invoiceId=${encodeURIComponent(invoiceId)}`);
        if (!res.ok) return;

        const data = (await res.json()) as {
          isComplete?: boolean;
          state?: string;
          status?: string;
          mpesaReference?: string;
          failedReason?: string;
        };

        if (data.isComplete || data.state === "COMPLETE") {
          setPaymentState("complete");
          if (data.mpesaReference) {
            setMpesaReference(data.mpesaReference);
          }
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        } else if (data.state === "FAILED" || data.status === "failed") {
          setPaymentState("failed");
          setStatusReason(data.failedReason || "The payment could not be completed.");
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        } else if (attemptsRef.current >= 20) {
          // Stop polling after 60 seconds (20 * 3s)
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        }
      } catch (err) {
        console.error("Status polling check failed:", err);
      }
    };

    // Check after an initial delay of 3 seconds, then every 3 seconds
    pollTimerRef.current = setInterval(checkStatus, 3000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [paymentState, invoiceId]);

  const resetForm = () => {
    setPaymentState("idle");
    setInvoiceId(null);
    setMpesaReference(null);
    setStatusReason("");
    setSubmitError("");
    setContributorName("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!amount || Number(amount) <= 0 || !phoneNumber) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/intasend/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          phoneNumber,
          contributorName: contributorName || "Prefer not to say",
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        invoiceId?: string;
        apiRef?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "We could not send the M-Pesa prompt.");
      }

      setInvoiceId(result.invoiceId || null);
      setPaymentState("waiting_pin");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not send the M-Pesa prompt. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Support Button */}
      <div className="fixed bottom-24 right-6 z-[120]">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            resetForm();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-surface px-5 py-3 font-label-caps text-label-caps text-primary shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-primary hover:text-on-primary"
        >
          <span className="material-symbols-outlined text-lg">
            volunteer_activism
          </span>
          Support Us
        </button>
      </div>

      {open && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close support form"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[110] bg-black/20 backdrop-blur-sm"
          />

          {/* Modal */}
          <section
            className="
              fixed
              bottom-40
              right-6
              z-[115]
              w-[calc(100vw-2rem)]
              max-w-[430px]
              rounded-3xl
              border
              border-white/70
              bg-[#fdfbf7]
              px-5
              py-5
              shadow-[0_20px_60px_rgba(0,0,0,0.20)]
            "
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border border-outline-variant/30 text-on-surface-variant transition hover:text-primary"
              aria-label="Close support form"
            >
              <span className="material-symbols-outlined text-base">
                close
              </span>
            </button>

            {/* Header */}
            <div className="text-center">
              

              <h2 className="font-headline-md text-[28px] leading-tight text-on-surface">
                Support Our Journey
              </h2>

              <div className="mb-1 flex items-center justify-center gap-2">
                <span className="h-px w-10 bg-primary/30" />
                <span className="material-symbols-outlined text-lg text-primary">
                  favorite
                </span>
                <span className="h-px w-10 bg-primary/30" />
              </div>

              {/* <p className="mt-1 text-sm text-on-surface-variant">
                Your blessing and gift mean so much to Elena &amp; Marcus.
              </p> */}
            </div>

            {/* Payment Succeeded State */}
            {paymentState === "complete" ? (
              <div className="mt-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-3xl">
                    check_circle
                  </span>
                </div>

                <h3 className="mt-3 font-headline-sm text-xl text-on-surface">
                  Payment Received!
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  Thank you for your generous contribution of{" "}
                  <strong className="text-primary font-semibold">
                    KES {Number(amount).toLocaleString()}
                  </strong>
                  .
                </p>

                {mpesaReference && (
                  <div className="mt-3 inline-block rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-mono text-primary font-medium">
                    M-Pesa Ref: {mpesaReference}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-xs font-semibold uppercase tracking-[0.08em] text-on-primary transition hover:brightness-110"
                >
                  Done
                </button>
              </div>
            ) : paymentState === "waiting_pin" ? (
              /* Waiting for PIN entry state */
              <div className="mt-5 text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
                  <span className="material-symbols-outlined text-3xl animate-pulse">
                    phone_iphone
                  </span>
                </div>

                <h3 className="mt-3 font-headline-sm text-lg text-on-surface">
                  Check your phone
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  An M-Pesa prompt for <strong>KES {Number(amount).toLocaleString()}</strong> was sent to <strong>{phoneNumber}</strong>.
                </p>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-primary font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary animate-ping" />
                  <span>Waiting for PIN confirmation...</span>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex h-10 flex-1 items-center justify-center rounded-xl border border-outline-variant/40 px-3 text-xs font-medium text-on-surface hover:bg-surface-container-low"
                  >
                    Change Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-10 flex-1 items-center justify-center rounded-xl bg-surface-container-high px-3 text-xs font-medium text-on-surface"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : paymentState === "failed" ? (
              /* Failed state */
              <div className="mt-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error">
                  <span className="material-symbols-outlined text-3xl">
                    error_outline
                  </span>
                </div>

                <h3 className="mt-3 font-headline-sm text-lg text-on-surface">
                  Payment Unsuccessful
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {statusReason || "The M-Pesa transaction was not completed."}
                </p>

                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-tertiary px-4 text-xs font-semibold uppercase tracking-[0.08em] text-on-tertiary transition hover:brightness-110"
                >
                  Try Again
                </button>
              </div>
            ) : (
              /* Idle Form State */
              <form onSubmit={handleSubmit} className="mt-4">
                {/* Contributor Name */}
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="support-name"
                    className="font-label-caps text-label-caps text-primary"
                  >
                    Your Name
                  </label>
                  <button
                    type="button"
                    onClick={() => setContributorName("Prefer not to say")}
                    className="text-[11px] font-semibold text-tertiary hover:underline"
                  >
                    Prefer not to say
                  </button>
                </div>

                <input
                  id="support-name"
                  type="text"
                  required
                  value={contributorName}
                  onChange={(event) => setContributorName(event.target.value)}
                  placeholder="Enter your name"
                  className="mt-2 h-12 w-full rounded-xl border border-outline-variant/40 bg-white px-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:border-tertiary"
                />

                {/* Amount */}
                <label
                  htmlFor="support-amount"
                  className="mt-4 block font-label-caps text-label-caps text-primary"
                >
                  Contribution amount
                </label>

                <div className="mt-2 flex h-12 overflow-hidden rounded-xl border border-outline-variant/40 bg-white">
                  <span className="flex items-center border-r border-outline-variant/30 px-3 text-sm font-semibold text-primary">
                    KES
                  </span>

                  <input
                    id="support-amount"
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Enter amount"
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
                  />
                </div>

                <label
                  htmlFor="support-phone"
                  className="mt-4 block font-label-caps text-label-caps text-primary"
                >
                  M-Pesa phone number
                </label>

                <input
                  id="support-phone"
                  type="tel"
                  inputMode="tel"
                  required
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="0712 345 678"
                  className="mt-2 h-12 w-full rounded-xl border border-outline-variant/40 bg-white px-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:border-tertiary"
                />

                {/* Quick amounts */}
                <p className="mt-3 text-xs text-on-surface-variant">
                  Quick amounts
                </p>

                <div className="mt-1 grid grid-cols-4 divide-x divide-outline-variant/25 border-y border-outline-variant/25">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(String(value))}
                      className={`py-2 text-xs font-semibold text-primary transition ${
                        amount === String(value)
                          ? "bg-primary/10"
                          : "hover:bg-primary/5"
                      }`}
                    >
                      {value.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* STK Push */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-tertiary px-4 text-xs font-semibold uppercase tracking-[0.08em] text-on-tertiary transition hover:brightness-110"
                >
                  <span className="material-symbols-outlined text-base">
                    phone_iphone
                  </span>

                  {submitting ? "Sending prompt..." : "Send M-Pesa STK Push"}
                </button>

                {submitError && (
                  <p role="alert" className="mt-3 text-center text-xs text-error">
                    {submitError}
                  </p>
                )}

                <p className="mt-1 text-center text-[11px] text-on-surface-variant">
                  A payment prompt will be sent to your phone.
                </p>
              </form>
            )}
          </section>
        </>
      )}
    </>
  );
}
