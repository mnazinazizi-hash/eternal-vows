"use client";

import { useEffect, useState } from "react";

const WEDDING_DATE = new Date(
  "2026-11-10T16:30:00+03:00"
).getTime();

type CountdownTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const emptyTime: CountdownTime = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

function getTimeRemaining(): CountdownTime {
  const distance = WEDDING_DATE - Date.now();

  if (distance <= 0) {
    return emptyTime;
  }

  return {
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
    seconds: Math.floor(
      (distance % (1000 * 60)) / 1000
    ),
  };
}

export default function Countdown() {
  const [time, setTime] =
    useState<CountdownTime>(emptyTime);

  const [mounted, setMounted] =
    useState(false);

  const [past, setPast] =
    useState(false);

  useEffect(() => {
    setMounted(true);

    const update = () => {
      const distance =
        WEDDING_DATE - Date.now();

      if (distance <= 0) {
        setPast(true);
        return;
      }

      setPast(false);
      setTime(getTimeRemaining());
    };

    update();

    const interval = window.setInterval(
      update,
      1000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  // Server and first client render are identical.
  if (!mounted) {
    return (
      <div
        className="flex items-start justify-center gap-3 sm:gap-5 md:gap-7"
        aria-label="Countdown loading"
      >
        <CountdownUnit value="00" label="Days" />
        <Separator />
        <CountdownUnit value="00" label="Hours" />
        <Separator />
        <CountdownUnit value="00" label="Mins" />
        <Separator />
        <CountdownUnit value="00" label="Secs" />
      </div>
    );
  }

  if (past) {
    return (
      <span className="font-headline-md text-primary">
        Happily Ever After!
      </span>
    );
  }

  const pad = (value: number) =>
    value.toString().padStart(2, "0");

  return (
    <div
      id="countdown"
      className="flex items-start justify-center gap-3 sm:gap-5 md:gap-7"
    >
      <CountdownUnit
        value={pad(time.days)}
        label="Days"
      />

      <Separator />

      <CountdownUnit
        value={pad(time.hours)}
        label="Hours"
      />

      <Separator />

      <CountdownUnit
        value={pad(time.minutes)}
        label="Mins"
      />

      <Separator />

      <CountdownUnit
        value={pad(time.seconds)}
        label="Secs"
      />
    </div>
  );
}

function CountdownUnit({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-headline-md text-primary tabular-nums">
        {value}
      </span>

      <span className="font-label-caps text-label-caps text-on-surface-variant">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div className="font-headline-md text-primary pt-1">
      :
    </div>
  );
}