// Aberno — tayyor javobli yordamchi bot (uz / ru / en)
(() => {
  const PHONES = {
    marg: { tel: "+998953427070", num: "+998 95 342-70-70" },
    bulut: { tel: "+998953247070", num: "+998 95 324-70-70" },
    office: { tel: "+998712300900", num: "+998 71 230-09-00" },
  };
  const TG = "https://t.me/aberno_uz";
  const MAP = "https://www.google.com/maps/search/?api=1&query=41.254350,69.335487";

  const T = {
    uz: {
      title: "Aberno yordamchisi", status: "Savolingizni tanlang",
      open: "Yordamchini ochish", close: "Yopish", home: "Bosh menyu",
      phone: { marg: "Margarin", bulut: "BULUT", office: "Ofis" }, tg: "Telegram",
      nodes: {
        root: { text: "Assalomu alaykum! Men Aberno Group yordamchisiman. Qaysi mavzu qiziqtiradi?", opts: ["products", "buy", "raw", "contact", "career", "operator"] },
        products: { label: "Mahsulotlar", text: "Bizda 5 ta brend bor: <b>BULUT</b> (35+ gigiena mahsuloti), <b>PanDoozy</b> (salfetka va hojatxona qog'ozi), <b>Margaritto</b> (margarinlar), <b>Smaylo</b> (spredlar) va <b>Valmond</b> (premium sariyog', tez orada). Qaysi biri haqida bilmoqchisiz?", opts: ["bulut", "pandoozy", "marg", "valmond"] },
        bulut: { label: "BULUT", text: "BULUT — uy, ofis va HoReCa uchun 35 dan ortiq gigiena mahsuloti: quti salfetkalar, sochiqlar, nam salfetkalar, hojatxona qog'ozi va dispenserlar.", links: [["bulut.html", "BULUT katalogi"]], call: ["bulut"] },
        pandoozy: { label: "PanDoozy", text: "PanDoozy — hamyonbop salfetka va hojatxona qog'ozi: vtulkali va vtulkasiz rulonlar, qulay qadoqdagi salfetkalar.", links: [["pandoozy.html", "PanDoozy mahsulotlari"]], call: ["bulut"] },
        marg: { label: "Margaritto va Smaylo", text: "Margaritto — qatlamli xamir, kremlar va universal margarinlar (8 ta mahsulot). Smaylo — nonushta uchun spredlar (4 ta mahsulot). Quvvat — oyiga 1000 t.", links: [["margarin.html#margaritto", "Margaritto"], ["margarin.html#smaylo", "Smaylo"]], call: ["marg"] },
        valmond: { label: "Valmond", text: "Valmond — o'zini yaxshi ko'radiganlar uchun premium sariyog': tabiiy, tuzsiz, 82,5% yog'li. 800 g'lik korobkada 200 g'lik 4 ta pachka bor. Tez orada sotuvga chiqadi.", links: [["valmond.html", "Valmond sahifasi"]] },
        buy: { label: "Sotib olish va hamkorlik", text: "Distribyutorlar, savdo tarmoqlari, HoReCa va nonvoyxonalar bilan ishlaymiz. Nima qiziqtiradi?", opts: ["wholesale", "private", "export"] },
        wholesale: { label: "Ulgurji xarid", text: "Narx va shartlar hajmga qarab individual belgilanadi. Kerakli yo'nalish bo'yicha operatorga qo'ng'iroq qiling:", call: ["marg", "bulut"], links: [["contact.html", "Aloqa sahifasi"]] },
        private: { label: "Private label", text: "Hamkorning o'z brendi ostida ishlab chiqaramiz. Minimal buyurtma — 1000 qop.", call: ["bulut", "marg"] },
        export: { label: "Eksport", text: "Mahsulotlarimizni O'rta Osiyo davlatlari va Afg'onistonga eksport qilamiz. Distribyutorlar uchun maxsus shartlar bor.", links: [["export.html", "Eksport sahifasi"]], call: ["office"] },
        raw: { label: "Xomashyo qog'oz", text: "100% sellyulozali asos qog'oz: zichligi 15–23 g/m², 1–3 qatlam, kengligi 2050 mm gacha. Quvvat — oyiga 500+ t. Minimal buyurtma: ichki bozor uchun 4 t, eksport uchun 10 t.", links: [["xomashyo.html", "Xomashyo haqida"]], call: ["bulut"] },
        contact: { label: "Manzil va ish vaqti", text: "Toshkent sh., Yashnobod tumani, Uysozlar ko'chasi, 72.<br>Ish vaqti: Dushanba – Shanba, 09:00 – 18:00.", links: [[MAP, "Xaritada ochish"]], call: ["office"] },
        career: { label: "Karyera", text: "Hozircha e'lon qilingan vakansiya yo'q. Biz bilan ishlashni xohlasangiz, qo'ng'iroq qiling — rezyumeingizni qabul qilamiz.", links: [["karyera.html", "Karyera sahifasi"]], call: ["office"] },
        operator: { label: "Operator bilan bog'lanish", text: "Kerakli raqamga qo'ng'iroq qiling yoki Telegram'da yozing:", call: ["marg", "bulut", "office"], tg: true },
      },
    },
    ru: {
      title: "Помощник Aberno", status: "Выберите вопрос",
      open: "Открыть помощника", close: "Закрыть", home: "Главное меню",
      phone: { marg: "Маргарин", bulut: "BULUT", office: "Офис" }, tg: "Telegram",
      nodes: {
        root: { text: "Здравствуйте! Я помощник Aberno Group. Какая тема вас интересует?", opts: ["products", "buy", "raw", "contact", "career", "operator"] },
        products: { label: "Продукция", text: "У нас 5 брендов: <b>BULUT</b> (35+ видов гигиенической продукции), <b>PanDoozy</b> (салфетки и туалетная бумага), <b>Margaritto</b> (маргарины), <b>Smaylo</b> (спреды) и <b>Valmond</b> (премиальное сливочное масло, скоро). О каком рассказать?", opts: ["bulut", "pandoozy", "marg", "valmond"] },
        bulut: { label: "BULUT", text: "BULUT — более 35 видов гигиенической продукции для дома, офиса и HoReCa: салфетки в коробках, полотенца, влажные салфетки, туалетная бумага и диспенсеры.", links: [["bulut.html", "Каталог BULUT"]], call: ["bulut"] },
        pandoozy: { label: "PanDoozy", text: "PanDoozy — доступные салфетки и туалетная бумага: рулоны со втулкой и без, салфетки в удобной упаковке.", links: [["pandoozy.html", "Продукция PanDoozy"]], call: ["bulut"] },
        marg: { label: "Margaritto и Smaylo", text: "Margaritto — маргарины для слоёного теста, кремов и универсальные (8 продуктов). Smaylo — спреды для завтрака (4 продукта). Мощность — 1000 т в месяц.", links: [["margarin.html#margaritto", "Margaritto"], ["margarin.html#smaylo", "Smaylo"]], call: ["marg"] },
        valmond: { label: "Valmond", text: "Valmond — премиальное сливочное масло для тех, кто любит себя: натуральное, несолёное, жирность 82,5%. В коробке 800 г — 4 пачки по 200 г. Скоро в продаже.", links: [["valmond.html", "Страница Valmond"]] },
        buy: { label: "Покупка и сотрудничество", text: "Работаем с дистрибьюторами, торговыми сетями, HoReCa и пекарнями. Что вас интересует?", opts: ["wholesale", "private", "export"] },
        wholesale: { label: "Оптовая закупка", text: "Цены и условия рассчитываются индивидуально в зависимости от объёма. Позвоните оператору нужного направления:", call: ["marg", "bulut"], links: [["contact.html", "Страница контактов"]] },
        private: { label: "Private label", text: "Производим под собственным брендом партнёра. Минимальный заказ — 1000 мешков.", call: ["bulut", "marg"] },
        export: { label: "Экспорт", text: "Экспортируем продукцию в страны Центральной Азии и Афганистан. Для дистрибьюторов действуют особые условия.", links: [["export.html", "Страница экспорта"]], call: ["office"] },
        raw: { label: "Бумага-основа", text: "Бумага-основа из 100% целлюлозы: граммаж 15–23 g/m², 1–3 слоя, ширина до 2050 мм. Мощность — 500+ т в месяц. Минимальный заказ: внутренний рынок — 4 т, экспорт — 10 т.", links: [["xomashyo.html", "О сырье"]], call: ["bulut"] },
        contact: { label: "Адрес и часы работы", text: "г. Ташкент, Яшнабадский район, ул. Уйсозлар, 72.<br>Часы работы: понедельник – суббота, 09:00 – 18:00.", links: [[MAP, "Открыть на карте"]], call: ["office"] },
        career: { label: "Карьера", text: "Сейчас открытых вакансий нет. Если хотите работать с нами, позвоните — мы примем ваше резюме.", links: [["karyera.html", "Страница карьеры"]], call: ["office"] },
        operator: { label: "Связаться с оператором", text: "Позвоните по нужному номеру или напишите в Telegram:", call: ["marg", "bulut", "office"], tg: true },
      },
    },
    en: {
      title: "Aberno assistant", status: "Choose a question",
      open: "Open the assistant", close: "Close", home: "Main menu",
      phone: { marg: "Margarine", bulut: "BULUT", office: "Office" }, tg: "Telegram",
      nodes: {
        root: { text: "Hello! I am the Aberno Group assistant. What would you like to know?", opts: ["products", "buy", "raw", "contact", "career", "operator"] },
        products: { label: "Products", text: "We have 5 brands: <b>BULUT</b> (35+ hygiene products), <b>PanDoozy</b> (napkins and toilet paper), <b>Margaritto</b> (margarines), <b>Smaylo</b> (spreads) and <b>Valmond</b> (premium butter, coming soon). Which one are you interested in?", opts: ["bulut", "pandoozy", "marg", "valmond"] },
        bulut: { label: "BULUT", text: "BULUT offers more than 35 hygiene products for homes, offices and HoReCa: boxed napkins, towels, wet wipes, toilet paper and dispensers.", links: [["bulut.html", "BULUT catalog"]], call: ["bulut"] },
        pandoozy: { label: "PanDoozy", text: "PanDoozy is an affordable line of napkins and toilet paper: rolls with and without a core, napkins in handy packs.", links: [["pandoozy.html", "PanDoozy products"]], call: ["bulut"] },
        marg: { label: "Margaritto and Smaylo", text: "Margaritto: margarines for puff pastry, creams and universal use (8 products). Smaylo: breakfast spreads (4 products). Capacity: 1,000 t per month.", links: [["margarin.html#margaritto", "Margaritto"], ["margarin.html#smaylo", "Smaylo"]], call: ["marg"] },
        valmond: { label: "Valmond", text: "Valmond is a premium butter for those who treat themselves: natural, unsalted, 82.5% fat. An 800 g box holds four 200 g packs. Coming soon.", links: [["valmond.html", "Valmond page"]] },
        buy: { label: "Buying and partnership", text: "We work with distributors, retail chains, HoReCa and bakeries. What are you interested in?", opts: ["wholesale", "private", "export"] },
        wholesale: { label: "Wholesale", text: "Prices and terms depend on volume and are agreed individually. Call the operator for the product line you need:", call: ["marg", "bulut"], links: [["contact.html", "Contact page"]] },
        private: { label: "Private label", text: "We produce under the partner's own brand. Minimum order: 1,000 bags.", call: ["bulut", "marg"] },
        export: { label: "Export", text: "We export to Central Asian countries and Afghanistan, with special terms for distributors.", links: [["export.html", "Export page"]], call: ["office"] },
        raw: { label: "Base paper", text: "100% cellulose base paper: paper grammage 15–23 g/m², 1–3 plies, width up to 2050 mm. Capacity: 500+ t per month. Minimum order: 4 t for the domestic market, 10 t for export.", links: [["xomashyo.html", "About raw materials"]], call: ["bulut"] },
        contact: { label: "Address and hours", text: "72 Uysozlar St, Yashnabad district, Tashkent.<br>Hours: Monday – Saturday, 09:00 – 18:00.", links: [[MAP, "Open the map"]], call: ["office"] },
        career: { label: "Careers", text: "There are no open positions right now. If you would like to work with us, give us a call and we will take your CV.", links: [["karyera.html", "Careers page"]], call: ["office"] },
        operator: { label: "Talk to an operator", text: "Call the number you need or message us on Telegram:", call: ["marg", "bulut", "office"], tg: true },
      },
    },
  };

  const init = () => {
    const t = T[document.documentElement.lang] || T.uz;
    const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    const cross = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

    const wrap = document.createElement("div");
    wrap.className = "bot";
    wrap.innerHTML =
      `<button type="button" class="bot__fab" aria-expanded="false" aria-controls="bot-panel" aria-label="${t.open}">${icon}</button>` +
      `<section class="bot__panel" id="bot-panel" role="dialog" aria-label="${t.title}" hidden>` +
      `<header class="bot__head"><img src="${document.querySelector(".logo__mark") ? document.querySelector(".logo__mark").getAttribute("src") : ""}" alt="" width="739" height="947"><div><strong>${t.title}</strong><span>${t.status}</span></div>` +
      `<button type="button" class="bot__close" aria-label="${t.close}">${cross}</button></header>` +
      `<div class="bot__log" aria-live="polite"></div><div class="bot__opts"></div></section>`;
    document.body.appendChild(wrap);

    const fab = wrap.querySelector(".bot__fab");
    const panel = wrap.querySelector(".bot__panel");
    const log = wrap.querySelector(".bot__log");
    const opts = wrap.querySelector(".bot__opts");

    const add = (html, who) => {
      const m = document.createElement("div");
      m.className = `bot__msg bot__msg--${who}`;
      m.innerHTML = html;
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
    };

    const show = (id) => {
      const n = t.nodes[id];
      let html = `<p>${n.text}</p>`;
      const acts = [];
      (n.call || []).forEach((k) => acts.push(`<a class="bot__act bot__act--tel" href="tel:${PHONES[k].tel}">${t.phone[k]}: ${PHONES[k].num}</a>`));
      if (n.tg) acts.push(`<a class="bot__act" href="${TG}" target="_blank" rel="noopener">${t.tg}: @aberno_uz</a>`);
      (n.links || []).forEach(([href, label]) => {
        const ext = href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
        acts.push(`<a class="bot__act bot__act--link" href="${href}"${ext}>${label}</a>`);
      });
      if (acts.length) html += `<div class="bot__acts">${acts.join("")}</div>`;
      add(html, "bot");

      opts.innerHTML = "";
      const next = n.opts || [];
      [...next, ...(id === "root" ? [] : ["root"])].forEach((k) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "bot__chip" + (k === "root" ? " bot__chip--home" : "");
        b.textContent = k === "root" ? t.home : t.nodes[k].label;
        b.addEventListener("click", () => {
          add(b.textContent, "user");
          show(k);
        });
        opts.appendChild(b);
      });
    };

    let started = false;
    const toggle = (open) => {
      panel.hidden = !open;
      wrap.classList.toggle("is-open", open);
      fab.setAttribute("aria-expanded", open);
      fab.setAttribute("aria-label", open ? t.close : t.open);
      fab.innerHTML = open ? cross : icon;
      if (open && !started) { started = true; show("root"); }
      if (open) { const first = opts.querySelector("button"); if (first) first.focus(); }
    };
    fab.addEventListener("click", () => toggle(panel.hidden));
    wrap.querySelector(".bot__close").addEventListener("click", () => { toggle(false); fab.focus(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { toggle(false); fab.focus(); } });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
