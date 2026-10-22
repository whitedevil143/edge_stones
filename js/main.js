/* ============================================================
   EDGE STONES — interactions
   ============================================================ */
(function () {
  "use strict";

  const WA_NUMBER = "917306684418";

  /* ---------- preloader ---------- */
  const loader = document.querySelector(".loader");
  const hideLoader = () => loader && loader.classList.add("done");
  window.addEventListener("load", () => setTimeout(hideLoader, 450));
  setTimeout(hideLoader, 2600); // safety fallback

  /* ---------- header scroll state ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".mobile-menu");
  if (burger && menu) {
    const toggle = (force) => {
      const open = force !== undefined ? force : !menu.classList.contains("open");
      menu.classList.toggle("open", open);
      burger.classList.toggle("active", open);
      burger.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => toggle());
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggle(false)));
    window.addEventListener("keydown", (e) => e.key === "Escape" && toggle(false));
  }

  /* ---------- marquee: duplicate group for seamless loop ---------- */
  document.querySelectorAll(".marquee-track").forEach((track) => {
    const group = track.querySelector(".marquee-group");
    if (group) {
      const clone = group.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    }
  });

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  // stagger siblings that share a parent marked [data-stagger]
  document.querySelectorAll("[data-stagger]").forEach((parent) => {
    [...parent.children].forEach((child, i) => {
      child.style.transitionDelay = `${Math.min(i * 90, 450)}ms`;
    });
  });
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  /* ---------- subtle hero parallax ---------- */
  const heroImg = document.querySelector(".hero-bg img");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (heroImg && !reduce) {
    window.addEventListener(
      "scroll",
      () => {
        const y = Math.min(window.scrollY, window.innerHeight);
        heroImg.style.translate = `0 ${y * 0.18}px`;
      },
      { passive: true }
    );
  }

  /* ---------- WhatsApp enquiry builder ---------- */
  const form = document.querySelector("#enquiry-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (form.querySelector("#f-name")?.value || "").trim();
      const product = form.querySelector("#f-product")?.value || "";
      const phone = (form.querySelector("#f-phone")?.value || "").trim();
      const msg = (form.querySelector("#f-message")?.value || "").trim();

      const lines = ["Hi EDGE STONES!"];
      if (name) lines.push(`My name is ${name}.`);
      if (product && product !== "General enquiry") {
        lines.push(`I'd like the best price for: ${product}.`);
      } else {
        lines.push(`I have a general enquiry about your products.`);
      }
      if (msg) lines.push(msg);
      if (phone) lines.push(`You can reach me at: ${phone}`);

      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(url, "_blank", "noopener");
    });
  }

  /* ---------- footer year ---------- */
  const yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
