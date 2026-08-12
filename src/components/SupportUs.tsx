"use client";

import { FormEvent, useEffect, useState } from "react";

export default function SupportUs() {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const mpesaNumber = "0792145175";

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(
        mpesaNumber
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.trim() || !amount.trim()) {
      return;
    }

    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setName("");
    setAmount("");
    setMessage("");
  };

  return (
    <>
      {/* =====================================================
          FLOATING SUPPORT BUTTON
      ====================================================== */}
      <div className="fixed bottom-24 right-6 z-[120]">
        <button
          type="button"
          onClick={() => {
            setOpen((current) => !current);
            setSubmitted(false);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-surface border border-primary/25 px-5 py-3 text-primary font-label-caps text-label-caps shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:bg-primary hover:text-on-primary transition-all duration-300"
        >
          <span className="material-symbols-outlined text-lg">
            {open
              ? "close"
              : "volunteer_activism"}
          </span>

          <span>Support Us</span>
        </button>
      </div>

      {/* =====================================================
          SUPPORT POPUP
      ====================================================== */}
      {open && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close support popup"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[110] bg-black/5 cursor-default"
          />

          <div className="fixed bottom-44 right-6 z-[115] w-[calc(100vw-2rem)] max-w-xl">
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.20)]">

              <div className="p-6 md:p-7">

                {!submitted ? (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-5 mb-6">

                      <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-2xl">
                            volunteer_activism
                          </span>
                        </div>

                        <div>
                          <p className="font-label-caps text-label-caps text-primary text-sm md:text-base font-semibold tracking-wider whitespace-nowrap">
                            SUPPORT OUR JOURNEY
                          </p>

                          <p className="font-body-sm text-on-surface-variant mt-1">
                            Your support means so much to us.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setOpen(false)
                        }
                        className="w-9 h-9 rounded-full bg-surface border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition shrink-0"
                        aria-label="Close support"
                      >
                        <span className="material-symbols-outlined text-lg">
                          close
                        </span>
                      </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Left */}
                        <div className="space-y-4">

                          <div>
                            <label
                              htmlFor="support-name"
                              className="block font-body-sm text-on-surface-variant mb-1.5"
                            >
                              Your Name
                            </label>

                            <input
                              id="support-name"
                              type="text"
                              value={name}
                              onChange={(e) =>
                                setName(
                                  e.target.value
                                )
                              }
                              placeholder="Enter your name"
                              required
                              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="support-amount"
                              className="block font-body-sm text-on-surface-variant mb-1.5"
                            >
                              Contribution Amount
                            </label>

                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body-sm font-semibold text-primary">
                                KES
                              </span>

                              <input
                                id="support-amount"
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) =>
                                  setAmount(
                                    e.target.value
                                  )
                                }
                                placeholder="Enter amount"
                                required
                                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest pl-14 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                              />
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                              {[500, 1000, 2500, 5000].map(
                                (value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() =>
                                      setAmount(
                                        value.toString()
                                      )
                                    }
                                    className={`rounded-full border px-3 py-1.5 font-body-sm transition ${
                                      amount ===
                                      value.toString()
                                        ? "bg-primary text-on-primary border-primary"
                                        : "border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary"
                                    }`}
                                  >
                                    KES{" "}
                                    {value.toLocaleString()}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right */}
                        <div className="space-y-4">

                          <div>
                            <label
                              htmlFor="support-message"
                              className="block font-body-sm text-on-surface-variant mb-1.5"
                            >
                              A Little Note
                            </label>

                            <textarea
                              id="support-message"
                              value={message}
                              onChange={(e) =>
                                setMessage(
                                  e.target.value
                                )
                              }
                              rows={3}
                              placeholder="Leave a message for the couple..."
                              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
                            />
                          </div>

                          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
                            <p className="font-label-caps text-label-caps text-primary mb-2">
                              M-PESA CONTRIBUTION NUMBER
                            </p>

                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-headline-sm text-on-surface">
                                  0792 145 175
                                </p>

                                <p className="font-body-sm text-on-surface-variant">
                                  Stephen Ngugi
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={
                                  copyNumber
                                }
                                className="w-10 h-10 rounded-full bg-surface border border-outline-variant/20 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition"
                                aria-label="Copy M-Pesa number"
                              >
                                <span className="material-symbols-outlined text-lg">
                                  {copied
                                    ? "check"
                                    : "content_copy"}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom action */}
                      <div className="mt-5 flex flex-col md:flex-row md:items-center gap-4">
                        <button
                          type="submit"
                          className="md:flex-1 rounded-full bg-primary text-on-primary font-label-caps text-label-caps py-3.5 hover:brightness-110 transition-all duration-300 shadow-sm"
                        >
                          I&apos;ll Make This Contribution
                        </button>

                        <p className="md:w-64 text-center md:text-left font-body-sm text-on-surface-variant leading-relaxed">
                          After making your M-Pesa contribution,
                          you can let us know your name and amount.
                        </p>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-5">

                    <div className="w-14 h-14 rounded-full bg-tertiary/10 text-tertiary mx-auto flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-3xl">
                        favorite
                      </span>
                    </div>

                    <h3 className="font-headline-sm text-on-surface mb-2">
                      Thank You, {name}!
                    </h3>

                    <p className="font-body-md text-on-surface-variant max-w-md mx-auto mb-5">
                      Your generosity means a great deal to us.
                    </p>

                    <div className="inline-flex items-center gap-4 rounded-2xl bg-primary/5 border border-primary/10 px-5 py-4">
                      <div>
                        <p className="font-label-caps text-label-caps text-primary">
                          M-PESA
                        </p>

                        <p className="font-display-sm text-on-surface">
                          KES{" "}
                          {Number(
                            amount
                          ).toLocaleString()}
                        </p>

                        <p className="font-body-sm text-on-surface-variant">
                          0792 145 175
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          copyNumber
                        }
                        className="w-10 h-10 rounded-full bg-surface border border-outline-variant/20 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition"
                        aria-label="Copy M-Pesa number"
                      >
                        <span className="material-symbols-outlined">
                          {copied
                            ? "check"
                            : "content_copy"}
                        </span>
                      </button>
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={
                          copyNumber
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-5 py-2.5 text-primary font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition"
                      >
                        <span className="material-symbols-outlined text-base">
                          {copied
                            ? "check"
                            : "content_copy"}
                        </span>

                        {copied
                          ? "Number Copied"
                          : "Copy Number"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          resetForm
                        }
                        className="font-body-sm text-primary hover:underline"
                      >
                        Make another contribution
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}