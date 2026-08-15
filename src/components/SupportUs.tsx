"use client";

import { FormEvent, useEffect, useState } from "react";

const quickAmounts = [500, 1000, 2500, 5000];

export default function SupportUs() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!amount || Number(amount) <= 0 || !phoneNumber) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/intasend/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), phoneNumber }),
      });
      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "We could not send the M-Pesa prompt.");
      }

      setSubmitted(true);
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
            setSubmitted(false);
            setSubmitError("");
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
            className="fixed inset-0 z-[110] bg-black/5"
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
              <div className="mb-1 flex items-center justify-center gap-2">
                <span className="h-px w-10 bg-primary/30" />

                <span className="material-symbols-outlined text-lg text-primary">
                  favorite
                </span>

                <span className="h-px w-10 bg-primary/30" />
              </div>

              <h2 className="font-headline-md text-[28px] leading-tight text-on-surface">
                Support Our Journey
              </h2>

              <p className="mt-1 text-sm text-on-surface-variant">
                Your support means so much to us.
              </p>
            </div>

            {submitted ? (
              <div className="mt-4 text-center">
                <span className="material-symbols-outlined text-3xl text-tertiary">
                  favorite
                </span>

                <h3 className="mt-2 font-headline-sm text-lg text-on-surface">
                  Thank you for your kindness
                </h3>

                <p className="mt-1 text-sm leading-5 text-on-surface-variant">
                  An M-Pesa prompt has been sent to {phoneNumber}. Enter your PIN
                  on your phone to complete the contribution.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4">
                {/* Amount */}
                <label
                  htmlFor="support-amount"
                  className="font-label-caps text-label-caps text-primary"
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
