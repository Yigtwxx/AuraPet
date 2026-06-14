"use client";

import { useEffect } from "react";

/**
 * Service worker'ı yalnızca üretimde kaydeder (dev'de cache karmaşası olmasın).
 * Görsel çıktısı yoktur; kök layout'ta <body> içine yerleştirilir.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker kaydı başarısız:", err);
      });
    };

    // Sayfa yükü tamamlandıktan sonra kaydet (ilk boya gecikmesini önler).
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
