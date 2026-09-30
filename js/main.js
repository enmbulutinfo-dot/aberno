// Aberno — umumiy skriptlar
document.addEventListener("DOMContentLoaded", () => {
  // Tema almashtirgich (yorug' / qorong'u)
  const root = document.documentElement;
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.dataset.theme || (darkQuery.matches ? "dark" : "light");
  const themeBtn = document.querySelector(".theme-toggle");
  const syncThemeLabel = () => {
    if (!themeBtn) return;
    const label = currentTheme() === "dark" ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish";
    themeBtn.setAttribute("aria-label", label);
    themeBtn.title = label;
  };
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncThemeLabel();
    });
  }
  syncThemeLabel();

  // Mobil menyu
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open);
    });
    nav.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", false);
      })
    );
  }

  // Joriy sahifani menyuda belgilash
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__link").forEach((link) => {
    if (link.getAttribute("href") === current) link.classList.add("is-active");
  });

  // Header soyasi
  const header = document.querySelector(".header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Scroll paytida paydo bo'lish
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Raqamlar hisoblagichi
  const counters = document.querySelectorAll("[data-count]");
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            co.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => co.observe(el));
  }

  // Eksport xaritasi
  const info = document.querySelector(".country-info");
  document.querySelectorAll(".map-country").forEach((c) => {
    const show = () => {
      document.querySelectorAll(".map-country").forEach((x) => x.classList.remove("is-active"));
      c.classList.add("is-active");
      if (info) info.textContent = c.dataset.info;
    };
    c.addEventListener("click", show);
    c.addEventListener("mouseenter", show);
  });

  // Aloqa formasi
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll("[required]").forEach((input) => {
        const field = input.closest(".field");
        let ok = input.value.trim() !== "";
        if (ok && input.type === "tel") ok = /^[+\d\s()-]{9,}$/.test(input.value.trim());
        if (ok && input.type === "email") ok = /^\S+@\S+\.\S+$/.test(input.value.trim());
        field.classList.toggle("has-error", !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;
      // TODO: backend yoki Telegram bot ulanganda so'rovni shu yerdan yuborish
      form.reset();
      form.querySelector(".form__success").classList.add("is-visible");
    });
    form.querySelectorAll("input, select, textarea").forEach((input) =>
      input.addEventListener("input", () => input.closest(".field").classList.remove("has-error"))
    );
  }

  // Footer yili
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
