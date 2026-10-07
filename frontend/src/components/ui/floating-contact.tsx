"use client";

import { useState } from "react";

export function FloatingContactButton() {
  const [message, setMessage] = useState("");
  const phone = "+2349067234065";
  const whatsappUrl = `https://wa.me/2349067234065?text=${encodeURIComponent("Hello Group54 Pharmacy")}`;

  const handleClick = async () => {
    setMessage("");

    try {
      const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        throw new Error("Popup blocked or frame-restricted");
      }
      setMessage("Opening WhatsApp...");
      return;
    } catch {
      // Fallback below
    }

    try {
      await navigator.clipboard.writeText(`${phone} | ${whatsappUrl}`);
      setMessage("External link blocked here. WhatsApp contact copied to clipboard.");
    } catch {
      setMessage(`External link blocked here. Contact pharmacy on WhatsApp: ${phone}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-blue-700"
      >
        Contact Pharmacy
      </button>
      {message ? (
        <p className="mt-2 max-w-xs rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">{message}</p>
      ) : null}
    </div>
  );
}
