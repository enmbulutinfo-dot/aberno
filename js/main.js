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

  // Formalar -> Telegram guruhi (Cloudflare Worker orqali, .claude/build/telegram-worker.js).
  // Manzil bo'sh bo'lsa, forma hech qayerga yubormaydi va faqat tasdiqni ko'rsatadi.
  const FORM_ENDPOINT = "";
  const formTexts = {
    uz: { sending: "Yuborilmoqda...", error: "Xabar yuborilmadi. Qayta urinib ko'ring yoki qo'ng'iroq qiling: +998 71 230-09-00" },
    ru: { sending: "Отправка...", error: "Сообщение не отправлено. Попробуйте ещё раз или позвоните: +998 71 230-09-00" },
    en: { sending: "Sending...", error: "The message was not sent. Please try again or call +998 71 230-09-00" },
  };
  const ft = formTexts[root.lang] || formTexts.uz;
  const addTrap = (f) => {
    const trap = document.createElement("input");
    trap.type = "text"; trap.name = "website"; trap.tabIndex = -1; trap.autocomplete = "off";
    trap.setAttribute("aria-hidden", "true");
    trap.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;opacity:0";
    f.appendChild(trap);
  };
  const sendForm = async (f, title, fields) => {
    if (!FORM_ENDPOINT) return true;
    const btn = f.querySelector('[type="submit"]');
    const label = btn.textContent;
    let msg = f.querySelector(".form__send-error");
    if (msg) msg.remove();
    btn.disabled = true;
    btn.textContent = ft.sending;
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: `${title} · ${(root.lang || "uz").toUpperCase()}`, page: location.href, website: f.querySelector('[name="website"]').value, fields }),
      });
      if (!res.ok) throw new Error(res.status);
      return true;
    } catch (err) {
      msg = document.createElement("p");
      msg.className = "form__send-error";
      msg.setAttribute("role", "alert");
      msg.textContent = ft.error;
      btn.after(msg);
      return false;
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  };

  // Aloqa formasi
  const form = document.querySelector("#contact-form");
  if (form) {
    addTrap(form);
    form.addEventListener("submit", async (e) => {
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
      const fields = [...form.querySelectorAll(".field")].map((field) => {
        const control = field.querySelector("input, select, textarea");
        return { label: field.querySelector("label").textContent.replace("*", "").trim(), value: control.value.trim() };
      }).filter((x) => x.value);
      if (!(await sendForm(form, "Aloqa formasi", fields))) return;
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

  // Aloqa sahifasi: kompyuterda telefon va email bosilsa nusxalanadi (telefonda — qo'ng'iroq/pochta)
  if (document.querySelector("#contact-form") && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const copyTexts = {
      uz: { done: "Nusxa olindi", hint: "Nusxalash uchun bosing" },
      ru: { done: "Скопировано", hint: "Нажмите, чтобы скопировать" },
      en: { done: "Copied", hint: "Click to copy" },
    };
    const ct = copyTexts[root.lang] || copyTexts.uz;
    const toast = document.createElement("div");
    toast.className = "copy-toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
    let hideTimer;
    const copyText = async (text) => {
      try { await navigator.clipboard.writeText(text); return true; } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand("copy"); ta.remove(); return ok;
      }
    };
    document.querySelectorAll('main a[href^="tel:"], main a[href^="mailto:"]').forEach((link) => {
      link.classList.add("is-copyable");
      link.title = ct.hint;
      link.addEventListener("click", async (e) => {
        e.preventDefault();
        const value = link.textContent.trim();
        if (!(await copyText(value))) return;
        toast.textContent = `${ct.done}: ${value}`;
        toast.classList.add("is-visible");
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
      });
    });
  }

  // Valmond: 3D korobka — o'zi sekin aylanadi, sichqoncha/barmoq bilan buriladi
  const stage = document.querySelector(".vbox3d");
  if (stage) {
    const box3d = stage.querySelector(".vbox3d__box");
    let rx = 62, rz = -24, drag = null, idle = 0, visible = true;
    const spin = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const set3d = () => { box3d.style.setProperty("--rx", rx + "deg"); box3d.style.setProperty("--rz", rz + "deg"); };
    const tick = () => {
      if (spin && visible && !drag && performance.now() > idle) { rz += 0.18; set3d(); }
      requestAnimationFrame(tick);
    };
    stage.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, rx, rz, mouse: e.pointerType === "mouse" }; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener("pointermove", (e) => {
      if (!drag) return;
      rz = drag.rz + (e.clientX - drag.x) * 0.4;
      if (drag.mouse) rx = Math.max(-80, Math.min(85, drag.rx - (e.clientY - drag.y) * 0.4));
      set3d();
    });
    const stop = () => { drag = null; idle = performance.now() + 2500; };
    stage.addEventListener("pointerup", stop);
    stage.addEventListener("pointercancel", stop);
    if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(stage);
    set3d();
    requestAnimationFrame(tick);
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
    addTrap(quote);
    quote.addEventListener("submit", async (e) => {
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
      const fields = [];
      quote.querySelectorAll("[data-summary]").forEach((group) => {
        const label = group.dataset.summary;
        let value = "";
        const checked = group.querySelector("input:checked");
        const control = group.querySelector("input:not([type=radio]), select");
        if (checked) value = checked.value;
        else if (control) value = control.value + (control.dataset.unit || "");
        if (!value) return;
        fields.push({ label, value });
        const li = document.createElement("li");
        li.textContent = `${label}: ${value}`;
        list.appendChild(li);
      });
      if (!(await sendForm(quote, "Xomashyo narx so'rovi", fields))) return;
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
