"use client";

import { useEffect } from "react";

export function ScrollReveal() {
  useEffect(() => {
    const main = document.querySelector("main#main-content");
    if (!main || !("IntersectionObserver" in window)) return;

    const items = main.querySelectorAll<HTMLElement>("section, article, [data-scroll-reveal]");
    if (!items.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    items.forEach((item, index) => {
      item.classList.add("scroll-reveal-item");
      item.style.setProperty("--scroll-reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    });
    main.classList.add("scroll-reveal-enabled");

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("scroll-reveal-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -48px 0px" });

    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      main.classList.remove("scroll-reveal-enabled");
      items.forEach((item) => {
        item.classList.remove("scroll-reveal-item", "scroll-reveal-visible");
        item.style.removeProperty("--scroll-reveal-delay");
      });
    };
  }, []);

  return null;
}
