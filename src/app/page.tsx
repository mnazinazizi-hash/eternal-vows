import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/Countdown";

export default function HomePage() {
  return (
    <main className="flex-grow pt-20">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative h-[85vh] min-h-[640px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/screen.png"
            alt="Elena and Marcus"
            fill
            priority
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-secondary/10 mix-blend-multiply" />

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/60" />
        </div>

        <div className="relative z-10 text-center max-w-3xl px-container-padding flex flex-col items-center translate-y-14 md:translate-y-16">
          {/* Wedding label */}
          <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase bg-surface/60 px-5 py-1.5 rounded-full backdrop-blur-sm border border-white/40 mb-5">
            We&apos;re getting married
          </span>

          {/* Couple names */}
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface drop-shadow-sm mb-5">
            Elena &amp; Marcus
          </h1>

          {/* Countdown */}
          <div className="glass-panel rounded-2xl px-8 py-6 w-full max-w-lg ambient-shadow border border-white/70">
            <p className="font-label-caps text-label-caps text-secondary mb-5 tracking-wider">
              November 10, 2026 • Nakuru, Kenya
            </p>

            <Countdown />
          </div>

          {/* Description */}
          <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed mt-6">
            Join us as we begin a beautiful new chapter together, surrounded
            by the people we love most.
          </p>

          {/* RSVP */}
          <Link
            href="/rsvp"
            className="mt-5 bg-primary text-on-primary font-label-caps text-label-caps px-10 py-3.5 rounded-full hover:brightness-110 transition-all duration-300 ambient-shadow tracking-wider"
          >
            RSVP Now
          </Link>
        </div>
      </section>

      {/* =========================================================
          GET DIRECTIONS
      ========================================================= */}
      <section className="max-w-6xl mx-auto px-container-padding pt-12 pb-4">
        <div className="flex justify-center">
          <a
            href="https://maps.app.goo.gl/rPGbVX9dTzgNbZi58"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-surface px-6 py-2.5 text-primary font-label-caps text-label-caps shadow-sm hover:bg-primary hover:text-on-primary transition-all duration-300"
          >
            <span className="material-symbols-outlined text-lg">
              directions
            </span>
            Get Directions
          </a>
        </div>
      </section>

      {/* =========================================================
          ORIGINAL FIVE-CARD STRUCTURE
      ========================================================= */}
      <section className="max-w-6xl mx-auto px-container-padding pb-section-gap pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* =====================================================
              1. VENUE
          ===================================================== */}
          <article className="md:col-span-8 rounded-3xl overflow-hidden bg-surface border border-outline-variant/40 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="relative h-[300px] md:h-[360px]">
              <Image
                src="/church.webp"
                alt="Our Lady of Fatima Catholic Church"
                fill
                className="object-cover object-center"
              />

              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface/95 via-surface/35 to-transparent" />

              <div className="absolute top-5 left-5 rounded-full bg-surface/95 backdrop-blur-sm px-5 py-2 shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
                <span className="font-label-caps text-label-caps text-primary">
                  The Venue
                </span>
              </div>
            </div>

            <div className="p-7 md:p-8 bg-surface">
              <p className="font-label-caps text-label-caps text-primary mb-2">
                CEREMONY
              </p>

              <h2 className="font-headline-sm text-on-surface mb-3">
                Our Lady of Fatima Catholic Church
              </h2>

              <p className="font-body-sm text-on-surface-variant leading-relaxed max-w-2xl mb-5">
                This is where we will gather for our wedding Mass and begin our
                life together in the presence of family, friends and God.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://maps.app.goo.gl/rPGbVX9dTzgNbZi58"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-on-primary font-label-caps text-label-caps shadow-[0_4px_12px_rgba(0,0,0,0.16)] hover:brightness-110 transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-base">
                    directions
                  </span>
                  Get Directions
                </a>

                <a
                  href="https://maps.app.goo.gl/rPGbVX9dTzgNbZi58"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant/50 px-5 py-2.5 text-on-surface font-label-caps text-label-caps hover:border-primary hover:text-primary transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-base">
                    location_on
                  </span>
                  View Map
                </a>
              </div>
            </div>
          </article>

          {/* =====================================================
              2. RECEPTION
          ===================================================== */}
          <article className="md:col-span-4 rounded-3xl overflow-hidden bg-surface border border-outline-variant/40 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="relative h-[220px]">
              <Image
                src="/kunste.webp"
                alt="Hotel Kunste"
                fill
                className="object-cover object-center"
              />

              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface/95 via-surface/35 to-transparent" />

              <div className="absolute top-5 left-5 rounded-full bg-surface/95 backdrop-blur-sm px-5 py-2 shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
                <span className="font-label-caps text-label-caps text-primary">
                  Reception
                </span>
              </div>
            </div>

            <div className="p-7 bg-surface">
              <p className="font-label-caps text-label-caps text-secondary mb-2">
                AFTER THE CEREMONY
              </p>

              <h2 className="font-headline-sm text-on-surface mb-3">
                Hotel Kunste
              </h2>

              <p className="font-body-sm text-on-surface-variant leading-relaxed mb-4">
                Following the wedding Mass, join us for dinner, dancing,
                laughter and an evening of celebration.
              </p>

              <div className="flex items-center gap-2 text-on-surface-variant font-body-sm mb-5">
                <span className="material-symbols-outlined text-base text-tertiary">
                  calendar_month
                </span>
                November 10, 2026
              </div>

              <a
                href="https://maps.app.goo.gl/nTTfXfHvg3NSudzf9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-5 py-2.5 text-primary font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition-all duration-300"
              >
                <span className="material-symbols-outlined text-base">
                  directions
                </span>
                Get Directions
              </a>
            </div>
          </article>

          {/* =====================================================
              3. WHERE
          ===================================================== */}
          <article className="md:col-span-6 rounded-3xl bg-tertiary/5 border border-tertiary/20 p-7 md:p-8 min-h-[185px] flex items-center shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
            <div className="flex items-start gap-5">
              <div className="h-12 w-12 rounded-full bg-surface flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-tertiary shrink-0">
                <span className="material-symbols-outlined">
                  location_on
                </span>
              </div>

              <div>
                <p className="font-label-caps text-label-caps text-primary mb-2">
                  WHERE
                </p>

                <h3 className="font-headline-sm text-on-surface mb-2">
                  Our Lady of Fatima Catholic Church
                </h3>

                <p className="font-body-sm text-on-surface-variant leading-relaxed mb-4">
                  Wedding ceremony venue
                  <br />
                  November 10, 2026
                </p>

                <a
                  href="https://maps.app.goo.gl/rPGbVX9dTzgNbZi58"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary font-body-sm hover:underline"
                >
                  <span className="material-symbols-outlined text-base">
                    location_on
                  </span>
                  Open location
                </a>
              </div>
            </div>
          </article>

          {/* =====================================================
              4 & 5 RIGHT SIDE
          ===================================================== */}
          <div className="md:col-span-6 grid grid-cols-1 gap-5">

            {/* OUR STORY */}
            <div className="orbit-border min-h-[110px] shadow-[0_8px_28px_rgba(0,0,0,0.09)]">
              <article className="orbit-border-content bg-surface-container-low border border-outline-variant/35 p-7 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-tertiary text-3xl">
                    auto_stories
                  </span>

                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface mb-1">
                      OUR STORY
                    </p>

                    <p className="font-body-sm text-on-surface-variant">
                      Discover how our story began.
                    </p>
                  </div>
                </div>

                <Link
                  href="/our-story"
                  className="font-body-sm text-primary hover:underline whitespace-nowrap"
                >
                  Read more →
                </Link>
              </article>
            </div>

            {/* JOIN US / RSVP */}
            <article className="orbit-card relative rounded-3xl bg-primary/5 border border-primary/15 p-7 min-h-[110px] flex items-center justify-between shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
              <div className="relative z-10">
                <p className="font-label-caps text-label-caps text-primary mb-1">
                  JOIN US
                </p>

                <h3 className="font-headline-sm text-primary">
                  Celebrate with us
                </h3>
              </div>

              <Link
                href="/rsvp"
                className="relative z-10 inline-flex items-center justify-center rounded-full bg-surface border border-primary px-6 py-2.5 text-primary font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition-all duration-300"
              >
                RSVP
              </Link>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}