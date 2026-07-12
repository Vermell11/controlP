"use client";

import { useEffect, useState } from "react";

/** Reloj vivo del header: se actualiza cada segundo en el cliente. */
export default function Clock() {
  const [now, setNow] = useState("");

  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("es-CO", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <strong suppressHydrationWarning>{now || "··:··:··"}</strong>;
}
