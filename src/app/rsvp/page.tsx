"use client";

import { FormEvent, useState } from "react";

type Attendance = "yes" | "no" | null;

export default function RsvpPage() {
  const [attending, setAttending] =
    useState<Attendance>(null);

  const [submitted, setSubmitted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleAttendanceClick = (
    value: "yes" | "no"
  ) => {
    setAttending((current) =>
      current === value ? null : value
    );
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (attending === null) {
      return;
    }

    setLoading(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 800)
    );

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-container-padding pt-28 pb-16">
        <div className="glass-panel rounded-2xl p-10 max-w-md text-center ambient-shadow">
          <span className="material-symbols-outlined text-tertiary text-5xl mb-4">
            check_circle
          </span>

          <h1 className="font-headline-md text-on-surface mb-3">
            Thank You!
          </h1>

          <p className="font-body-md text-on-surface-variant leading-relaxed">
            Your RSVP has been received. We can&apos;t wait to
            celebrate with you.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[80vh] flex items-center justify-center py-28 px-container-padding">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />

        <div className="absolute inset-0 bg-background/70" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-label-caps text-label-caps text-primary mb-2">
            Elena &amp; Marcus
          </p>

          <h1 className="font-headline-md md:font-display-lg text-on-surface mb-2">
            Kindly Reply
          </h1>

          <p className="font-body-md text-on-surface-variant">
            Please respond by Sep 01, 2026
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl p-6 md:p-10 ambient-shadow space-y-8"
        >
          {/* =====================================================
              GUEST DETAILS
          ====================================================== */}
          <fieldset>
            <legend className="flex items-center gap-2 font-label-caps text-label-caps text-secondary mb-4">
              <span className="material-symbols-outlined text-lg">
                person
              </span>
              Guest Details
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block font-body-sm text-on-surface-variant mb-1"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  required
                  className="w-full rounded-md border border-outline-variant/40 bg-surface-container-lowest px-4 py-2.5 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block font-body-sm text-on-surface-variant mb-1"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  required
                  className="w-full rounded-md border border-outline-variant/40 bg-surface-container-lowest px-4 py-2.5 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block font-body-sm text-on-surface-variant mb-1"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-md border border-outline-variant/40 bg-surface-container-lowest px-4 py-2.5 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>
            </div>
          </fieldset>

          {/* =====================================================
              ATTENDANCE
          ====================================================== */}
          <fieldset>
            <legend className="flex items-center gap-2 font-label-caps text-label-caps text-secondary mb-4">
              <span className="material-symbols-outlined text-lg">
                event_available
              </span>
              Will you attend?
            </legend>

            <div
              role="radiogroup"
              aria-label="Will you attend?"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {/* Accept */}
              <button
                type="button"
                role="radio"
                aria-checked={attending === "yes"}
                onClick={() =>
                  handleAttendanceClick("yes")
                }
                className={`text-left rounded-xl border-2 p-4 transition ${
                  attending === "yes"
                    ? "border-tertiary bg-tertiary/10 shadow-sm"
                    : "border-outline-variant/30 hover:border-tertiary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-body-md font-semibold text-on-surface block">
                      Joyfully Accept
                    </span>

                    <span className="font-body-sm text-on-surface-variant">
                      Wouldn&apos;t miss it
                    </span>
                  </div>

                  {attending === "yes" && (
                    <span className="material-symbols-outlined text-tertiary">
                      check_circle
                    </span>
                  )}
                </div>
              </button>

              {/* Decline */}
              <button
                type="button"
                role="radio"
                aria-checked={attending === "no"}
                onClick={() =>
                  handleAttendanceClick("no")
                }
                className={`text-left rounded-xl border-2 p-4 transition ${
                  attending === "no"
                    ? "border-secondary bg-secondary/10 shadow-sm"
                    : "border-outline-variant/30 hover:border-secondary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-body-md font-semibold text-on-surface block">
                      Regretfully Decline
                    </span>

                    <span className="font-body-sm text-on-surface-variant">
                      Sending love from afar
                    </span>
                  </div>

                  {attending === "no" && (
                    <span className="material-symbols-outlined text-secondary">
                      check_circle
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Clear response */}
            {attending !== null && (
              <button
                type="button"
                onClick={() => setAttending(null)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-outline-variant/30 px-4 py-2 text-on-surface-variant font-body-sm hover:border-primary hover:text-primary transition"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>

                Clear response
              </button>
            )}
          </fieldset>

          {/* =====================================================
              NOTE
          ====================================================== */}
          <fieldset>
            <legend className="flex items-center gap-2 font-label-caps text-label-caps text-secondary mb-4">
              <span className="material-symbols-outlined text-lg">
                favorite
              </span>
              A Note for the Couple
            </legend>

            <textarea
              name="message"
              rows={4}
              placeholder="Share a message or song request..."
              className="w-full rounded-md border border-outline-variant/40 bg-surface-container-lowest px-4 py-2.5 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
            />
          </fieldset>

          {/* =====================================================
              SUBMIT
          ====================================================== */}
          <button
            type="submit"
            disabled={
              loading || attending === null
            }
            className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-3.5 rounded-full hover:brightness-110 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ambient-shadow"
          >
            {loading ? "Sending..." : "Submit RSVP"}
          </button>
        </form>
      </div>
    </main>
  );
}