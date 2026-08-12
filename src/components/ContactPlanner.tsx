"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function ContactPlanner() {
  const [open, setOpen] = useState(false);

  const phone = "254792145175";
  const displayPhone = "0792 145 175";
  const email = "mnazinazizi@gmail.com";

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

  return (
    <>
      {/* =====================================================
          FLOATING BUTTON
      ====================================================== */}
      <div className="fixed bottom-6 right-6 z-[120]">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label="Contact wedding planner"
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-on-primary font-label-caps text-label-caps shadow-[0_10px_30px_rgba(0,0,0,0.20)] hover:brightness-110 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-lg">
            {open ? "close" : "support_agent"}
          </span>

          <span>Contact Planner</span>
        </button>
      </div>

      {/* =====================================================
          CONTACT CARD
      ====================================================== */}
      {open && (
        <>
          {/* Soft backdrop */}
          <button
            type="button"
            aria-label="Close contact planner"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[110] bg-black/5 cursor-default"
          />

          <div className="fixed bottom-24 right-6 z-[115] w-[calc(100vw-2rem)] max-w-sm">
            <div className="rounded-3xl bg-surface border border-outline-variant/25 shadow-[0_20px_60px_rgba(0,0,0,0.20)] overflow-hidden">

              {/* Header */}
              <div className="relative bg-primary/5 px-6 py-5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>

                <p className="font-label-caps text-label-caps text-primary mb-2">
                  NEED HELP?
                </p>

                <h3 className="font-headline-sm text-on-surface">
                  Contact the Planner
                </h3>
              </div>

              {/* Content */}
              <div className="p-6">

                {/* Planner */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-primary/10 border border-outline-variant/20 shrink-0">
                    <Image
                      src="/planner.webp"
                      alt="Stephen Ngugi"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="font-headline-sm text-on-surface">
                      Stephen Ngugi
                    </h4>

                    <p className="font-body-sm text-on-surface-variant">
                      Wedding Contact Planner
                    </p>
                  </div>
                </div>

                {/* Email */}
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 rounded-xl border border-outline-variant/20 p-3.5 hover:border-primary hover:bg-primary/5 transition mb-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">
                      mail
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="font-label-caps text-label-caps text-primary">
                      EMAIL
                    </p>

                    <p className="font-body-sm text-on-surface truncate">
                      {email}
                    </p>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href={`tel:+${phone}`}
                  className="flex items-center gap-3 rounded-xl border border-outline-variant/20 p-3.5 hover:border-primary hover:bg-primary/5 transition mb-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">
                      phone
                    </span>
                  </div>

                  <div>
                    <p className="font-label-caps text-label-caps text-primary">
                      PHONE
                    </p>

                    <p className="font-body-sm text-on-surface">
                      {displayPhone}
                    </p>
                  </div>
                </a>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/${phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white px-4 py-3 font-label-caps text-label-caps hover:brightness-95 transition"
                  >
                    <svg
                      viewBox="0 0 32 32"
                      className="w-5 h-5"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M19.11 17.48c-.27-.14-1.59-.78-1.84-.87-.25-.09-.43-.14-.61.14-.18.27-.7.87-.86 1.04-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.15-1.34-.79-.7-1.33-1.57-1.49-1.83-.16-.27-.02-.41.12-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.11 2.81c.14.18 1.93 2.95 4.67 4.13.65.28 1.15.45 1.54.57.65.21 1.24.18 1.71.11.52-.08 1.59-.65 1.81-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
                      <path d="M16.03 3.2a12.8 12.8 0 0 0-10.9 19.52L3.2 28.8l6.3-1.89a12.8 12.8 0 1 0 6.53-23.71zm0 23.3a10.5 10.5 0 0 1-5.34-1.46l-.38-.23-3.74 1.12 1.15-3.64-.25-.39a10.55 10.55 0 1 1 8.56 4.6z" />
                    </svg>

                    WhatsApp
                  </a>

                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-primary text-primary px-4 py-3 font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition"
                  >
                    <span className="material-symbols-outlined text-lg">
                      mail
                    </span>

                    Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}