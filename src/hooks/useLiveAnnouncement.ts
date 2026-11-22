import { useEffect, useRef, useState } from "react";

export function useLiveAnnouncement() {
  const [announcement, setAnnouncement] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  function announce(message: string) {
    if (timer.current !== null) clearTimeout(timer.current);
    // Separate the empty and populated states so identical actions still
    // produce a fresh live-region update. Rapid actions replace pending speech.
    setAnnouncement("");
    timer.current = setTimeout(() => {
      setAnnouncement(message);
      timer.current = null;
    }, 100);
  }

  return { announcement, announce };
}
