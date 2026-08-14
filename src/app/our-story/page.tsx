const party = [
  {
    name: "Sarah Jenkins",
    role: "Maid of Honor",
    bio: "Elena's sister and partner in crime since day one. A lover of vintage romance novels and perfectly steeped tea.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  },
  {
    name: "David Chen",
    role: "Best Man",
    bio: "Marcus's college roommate. Known for his terrible puns, impeccable taste in music, and unwavering loyalty.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    name: "Mia Rossi",
    role: "Bridesmaid",
    bio: "The friend who introduced us. An amazing architect with an eye for detail and a heart of gold.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  },
  {
    name: "James Holden",
    role: "Groomsman",
    bio: "Marcus's brother. Always ready for an adventure, especially if it involves hiking up a mountain at dawn.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  },
];

const gallery = [
  "/screen.png",
  "/church.webp",
  "/kunste.webp",
  "/screen.png",
  "/church.webp",
  "/kunste.webp",
];

export default function OurStoryPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 md:px-container-padding pt-28 pb-section-gap">
      {/* Story header */}
      <section className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-headline-md md:font-display-lg text-on-surface mb-6">
          A Glimpse Into Our Journey
        </h1>
        <p className="font-body-lg text-on-surface-variant">
          From our first serendipitous meeting in a sunlit botanical garden to
          the countless adventures that followed, every moment has led us here.
        </p>
      </section>

      {/* Gallery grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-section-gap">
        {gallery.map((src, i) => (
          <div
            key={i}
            className={`rounded-xl overflow-hidden ambient-shadow ${
              i === 0 || i === 3 ? "md:row-span-2 min-h-[280px]" : "min-h-[200px]"
            }`}
          >
            <img
              src={src}
              alt={`Our story moment ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </section>

      {/* Wedding party */}
      <section>
        <div className="text-center mb-12">
          <h2 className="font-headline-md text-on-surface mb-3">
            The Wedding Party
          </h2>
          <p className="font-body-md text-on-surface-variant">
            The incredible friends and family standing by our side.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {party.map((person) => (
            <div
              key={person.name}
              className="glass-panel rounded-xl p-6 flex flex-col items-center text-center ambient-shadow hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-surface-container-high">
                <img
                  src={person.img}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-headline-sm text-[20px] font-semibold text-primary mb-1">
                {person.name}
              </h3>
              <span className="font-label-caps text-label-caps text-tertiary mb-3">
                {person.role}
              </span>
              <p className="font-body-sm text-on-surface-variant">
                {person.bio}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
