import Image from "next/image";

const events = [
  {
    title: "Wedding Mass",
    time: "4:30 PM",
    desc: "Join us at Our Lady of Fatima Catholic Church as we celebrate our wedding Mass and begin this beautiful new chapter together.",
    icon: "church",
  },
  {
    title: "Journey to the Reception",
    time: "After Mass",
    desc: "Following the ceremony, we will make our way to Hotel Kunste for the evening reception and celebration.",
    icon: "directions_car",
  },
  {
    title: "Wedding Reception",
    time: "After the Ceremony",
    desc: "Join us at Hotel Kunste for dinner, conversation, laughter, music and a wonderful evening together.",
    icon: "celebration",
  },
];

export default function VenuePage() {
  return (
    <main className="flex-grow pt-[100px] px-container-padding md:px-8 pb-section-gap max-w-6xl mx-auto">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <section className="text-center mb-12">
        <p className="font-label-caps text-label-caps text-primary mb-3">
          November 10, 2026
        </p>

        <h1 className="font-headline-md md:font-display-lg text-on-surface mb-4">
          Our Wedding Locations
        </h1>

        <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Our celebration begins at Our Lady of Fatima Catholic Church and
          continues at Hotel Kunste. Below you&apos;ll find everything you need
          to find both locations and join us for the day.
        </p>
      </section>

      {/* =========================================================
          CEREMONY
      ========================================================= */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl bg-surface border border-outline-variant/30 shadow-[0_10px_35px_rgba(0,0,0,0.10)]">
          {/* Church image */}
          <div className="relative min-h-[360px] lg:min-h-[500px]">
            <Image
              src="/church.webp"
              alt="Our Lady of Fatima Catholic Church"
              fill
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <div className="absolute top-6 left-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-surface/95 backdrop-blur-sm px-5 py-2.5 shadow-md font-label-caps text-label-caps text-primary">
                <span className="material-symbols-outlined text-base">
                  church
                </span>
                Ceremony
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <p className="font-label-caps text-label-caps text-white/80 mb-2">
                WEDDING MASS
              </p>

              <h2 className="font-display-sm text-white">
                Our Lady of Fatima Catholic Church
              </h2>
            </div>
          </div>

          {/* Church details */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <p className="font-label-caps text-label-caps text-primary mb-3">
              THE CEREMONY
            </p>

            <h2 className="font-headline-md text-on-surface mb-4">
              Our Lady of Fatima Catholic Church
            </h2>

            <p className="font-body-md text-on-surface-variant leading-relaxed mb-7">
              This is where we will gather for our wedding Mass, exchange our
              vows and celebrate the beginning of our married life together
              surrounded by family and friends.
            </p>

            {/* Date & time */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">
                  calendar_month
                </span>
              </div>

              <div>
                <p className="font-label-caps text-label-caps text-on-surface mb-1">
                  DATE &amp; TIME
                </p>

                <p className="font-body-md text-on-surface-variant">
                  Tuesday, November 10, 2026
                  <br />
                  Wedding Mass begins at 4:30 PM
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4 mb-7">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">location_on</span>
              </div>

              <div>
                <p className="font-label-caps text-label-caps text-on-surface mb-1">
                  LOCATION
                </p>

                <p className="font-body-md text-on-surface-variant">
                  Our Lady of Fatima Catholic Church
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://maps.app.goo.gl/rPGbVX9dTzgNbZi58"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-caps text-label-caps px-6 py-3 rounded-full hover:brightness-110 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">
                  directions
                </span>
                Get Directions
              </a>

              <a
                href="https://maps.app.goo.gl/rPGbVX9dTzgNbZi58"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-outline-variant/50 text-on-surface font-label-caps text-label-caps px-6 py-3 rounded-full hover:border-primary hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined text-lg">map</span>
                Open Map
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          RECEPTION
      ========================================================= */}
      <section className="mb-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl bg-surface border border-outline-variant/30 shadow-[0_10px_35px_rgba(0,0,0,0.10)]">
          {/* Reception details first on desktop */}
          <div className="p-8 md:p-10 flex flex-col justify-center order-2 lg:order-1">
            <p className="font-label-caps text-label-caps text-secondary mb-3">
              THE RECEPTION
            </p>

            <h2 className="font-headline-md text-on-surface mb-4">
              Hotel Kunste
            </h2>

            <p className="font-body-md text-on-surface-variant leading-relaxed mb-7">
              After the wedding Mass, we&apos;ll continue the celebration at
              Hotel Kunste. Join us for a relaxed evening of food, conversation,
              music, laughter and memories.
            </p>

            {/* Reception information */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined">restaurant</span>
              </div>

              <div>
                <p className="font-label-caps text-label-caps text-on-surface mb-1">
                  RECEPTION
                </p>

                <p className="font-body-md text-on-surface-variant">
                  Hotel Kunste
                  <br />
                  Following the wedding Mass
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-7">
              <div className="w-11 h-11 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined">
                  directions_car
                </span>
              </div>

              <div>
                <p className="font-label-caps text-label-caps text-on-surface mb-1">
                  GETTING THERE
                </p>

                <p className="font-body-md text-on-surface-variant">
                  Tap &quot;Get Directions&quot; below and Google Maps will
                  guide you from your current location.
                </p>
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/nTTfXfHvg3NSudzf9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-fit bg-primary text-on-primary font-label-caps text-label-caps px-6 py-3 rounded-full hover:brightness-110 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">
                directions
              </span>
              Directions to Hotel Kunste
            </a>
          </div>

          {/* Hotel image */}
          <div className="relative min-h-[350px] lg:min-h-[500px] order-1 lg:order-2">
            <Image
              src="/kunste.webp"
              alt="Hotel Kunste reception venue"
              fill
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <div className="absolute top-6 left-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-surface/95 backdrop-blur-sm px-5 py-2.5 shadow-md font-label-caps text-label-caps text-primary">
                <span className="material-symbols-outlined text-base">
                  celebration
                </span>
                Reception
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <p className="font-label-caps text-label-caps text-white/80 mb-2">
                AFTER THE CEREMONY
              </p>

              <h2 className="font-display-sm text-white">Hotel Kunste</h2>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTACT
      ========================================================= */}
      <section className="mb-14">
        <div className="rounded-3xl bg-primary/5 border border-primary/15 p-8 md:p-10 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
          <div className="text-center mb-8">
            <p className="font-label-caps text-label-caps text-primary mb-2">
              NEED HELP?
            </p>

            <h2 className="font-headline-md text-on-surface mb-3">
              Get in touch
            </h2>

            <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
              Having trouble finding the church or reception venue? Give us a
              call or send us a WhatsApp message and we&apos;ll be happy to
              help.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Main contact */}
            <a
              href="tel:+254792145175"
              className="rounded-2xl bg-surface border border-outline-variant/30 p-6 flex items-center gap-4 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">phone</span>
              </div>

              <div>
                <p className="font-label-caps text-label-caps text-primary mb-1">
                  MAIN CONTACT
                </p>

                <p className="font-body-md font-semibold text-on-surface">
                  0792 145 175
                </p>

                <p className="font-body-sm text-on-surface-variant">
                  +254 792 145 175
                </p>
              </div>
            </a>

            {/* WhatsApp / alternative contact method */}
            {/* WhatsApp / alternative contact */}
            <a
              href="https://wa.me/254792145175"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-surface border border-outline-variant/30 p-6 flex items-center gap-4 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0">
                <svg
                  viewBox="0 0 32 32"
                  className="w-7 h-7"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19.11 17.48c-.27-.14-1.59-.78-1.84-.87-.25-.09-.43-.14-.61.14-.18.27-.7.87-.86 1.04-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.15-1.34-.79-.7-1.33-1.57-1.49-1.83-.16-.27-.02-.41.12-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.11 2.81c.14.18 1.93 2.95 4.67 4.13.65.28 1.15.45 1.54.57.65.21 1.24.18 1.71.11.52-.08 1.59-.65 1.81-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
                  <path d="M16.03 3.2a12.8 12.8 0 0 0-10.9 19.52L3.2 28.8l6.3-1.89a12.8 12.8 0 1 0 6.53-23.71zm0 23.3a10.5 10.5 0 0 1-5.34-1.46l-.38-.23-3.74 1.12 1.15-3.64-.25-.39a10.55 10.55 0 1 1 8.56 4.6z" />
                </svg>
              </div>

              <div>
                <p className="font-label-caps text-label-caps text-[#25D366] mb-1">
                  ALTERNATIVE
                </p>

                <p className="font-body-md font-semibold text-on-surface">
                  WhatsApp
                </p>

                <p className="font-body-sm text-on-surface-variant">
                  Message us directly
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          ITINERARY
      ========================================================= */}
      <section>
        <div className="text-center mb-10">
          <p className="font-label-caps text-label-caps text-primary mb-2">
            WEDDING DAY
          </p>

          <h2 className="font-headline-md text-on-surface mb-3">
            Our Itinerary
          </h2>

          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
            A simple guide to the flow of our celebration.
          </p>
        </div>

        <div className="space-y-5">
          {events.map((event) => (
            <div
              key={event.title}
              className="flex gap-5 items-start bg-surface-container-low rounded-2xl p-6 md:p-7 border border-outline-variant/25 shadow-[0_6px_22px_rgba(0,0,0,0.06)]"
            >
              <div className="bg-tertiary/10 text-tertiary rounded-full p-3 shrink-0">
                <span className="material-symbols-outlined">{event.icon}</span>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-3 mb-2">
                  <h3 className="font-headline-sm text-on-surface">
                    {event.title}
                  </h3>

                  <span className="font-label-caps text-label-caps text-primary">
                    {event.time}
                  </span>
                </div>

                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  {event.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
