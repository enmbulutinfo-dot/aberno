// Aberno — interaktiv eksport xaritasi (d3 + world-atlas)
(async () => {
  const el = document.getElementById("geo");
  const dataEl = document.getElementById("geo-data");
  if (!el || !dataEl || !window.d3 || !window.topojson) return;
  const cfg = JSON.parse(dataEl.textContent);

  let world;
  try {
    world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json");
  } catch (e) {
    return; // internet bo'lmasa sxematik xarita qoladi
  }

  const ids = Object.keys(cfg.countries);
  const all = topojson.feature(world, world.objects.countries).features;
  const ca = all.filter((f) => ids.includes(String(f.id)));
  if (!ca.length) return;

  const W = 1000, H = 640;
  const proj = d3.geoMercator().fitExtent([[50, 40], [W - 50, H - 40]], { type: "FeatureCollection", features: ca });
  const path = d3.geoPath(proj);

  const svg = d3.create("svg")
    .attr("class", "geo__svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("role", "img")
    .attr("aria-label", cfg.label);

  const defs = svg.append("defs");
  const grad = defs.append("linearGradient").attr("id", "geoGold").attr("x1", "0").attr("y1", "0").attr("x2", "1").attr("y2", "1");
  grad.append("stop").attr("offset", "0").attr("stop-color", "#f3d8a6");
  grad.append("stop").attr("offset", "1").attr("stop-color", "#c58d42");
  const glow = defs.append("filter").attr("id", "geoGlow").attr("x", "-30%").attr("y", "-30%").attr("width", "160%").attr("height", "160%");
  glow.append("feGaussianBlur").attr("stdDeviation", "6").attr("result", "b");
  const merge = glow.append("feMerge");
  merge.append("feMergeNode").attr("in", "b");
  merge.append("feMergeNode").attr("in", "SourceGraphic");

  // Qo'shni davlatlar — xira fon
  svg.append("g").selectAll("path")
    .data(all.filter((f) => !ids.includes(String(f.id))))
    .join("path").attr("class", "land").attr("d", path);

  // O'rta Osiyo davlatlari
  const countries = svg.append("g").selectAll("path")
    .data(ca)
    .join("path")
    .attr("class", (f) => "ca" + (String(f.id) === cfg.home ? " is-home" : ""))
    .attr("data-id", (f) => String(f.id))
    .attr("d", path);

  // Eksport yo'nalishlari: Toshkentdan har bir shaharga
  const home = proj(cfg.cities[0].coords);
  const routes = svg.append("g");
  cfg.cities.slice(1).forEach((c) => {
    const p = proj(c.coords);
    const mx = (home[0] + p[0]) / 2, my = (home[1] + p[1]) / 2;
    const dx = p[0] - home[0], dy = p[1] - home[1];
    const k = 0.22;
    const cx = mx - dy * k, cy = my + dx * k;
    routes.append("path").attr("class", "route").attr("d", `M${home[0]},${home[1]} Q${cx},${cy} ${p[0]},${p[1]}`);
  });

  // Shaharlar
  const cities = svg.append("g");
  cfg.cities.forEach((c, i) => {
    const [x, y] = proj(c.coords);
    cities.append("circle").attr("class", "city-pulse").attr("cx", x).attr("cy", y).attr("r", 6).style("animation-delay", `${i * 0.35}s`);
    cities.append("circle").attr("class", "city").attr("cx", x).attr("cy", y).attr("r", i === 0 ? 5 : 3.5);
  });

  // Davlat nomlari
  const labels = svg.append("g");
  ca.forEach((f) => {
    const id = String(f.id);
    const [x, y] = path.centroid(f);
    const off = cfg.countries[id].offset || [0, 0];
    labels.append("text").attr("class", "label").attr("x", x + off[0]).attr("y", y + off[1]).attr("text-anchor", "middle").text(cfg.countries[id].name);
  });

  const fallback = el.querySelector(".geo__fallback");
  if (fallback) fallback.remove();
  el.insertBefore(svg.node(), el.querySelector(".geo__cursor"));
  el.classList.add("is-ready");

  // Panel va yonib turuvchi kursor
  const panel = el.querySelector(".geo__panel");
  const cursor = el.querySelector(".geo__cursor");
  const show = (id) => {
    const c = cfg.countries[id] || cfg.countries[cfg.home];
    panel.querySelector("strong").textContent = c.name;
    panel.querySelector("span").textContent = c.info;
    countries.classed("is-on", (f) => String(f.id) === id);
    el.classList.toggle("is-on-country", !!cfg.countries[id]);
  };
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    cursor.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`;
    el.classList.add("is-hover");
    const t = e.target.closest ? e.target.closest(".ca") : null;
    show(t ? t.dataset.id : null);
  });
  el.addEventListener("pointerleave", () => {
    el.classList.remove("is-hover");
    show(cfg.home);
    countries.classed("is-on", false);
  });
  show(cfg.home);
  countries.classed("is-on", false);
})();
