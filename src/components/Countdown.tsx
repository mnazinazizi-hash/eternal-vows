"use client";

import { useEffect, useState } from "react";

// Wedding date: November 10, 2026 at 4:30 PM
const WEDDING_DATE = new Date("2026-11-10T16:30:00").getTime();

export default function Countdown() {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  const [past, setPast] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const distance = WEDDING_DATE - now;

      if (distance <= 0) {
        setPast(true);
        return;
      }

      setTime({
        days: Math.floor(
          distance / (1000 * 60 * 60 * 24)
        ),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        ),
        minutes: Math.floor(
          (distance % (1000 * 60 * 60)) /
            (1000 * 60)
        ),
      });
    };

    tick();

    // Update every minute
    const id = setInterval(tick, 60000);

    return () => clearInterval(id);
  }, []);

  if (past) {
    return (
      <span className="font-headline-md text-primary">
        Happily Ever After!
      </span>
    );
  }

  const pad = (n: number) =>
    n.toString().padStart(2, "0");

  return (
    <div
      className="flex justify-center gap-4 md:gap-8"
      id="countdown"
    >
      {/* Days */}
      <div className="flex flex-col items-center">
        <span className="font-headline-md text-primary">
          {pad(time.days)}
        </span>

        <span className="font-label-caps text-label-caps text-on-surface-variant">
          Days
        </span>
      </div>

      <div className="text-primary font-headline-md self-start pt-1">
        :
      </div>

      {/* Hours */}
      <div className="flex flex-col items-center">
        <span className="font-headline-md text-primary">
          {pad(time.hours)}
        </span>

        <span className="font-label-caps text-label-caps text-on-surface-variant">
          Hours
        </span>
      </div>

      <div className="text-primary font-headline-md self-start pt-1 hidden md:block">
        :
      </div>

      {/* Minutes */}
      <div className="flex flex-col items-center hidden md:flex">
        <span className="font-headline-md text-primary">
          {pad(time.minutes)}
        </span>

        <span className="font-label-caps text-label-caps text-on-surface-variant">
          Mins
        </span>
      </div>
    </div>
  );
}