// Aberno — umumiy skriptlar
document.addEventListener("DOMContentLoaded", () => {
  // Tema almashtirgich (yorug' / qorong'u)
  const root = document.documentElement;
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.dataset.theme || (darkQuery.matches ? "dark" : "light");
  const themeBtn = document.querySelector(".theme-toggle");
  const themeLabels = {
    uz: { toLight: "Yorug' rejimga o'tish", toDark: "Qorong'u rejimga o'tish" },
    ru: { toLight: "Включить светлую тему", toDark: "Включить тёмную тему" },
    en: { toLight: "Switch to light mode", toDark: "Switch to dark mode" },
  };
  const labels = themeLabels[root.lang] || themeLabels.uz;
  const syncThemeLabel = () => {
    if (!themeBtn) return;
    const label = currentTheme() === "dark" ? labels.toLight : labels.toDark;
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
  document.querySelectorAll(".nav a").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("#")[0];
    if (href !== current) return;
    link.classList.add("is-active");
    const item = link.closest(".nav__item");
    if (item) item.querySelector(".nav__toggle").classList.add("is-active");
  });

  // Ochiluvchi menyular (bosilganda / telefonda)
  const navItems = document.querySelectorAll(".nav__item");
  navItems.forEach((item) => {
    const btn = item.querySelector(".nav__toggle");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !item.classList.contains("is-open");
      navItems.forEach((o) => { o.classList.remove("is-open"); o.querySelector(".nav__toggle").setAttribute("aria-expanded", "false"); });
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open);
    });
  });
  document.addEventListener("click", (e) => {
    navItems.forEach((o) => {
      if (!o.contains(e.target)) { o.classList.remove("is-open"); o.querySelector(".nav__toggle").setAttribute("aria-expanded", "false"); }
    });
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

  // Til menyusi: tashqariga bosilganda yopiladi
  const langMenu = document.querySelector(".lang");
  if (langMenu) {
    document.addEventListener("click", (e) => {
      if (langMenu.open && !langMenu.contains(e.target)) langMenu.open = false;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") langMenu.open = false;
    });
  }

  // Mahsulot kategoriyalari filtri
  const filters = document.querySelectorAll(".filter");
  const groups = document.querySelectorAll(".cat-group");
  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      const cat = btn.dataset.filter;
      filters.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", b === btn);
      });
      groups.forEach((g) => (g.hidden = cat !== "all" && g.dataset.cat !== cat));
    })
  );

  // Havoladagi #brend (masalan #margaritto) tegishli filtrni yoqadi
  const applyHashFilter = () => {
    const key = location.hash.slice(1);
    const btn = key && document.querySelector(`.filter[data-filter="${key}"]`);
    if (btn) btn.click();
  };
  applyHashFilter();
  window.addEventListener("hashchange", applyHashFilter);

  // Mahsulot dizayn variantlari
  document.querySelectorAll(".product__variants").forEach((wrap) => {
    const main = wrap.closest(".product").querySelector(".product__img img");
    wrap.querySelectorAll(".variant").forEach((v) =>
      v.addEventListener("click", () => {
        main.src = v.dataset.src;
        wrap.querySelectorAll(".variant").forEach((x) => {
          x.classList.toggle("is-active", x === v);
          x.setAttribute("aria-pressed", x === v);
        });
      })
    );
  });

  // Hero: kartalar sichqonchaga yengil ergashadi
  const visual = document.querySelector(".hero__visual");
  if (visual && window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const cards = visual.querySelectorAll(".float-card");
    visual.closest(".hero").addEventListener("mousemove", (e) => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      cards.forEach((c, i) => {
        const k = i === 0 ? 14 : -10;
        c.style.transform = `rotateY(${x * k}deg) rotateX(${-y * k}deg)`;
      });
    });
  }

  // Hero: kartalardagi mahsulot rasmlari navbatma-navbat almashadi
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("[data-slides]").forEach((wrap, n) => {
      const slides = wrap.querySelectorAll(".slide");
      if (slides.length < 2) return;
      let i = 0;
      setTimeout(() => setInterval(() => {
        slides[i].classList.remove("is-active");
        i = (i + 1) % slides.length;
        slides[i].classList.add("is-active");
      }, 3200), n * 1600);
    });
  }

  // Xomashyo: narx so'rovi formasi
  document.querySelectorAll('input[type="range"][data-output]').forEach((range) => {
    const out = document.getElementById(range.dataset.output);
    const sync = () => (out.textContent = range.value + (range.dataset.unit || ""));
    range.addEventListener("input", sync);
    sync();
  });
  const quote = document.querySelector("#quote-form");
  if (quote) {
    quote.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      quote.querySelectorAll("[required]").forEach((input) => {
        const field = input.closest(".field");
        let ok = input.value.trim() !== "";
        if (ok && input.type === "tel") ok = /^[+\d\s()-]{9,}$/.test(input.value.trim());
        field.classList.toggle("has-error", !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;
      const list = quote.querySelector(".quote-result ul");
      list.innerHTML = "";
      quote.querySelectorAll("[data-summary]").forEach((group) => {
        const label = group.dataset.summary;
        let value = "";
        const checked = group.querySelector("input:checked");
        const control = group.querySelector("input:not([type=radio]), select");
        if (checked) value = checked.value;
        else if (control) value = control.value + (control.dataset.unit || "");
        if (!value) return;
        const li = document.createElement("li");
        li.textContent = `${label}: ${value}`;
        list.appendChild(li);
      });
      quote.querySelector(".quote-result").classList.add("is-visible");
    });
    quote.querySelectorAll("input, select, textarea").forEach((input) =>
      input.addEventListener("input", () => {
        const f = input.closest(".field");
        if (f) f.classList.remove("has-error");
      })
    );
  }

  // Sertifikatlarni kattalashtirib ko'rish
  const docs = document.querySelectorAll("[data-lightbox]");
  if (docs.length) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML = '<button class="lightbox__close" type="button" aria-label="×">×</button><img alt="">';
    document.body.appendChild(box);
    const img = box.querySelector("img");
    const close = () => {
      box.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
    };
    docs.forEach((d) =>
      d.addEventListener("click", () => {
        img.src = d.dataset.lightbox;
        img.alt = d.querySelector(".doc__title") ? d.querySelector(".doc__title").textContent : "";
        box.classList.add("is-open");
        document.body.classList.add("no-scroll");
        box.querySelector(".lightbox__close").focus();
      })
    );
    box.addEventListener("click", (e) => { if (e.target !== img) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  // Xomashyo: davlatga qarab minimal buyurtma (ichki bozor / eksport)
  const tons = document.querySelector("#tons[data-min-local]");
  const qCountry = document.querySelector("#qcountry");
  if (tons && qCountry) {
    const hint = document.querySelector("#tons-hint");
    const syncMin = () => {
      const local = qCountry.selectedIndex === 0;
      const min = Number(local ? tons.dataset.minLocal : tons.dataset.minExport);
      tons.min = min;
      if (Number(tons.value) < min) tons.value = min;
      if (hint) hint.textContent = local ? hint.dataset.local : hint.dataset.export;
    };
    qCountry.addEventListener("change", syncMin);
    tons.addEventListener("change", syncMin);
    syncMin();
  }

  // Footer yili
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
