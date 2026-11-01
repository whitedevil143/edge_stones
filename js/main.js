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

/* ============================================================
   EXTRAS — progress bar · counters · projects filter · lightbox
   ============================================================ */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scroll progress bar (all pages) ---------- */
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.prepend(bar);
  const paint = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
  };
  paint();
  window.addEventListener("scroll", paint, { passive: true });
  window.addEventListener("resize", paint);

  /* ---------- animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        const el = en.target, target = parseInt(el.dataset.count, 10) || 0;
        const t0 = performance.now(), dur = reduce ? 0 : 1100;
        const step = (t) => {
          const k = dur ? Math.min((t - t0) / dur, 1) : 1;
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3)))).padStart(2, "0");
          if (k < 1) requestAnimationFrame(step); else el.classList.add("counted");
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- projects page ---------- */
  const wrap = document.querySelector(".proj-wrap");
  if (wrap) {
    const chips   = [...document.querySelectorAll(".chip[data-cat]")];
    const secs    = [...wrap.querySelectorAll(".proj-sec")];
    const showing = document.getElementById("projShowing");
    const counts  = Object.fromEntries(secs.map((s) => [s.dataset.cat, s.querySelectorAll(".proj-card").length]));
    const total   = secs.reduce((a, s) => a + counts[s.dataset.cat], 0);

    /* --- filter with fade+pop choreography --- */
    let busy = false;
    const applyFilter = (cat, chip) => {
      if (busy || chip.classList.contains("active")) return;
      busy = true;
      chips.forEach((c) => c.classList.toggle("active", c === chip));
      wrap.classList.add("fading");
      setTimeout(() => {
        secs.forEach((s) => s.classList.toggle("sec-hide", cat !== "all" && s.dataset.cat !== cat));
        const n = cat === "all" ? total : counts[cat];
        if (showing) showing.textContent = cat === "all" ? `Showing all ${n} photos` : `Showing ${n} photos · ${chip.textContent.replace(/\d+$/, "").trim()}`;
        wrap.classList.remove("fading");
        // staggered pop-in for the now-visible cards
        let i = 0;
        secs.forEach((s) => {
          if (s.classList.contains("sec-hide")) return;
          s.querySelectorAll(".proj-card").forEach((card) => {
            card.classList.remove("pop-in", "in-view");
            card.style.animationDelay = `${Math.min(i++ * 55, 550)}ms`;
            void card.offsetWidth;
            card.classList.add("in-view", "pop-in");
          });
        });
        const grid = secs.find((s) => !s.classList.contains("sec-hide"));
        if (grid && cat !== "all") grid.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        setTimeout(() => (busy = false), 320);
      }, 240);
    };
    chips.forEach((chip) => chip.addEventListener("click", () => applyFilter(chip.dataset.cat, chip)));

    /* --- gentle 3D tilt on cards (desktop pointers only) --- */
    if (!reduce && window.matchMedia("(pointer: fine)").matches) {
      wrap.querySelectorAll(".proj-card").forEach((card) => {
        card.addEventListener("pointermove", (e) => {
          const r = card.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
          const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
          card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        });
        card.addEventListener("pointerleave", () => (card.style.transform = ""));
      });
    }

    /* --- lightbox --- */
    const lb = document.getElementById("lb");
    if (lb) {
      const img = document.getElementById("lbImg");
      const catEl = document.getElementById("lbCat");
      const cntEl = document.getElementById("lbCount");
      let list = [], idx = 0, open = false, swapping = false;

      const collect = () => [...wrap.querySelectorAll(".proj-sec:not(.sec-hide) .proj-card")];
      const render = (dir) => {
        const card = list[idx];
        const swapClass = dir === -1 ? "swap-l" : dir === 1 ? "swap-r" : null;
        const show = () => {
          img.src = card.querySelector("img").src;
          img.alt = card.querySelector("img").alt;
          catEl.textContent = card.dataset.cap;
          cntEl.textContent = `${idx + 1} / ${list.length}`;
          img.classList.remove("swap-l", "swap-r");
          img.classList.add("swap-in");
          setTimeout(() => { img.classList.remove("swap-in"); swapping = false; }, 420);
        };
        if (swapClass && !reduce) {
          swapping = true;
          img.classList.remove("swap-in");
          img.classList.add(swapClass);
          setTimeout(show, 200);
        } else show();
      };
      const openLb = (i) => {
        list = collect(); idx = i; open = true;
        render(0);
        lb.classList.add("open");
        lb.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        document.getElementById("lbClose").focus({ preventScroll: true });
      };
      const closeLb = () => {
        open = false;
        lb.classList.remove("open");
        lb.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      };
      const nav = (d) => {
        if (!open || swapping) return;
        idx = (idx + d + list.length) % list.length;
        render(d);
      };

      wrap.addEventListener("click", (e) => {
        const card = e.target.closest(".proj-card");
        if (!card) return;
        const vis = collect();
        openLb(vis.indexOf(card));
      });
      wrap.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && e.target.classList?.contains("proj-card")) {
          e.preventDefault();
          e.target.click();
        }
      });
      document.getElementById("lbPrev").addEventListener("click", () => nav(-1));
      document.getElementById("lbNext").addEventListener("click", () => nav(1));
      document.getElementById("lbClose").addEventListener("click", closeLb);
      lb.querySelector("[data-lb-close]").addEventListener("click", closeLb);
      window.addEventListener("keydown", (e) => {
        if (!open) return;
        if (e.key === "Escape") closeLb();
        if (e.key === "ArrowLeft") nav(-1);
        if (e.key === "ArrowRight") nav(1);
      });
      let tx = 0;
      img.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
      img.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - tx;
        if (Math.abs(dx) > 42) nav(dx < 0 ? 1 : -1);
      }, { passive: true });
    }
  }
})();
