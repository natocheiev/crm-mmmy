// Збирає user-flows.html з flows.md, sitemap.md і теки wireframes/.
// Запуск: cd tools/flows && npm install && node build.mjs
// Розкладка — ELK (layered, ортогональні лінії з прямими кутами), як у Figma-версії flows.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ELK from "elkjs/lib/elk.bundled.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
const plain = (s) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

// ---------- екрани з sitemap.md ----------
const sitemap = read("sitemap.md");
const screens = []; // {name, file, base, group, states:{empty,error,loading,success: text|null}}
{
  const i = sitemap.indexOf("| Група | Екран | Файл | Job | Персона | Стани |");
  for (const line of sitemap.slice(i).split("\n").slice(2)) {
    if (!line.startsWith("|")) break;
    const c = line.split("|").slice(1, -1).map((x) => x.trim());
    const name = plain(c[1]).replace(/\s+—\s+головний$/, "").trim();
    const file = c[2].replace(/`/g, "");
    const cell = c[5];
    const pick = (label) => { const m = cell.match(new RegExp("\\*\\*" + label + "[^*]*:\\*\\*\\s*([^<]*)")); return m ? m[1].trim() : null; };
    screens.push({ name, file, base: file.replace(/\.html$/, ""), group: plain(c[0]), job: plain(c[3]),
      states: { empty: pick("Порожній"), error: pick("Помилка"), loading: pick("Завантаження"), success: pick("Успіх") } });
  }
}
const byName = Object.fromEntries(screens.map((s) => [s.name, s]));
const WF = path.join(ROOT, "wireframes");
const wfExists = (f) => fs.existsSync(path.join(WF, f));
const wfText = (f) => {
  const t = fs.readFileSync(path.join(WF, f), "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const m = t.slice(t.indexOf("<main")); return m.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
};

// Успіх-вузли, які в назві не мають слова success (з колонки «Стани» sitemap.md).
const SUCCESS_HINTS = {
  "Дошка": ["тема і план під настрій", "лист надіслано"],
  "Швидке додавання": ["підтвердження і «скасувати»", "збережено на пристрої"],
  "Можливі задачі": ["перетворено", "відхилено"],
  "Підсумок дня": ["план на завтра збережено"],
  "Нагороди і цілі": ["нагороду отримано"],
  "Похвали": ["похвалу збережено"],
  "Кольори і теми": ["тему збережено"],
  "Групи і джерела": ["підключено"],
};
// Вузли J9 без префікса екрана — стани форми похвали (flows.md, J9).
const J9_PREFIX = { "error —": "Похвали", "loading —": "Похвали", "похвалу збережено": "Похвали", "Стан відкритого екрана: форма похвали": "Похвали" };

function mapNode(label, kind) {
  if (kind === "q" || kind === "ok" || kind === "ref") return null;
  let screen = null, rest = "";
  if (kind === "screen" && byName[label]) { screen = byName[label]; rest = ""; }
  else {
    const m = label.match(/^([^:]+):\s*(.*)$/);
    if (m && byName[m[1].trim()]) { screen = byName[m[1].trim()]; rest = m[2]; }
    else for (const [p, s] of Object.entries(J9_PREFIX)) if (label.startsWith(p)) { screen = byName[s]; rest = label; }
  }
  if (!screen) return null;
  const low = rest.toLowerCase();
  let state = "";
  if (kind === "screen") state = "";
  else if (/^loading\b/.test(low) || (kind !== "screen" && low === "loading")) state = "loading";
  else if (/^empty\b/.test(low)) state = "empty";
  else if (/^error\b/.test(low) || kind === "err") state = "error";
  else if ((SUCCESS_HINTS[screen.name] || []).some((h) => low.startsWith(h) || low.includes(h))) state = "success";
  else if (label.startsWith("Стан відкритого екрана: форма похвали")) state = "";
  else state = "part";
  const STATE_UA = { "": "базова сторінка", loading: "завантаження", empty: "порожній", error: "помилка", success: "успіх", part: "стан у межах екрана" };
  if (state === "part") {
    const f = screen.file;
    return wfExists(f) ? { page: "wireframes/" + f, status: "part", screen: screen.name, state: STATE_UA.part, note: "окремої сторінки в цього стану немає — відкривається базовий екран" }
                       : { page: null, status: "none", screen: screen.name, state: STATE_UA.part, note: "вайрфрейму ще немає" };
  }
  const f = state ? `${screen.base}-${state}.html` : screen.file;
  if (!wfExists(f)) {
    const cell = state ? screen.states[state] : "x";
    if (cell && cell.startsWith("—")) return { page: "wireframes/" + screen.file, status: "part", screen: screen.name, state: STATE_UA[state], note: "у sitemap.md цей стан позначено «—» — відкривається базовий екран" };
    return { page: null, status: "none", screen: screen.name, state: STATE_UA[state], note: "вайрфрейму ще немає" };
  }
  if (!state) return { page: "wireframes/" + f, status: "done", screen: screen.name, state: STATE_UA[""], note: "вайрфрейм намальовано" };
  const phrase = rest.replace(/^(loading|empty|error)\s*(—\s*)?/i, "").split(/[,—]/)[0].trim().toLowerCase();
  // Сторінка стану показує ПЕРШИЙ варіант з колонки «Стани» sitemap.md (_conventions.md §7).
  const norm = (x) => x.toLowerCase().replace(/[«»"'.,:;()—–-]/g, " ").replace(/\s+/g, " ").trim();
  const first = norm((screen.states[state] || "").split(";")[0]);
  const np = norm(rest.replace(/^(loading|empty|error)\s*(—\s*)?/i, ""));
  const exact = !phrase || wfText(f).includes(phrase.slice(0, 24)) || (first && np && (first.includes(np.slice(0, 16)) || np.includes(first.slice(0, 16))));
  return exact ? { page: "wireframes/" + f, status: "done", screen: screen.name, state: STATE_UA[state], note: "вайрфрейм намальовано" }
               : { page: "wireframes/" + f, status: "variant", screen: screen.name, state: STATE_UA[state], note: "сторінка стану показує інший варіант; цей — у коментарі сторінки" };
}

// ---------- flows.md ----------
const md = read("flows.md");
const CW = 7.0, LH = 18;
const wrapLines = (t, w) => { let n = 1, cur = 0; for (const word of t.split(" ")) { const l = word.length * CW; if (cur && cur + CW + l > w) { n++; cur = l; } else cur += (cur ? CW : 0) + l; } return n; };
const bolds = (s) => [...s.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1]);

async function layoutFlow(part) {
  const m = part.match(/```mermaid\n([\s\S]*?)```/);
  const title = part.split("\n")[0].trim();
  const intro = part.slice(part.indexOf("\n"), m.index).trim().split("\n").filter((l) => l && !l.startsWith("|") && !l.startsWith("**Розвилки")).map(plain).join(" ");
  const nodes = {}, edges = [], cls = {};
  const re = /^([A-Z_0-9]+)(\(\["(.*?)"\]\)|\(\("(.*?)"\)\)|\{"(.*?)"\}|\["(.*?)"\])?$/;
  const node = (tok) => {
    const mm = tok.trim().match(re); if (!mm) throw new Error("bad node " + tok);
    const id = mm[1]; nodes[id] ??= { id };
    if (mm[3] !== undefined) Object.assign(nodes[id], { label: mm[3], shape: "state" });
    if (mm[4] !== undefined) Object.assign(nodes[id], { label: mm[4], shape: "ok" });
    if (mm[5] !== undefined) Object.assign(nodes[id], { label: mm[5], shape: "q" });
    if (mm[6] !== undefined) Object.assign(nodes[id], { label: mm[6], shape: "screen" });
    return id;
  };
  for (let line of m[1].split("\n")) {
    line = line.trim();
    if (!line || line.startsWith("flowchart") || line.startsWith("classDef")) continue;
    if (line.startsWith("class ")) { const [, ids, c] = line.match(/^class (\S+) (\w+)/); ids.split(",").forEach((i) => (cls[i] = c)); continue; }
    const em = line.match(/^(.*?)\s*-->(?:\|(.*?)\|)?\s*(.*)$/);
    edges.push({ from: node(em[1]), to: node(em[3]), label: em[2] || "" });
  }
  const after = part.slice(m.index + m[0].length);
  const forks = [];
  const fm = after.match(/\*\*Розвилки:\*\*\n([\s\S]*?)\n\n/);
  if (fm) { let cur = null; for (const l of fm[1].split("\n")) { const n = l.match(/^(\d+)\. (.*)$/); if (n) { cur = { n: +n[1], raw: n[2] }; forks.push(cur); } else if (cur && l.trim().startsWith("- ")) cur.raw += " " + l.trim().slice(2); } }
  const states = []; const sm = after.match(/\*\*Стани:\*\*\n\n([\s\S]*?)\n\n/);
  if (sm) for (const l of sm[1].split("\n").slice(2)) { const c = l.split("|").map((s) => s.trim()); if (c[1]) states.push([c[1], c[2]]); }
  const ends = []; const en = after.match(/\*\*Кінці:\*\*\s*\n?([\s\S]*?)(\n\n|$)/);
  if (en) { const ls = en[1].split("\n").filter((l) => l.startsWith("- ")); if (ls.length) ls.forEach((l) => ends.push(l.slice(2))); else ends.push(en[1].trim()); }
  const notes = [...after.matchAll(/^\*\*(Тупиків немає\.|Глибина[^*]*|Звідки ще приходять[^*]*)\*\*(.*)$/gm)].map((x) => x[1] + x[2]);

  // хаби: зворотні лінії у вузол з 4+ входами замінюємо чипом-посиланням
  const order = Object.keys(nodes);
  const indeg = {}; edges.forEach((e) => (indeg[e.to] = (indeg[e.to] || 0) + 1));
  let r = 0;
  for (const e of edges) if ((indeg[e.to] || 0) >= 4 && order.indexOf(e.from) > order.indexOf(e.to)) {
    const rid = "REF" + r++; nodes[rid] = { id: rid, label: "↩ " + nodes[e.to].label.split(" — ")[0].replace("Стан відкритого екрана: ф", "Ф"), shape: "ref", ref: e.to }; e.to = rid;
  }
  const ns = Object.values(nodes);
  for (const n of ns) {
    n.kind = n.shape === "ref" ? "ref" : n.shape === "q" ? "q" : cls[n.id] === "err" ? "err" : n.shape === "ok" ? "ok" : n.shape === "screen" ? "screen" : "state";
    if (n.kind === "q") {
      let f = forks.find((f) => bolds(f.raw).some((b) => b === n.label));
      if (!f) { const lw = n.label.replace("?", "").split(" "); f = forks.find((f) => bolds(f.raw).some((b) => b.endsWith("?") && b.replace("?", "").split(" ").every((w) => lw.includes(w)))); }
      if (f) n.fork = f.n;
    }
    if (n.kind === "ref") { n.w = Math.ceil(n.label.length * 8.2) + 40; n.h = 30; }
    else if (n.kind === "q") { n.w = 232; n.h = Math.max(104, wrapLines(n.label, 128) * LH * 2 + 40); }
    else { n.w = 236; n.h = wrapLines(n.label, 236 - 28) * LH + 26; }
    n.map = mapNode(n.label, n.kind);
    if (n.map && n.kind !== "q") n.h += 0; // місце під мітку — над вузлом
  }
  const elk = new ELK();
  const g = await elk.layout({
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered", "elk.direction": "DOWN", "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.spacing.nodeNodeBetweenLayers": "64", "elk.spacing.nodeNode": "52",
      "elk.layered.spacing.edgeNodeBetweenLayers": "30", "elk.spacing.edgeEdge": "18", "elk.spacing.edgeNode": "26",
      "elk.layered.spacing.edgeEdgeBetweenLayers": "18", "elk.spacing.edgeLabel": "6",
      "elk.layered.cycleBreaking.strategy": "MODEL_ORDER", "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
      "elk.layered.feedbackEdges": "true", "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED", "elk.layered.unnecessaryBendpoints": "false",
    },
    children: ns.map((n) => ({ id: n.id, width: n.w, height: n.h })),
    edges: edges.map((e, i) => ({ id: "e" + i, sources: [e.from], targets: [e.to],
      labels: e.label ? [{ text: e.label, width: Math.ceil(e.label.length * 6.4) + 18, height: 22 }] : [] })),
  });
  const pos = Object.fromEntries(g.children.map((c) => [c.id, c]));
  for (const n of ns) { n.x = Math.round(pos[n.id].x); n.y = Math.round(pos[n.id].y); }
  const E = g.edges.map((e, i) => {
    const s = e.sections[0];
    const pts = [s.startPoint, ...(s.bendPoints || []), s.endPoint].map((p) => [Math.round(p.x), Math.round(p.y)]);
    const snap = (pt, id, isStart) => {
      const n = nodes[id]; if (n.kind !== "q") return;
      const cx = n.x + n.w / 2, cy = n.y + n.h / 2, hw = n.w / 2, hh = n.h / 2;
      const other = isStart ? pts[1] : pts[pts.length - 2];
      if (other[0] === pt[0]) { const dx = Math.min(Math.abs(pt[0] - cx), hw); pt[1] = Math.round(pt[1] > cy ? cy + hh * (1 - dx / hw) : cy - hh * (1 - dx / hw)); }
      else { const dy = Math.min(Math.abs(pt[1] - cy), hh); pt[0] = Math.round(pt[0] > cx ? cx + hw * (1 - dy / hh) : cx - hw * (1 - dy / hh)); }
    };
    snap(pts[0], edges[i].from, true); snap(pts[pts.length - 1], edges[i].to, false);
    const lb = e.labels && e.labels[0] ? { text: edges[i].label, x: Math.round(e.labels[0].x), y: Math.round(e.labels[0].y), w: e.labels[0].width } : null;
    return { from: edges[i].from, to: edges[i].to, pts, label: lb };
  });
  return { title, intro, w: Math.round(g.width), h: Math.round(g.height), nodes: ns, edges: E, forks, states, ends, notes, order: ns.map((n) => n.id) };
}

// ---------- рендер ----------
const FILL = { screen: ["#e9eef8", "#284b9b"], state: ["#ffffff", "#abb8cd"], err: ["#fdecec", "#e5484d"], ok: ["#e6fbd5", "#5ba82c"], q: ["#f1f3f7", "#284b9b"], ref: ["#b4fb83", "#b4fb83"] };
const TAG = { done: "вайрфрейм", variant: "інший варіант", part: "у базовому екрані", none: "немає вайрфрейму" };
function svgFlow(f, fi) {
  const P = 36, W = f.w + P * 2, H = f.h + P * 2;
  let s = `<svg class="flow-svg" id="svg-${fi}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.title)}">`;
  s += `<defs><marker id="arr-${fi}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#5c708e" stroke-width="1.6"/></marker></defs><g transform="translate(${P},${P})">`;
  f.edges.forEach((e, i) => {
    const d = "M" + e.pts.map((p) => p.join(" ")).join(" L");
    s += `<g class="edge" data-e="${i}" data-from="${e.from}" data-to="${e.to}"><path class="edge-hit" d="${d}"/><path class="edge-line" d="${d}" marker-end="url(#arr-${fi})"/>`;
    if (e.label) s += `<foreignObject x="${e.label.x - 4}" y="${e.label.y}" width="${e.label.w + 8}" height="24"><div class="edge-label">${esc(e.label.text)}</div></foreignObject>`;
    s += `</g>`;
  });
  for (const n of f.nodes) {
    const [fill, stroke] = FILL[n.kind];
    const st = n.map ? n.map.status : "";
    const attrs = `class="node k-${n.kind}${st ? " st-" + st : ""}" data-id="${n.id}"` + (n.map && n.map.page ? ` data-page="${esc(n.map.page)}" data-screen="${esc(n.map.screen)}" data-state="${esc(n.map.state)}" data-note="${esc(n.map.note)}" data-status="${st}"` : "");
    const open = n.map && n.map.page ? `<a href="${esc(n.map.page)}" ${attrs}>` : `<g ${attrs}>`;
    const close = n.map && n.map.page ? "</a>" : "</g>";
    s += open;
    if (n.kind === "q") s += `<polygon points="${n.x + n.w / 2},${n.y} ${n.x + n.w},${n.y + n.h / 2} ${n.x + n.w / 2},${n.y + n.h} ${n.x},${n.y + n.h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
    else s += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${n.kind === "ok" || n.kind === "ref" ? n.h / 2 : 10}" fill="${fill}" stroke="${stroke}" stroke-width="${n.kind === "screen" || n.kind === "ok" ? 1.6 : 1.1}"${st === "part" ? ' stroke-dasharray="5 4"' : ""}/>`;
    const tw = n.kind === "q" ? 132 : n.w - 24, tx = n.kind === "q" ? n.x + (n.w - 132) / 2 : n.x + 12;
    s += `<foreignObject x="${tx}" y="${n.y}" width="${tw}" height="${n.h}"><div class="nl nl-${n.kind}">${esc(n.label)}</div></foreignObject>`;
    if (n.fork) s += `<g class="fork"><circle cx="${n.x + n.w * 0.25}" cy="${n.y + n.h * 0.25}" r="12"/><text x="${n.x + n.w * 0.25}" y="${n.y + n.h * 0.25 + 4}">${n.fork}</text></g>`;
    if (st) { const t = TAG[st], tw2 = Math.ceil(t.length * 5.9) + 14; s += `<g class="wf-tag t-${st}"><rect x="${n.x + n.w - tw2 - 6}" y="${n.y - 9}" width="${tw2}" height="18" rx="9"/><text x="${n.x + n.w - tw2 / 2 - 6}" y="${n.y + 4}">${t}</text></g>`; }
    s += close;
  }
  return s + "</g></svg>";
}

const flowsParts = md.split(/\n## /).slice(1).filter((p) => /```mermaid/.test(p));
const flows = [];
for (const p of flowsParts) flows.push(await layoutFlow(p));

// зведення по екранах
const wfFiles = fs.readdirSync(WF).filter((f) => f.endsWith(".html"));
const screenRows = screens.map((s) => {
  const want = [""].concat(["empty", "error", "loading", "success"].filter((k) => s.states[k] && !s.states[k].startsWith("—")));
  const have = want.filter((k) => wfFiles.includes(k ? `${s.base}-${k}.html` : s.file));
  const inFlows = flows.filter((f) => f.nodes.some((n) => n.map && n.map.screen === s.name)).map((f) => f.title.split(":")[0]);
  return { s, want, have, inFlows };
});

const UA = { "": "базова", empty: "порожній", error: "помилка", loading: "завантаження", success: "успіх" };
let body = "";
flows.forEach((f, fi) => {
  const mapped = f.nodes.filter((n) => n.map);
  const cnt = (st) => mapped.filter((n) => n.map.status === st).length;
  const scr = [...new Set(mapped.map((n) => n.map.screen))];
  const data = { nodes: f.nodes.map((n) => ({ id: n.id, kind: n.kind })), edges: f.edges.map((e) => [e.from, e.to]), start: f.order[0] };
  body += `
<section class="flow" id="flow-${fi + 1}" aria-labelledby="flow-${fi + 1}-t">
  <h2 id="flow-${fi + 1}-t"><span class="num">${String(fi + 1).padStart(2, "0")}</span> ${esc(f.title)}</h2>
  ${f.intro ? `<p class="sub">${inline(f.intro)}</p>` : ""}
  <div class="flow-body">
    <div class="diagram" tabindex="0" aria-label="Схема: ${esc(f.title)}">${svgFlow(f, fi)}</div>
    <aside class="panel">
      <div class="card"><h3>Вайрфрейми в цьому flow</h3>
        <p class="mini"><span class="wf-pill t-done">вайрфрейм</span> ${cnt("done")} · <span class="wf-pill t-variant">інший варіант</span> ${cnt("variant")} · <span class="wf-pill t-part">у базовому екрані</span> ${cnt("part")}${cnt("none") ? ` · <span class="wf-pill t-none">немає</span> ${cnt("none")}` : ""}</p>
        <ul class="scr-list">${scr.map((n) => `<li><a href="wireframes/${byName[n].file}">${esc(n)}</a></li>`).join("")}</ul></div>
      ${f.forks.length ? `<div class="card"><h3>Розвилки</h3><ol class="forks">${f.forks.map((x) => `<li><span class="fork-n">${x.n}</span><span>${inline(x.raw)}</span></li>`).join("")}</ol></div>` : ""}
      ${f.states.length ? `<div class="card"><h3>Стани</h3>${f.states.map(([t, v]) => `<p class="st"><span class="st-t">${esc(t)}</span>${inline(v)}</p>`).join("")}</div>` : ""}
      ${f.ends.length ? `<div class="card yes"><h3>Кінці</h3><ul class="ends">${f.ends.map((x) => `<li>${inline(x)}</li>`).join("")}</ul></div>` : ""}
      ${f.notes.length ? `<div class="card"><h3>Перевірка</h3>${f.notes.map((x) => `<p class="mini">${inline(x)}</p>`).join("")}</div>` : ""}
    </aside>
  </div>
  <script type="application/json" class="flow-data">${JSON.stringify(data)}</script>
</section>`;
});

const totalWant = screenRows.reduce((a, r) => a + r.want.length, 0), totalHave = screenRows.reduce((a, r) => a + r.have.length, 0);
const html = `<!doctype html>
<!-- Згенеровано tools/flows/build.mjs з flows.md, sitemap.md і wireframes/. Не правити вручну: змінюй flows.md і перезбирай. -->
<html lang="uk" data-root="">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>User flows — CRM-MMMY</title>
<link rel="stylesheet" href="_nav/nav.css">
<script src="_nav/tree.js" defer></script>
<script src="_nav/nav.js" defer></script>
<style>
* { box-sizing: border-box; }
body { margin: 0; }
main { max-width: none; }
.toc { display: flex; flex-wrap: wrap; }
.toc a { text-decoration: none; }
.hero { margin-bottom: 56px; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; max-width: 1180px; }
.how { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; max-width: 1180px; margin-top: 14px; }
.how .card p { margin: 0; font-size: 15px; }
.table-wrap { overflow-x: auto; max-width: 1180px; }
table { border-collapse: collapse; width: 100%; }
th, td { text-align: left; padding: 10px 14px; vertical-align: top; font-size: 14px; }
.flow { margin-bottom: 96px; scroll-margin-top: 16px; }
.flow h2 { display: flex; align-items: baseline; gap: 14px; font-size: 34px; }
.flow-body { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 24px; align-items: start; }
.diagram { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: auto; max-height: 86vh; }
.panel { display: grid; gap: 14px; position: sticky; top: 16px; }
.panel h3 { font-size: 17px; margin: 0 0 10px; }
.panel .card p, .panel .card li { font-size: 14px; color: var(--text); }
.mini { font-size: 13px !important; line-height: 1.6; margin: 0 0 8px; }
.scr-list { margin: 8px 0 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 6px; }
.scr-list a { display: inline-block; font-size: 13px; padding: 3px 10px; border: 1px solid var(--border); border-radius: 6px; text-decoration: none; }
.forks, .ends { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
.forks li { display: grid; grid-template-columns: 26px 1fr; gap: 8px; }
.fork-n { width: 22px; height: 22px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 11px; font-weight: 700; display: grid; place-items: center; }
.st { margin: 0 0 10px; }
.st-t { display: block; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--accent); }
.wf-pill { display: inline-block; font-size: 11px; font-weight: 600; padding: 1px 8px; border-radius: 999px; border: 1px solid var(--border); }
.t-done { background: var(--lime); border-color: #8fd860; }
.t-variant { background: #fff4d6; border-color: #f0cc72; }
.t-part { background: #fff; border: 1px dashed #8a9ab3; }
.t-none { background: #f1f3f7; color: #8a9ab3; }
body.repo-nav-hidden .stats, body.repo-nav-hidden .how, body.repo-nav-hidden .table-wrap { max-width: none; }
@media (max-width: 1100px) { .flow-body { grid-template-columns: 1fr; } .panel { position: static; } }

/* ---------- схема ---------- */
.flow-svg { display: block; font-family: "Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.edge-line { fill: none; stroke: #5c708e; stroke-width: 1.5; stroke-linejoin: miter; transition: stroke .15s, stroke-width .15s; }
.edge-hit { fill: none; stroke: transparent; stroke-width: 14; cursor: pointer; }
.edge-label { display: inline-block; font-size: 11px; font-weight: 600; color: #5c708e; background: #fff; border: 1px solid #e2e6ee; border-radius: 6px; padding: 2px 8px; white-space: nowrap; }
.nl { height: 100%; display: flex; align-items: center; font-size: 13px; line-height: 18px; color: #2f3646; }
.nl-q { justify-content: center; text-align: center; font-weight: 500; }
.nl-ok, .nl-ref { justify-content: center; text-align: center; font-weight: 600; }
.nl-screen { font-weight: 600; }
.fork circle { fill: #284b9b; }
.fork text { fill: #fff; font-size: 11px; font-weight: 700; text-anchor: middle; }
.wf-tag rect { stroke-width: 1; }
.wf-tag text { font-size: 10px; font-weight: 700; text-anchor: middle; fill: #2f3646; }
.wf-tag.t-done rect { fill: #b4fb83; stroke: #8fd860; }
.wf-tag.t-variant rect { fill: #fff4d6; stroke: #f0cc72; }
.wf-tag.t-part rect { fill: #fff; stroke: #8a9ab3; stroke-dasharray: 3 2; }
.wf-tag.t-none rect { fill: #f1f3f7; stroke: #c9d1de; }
a.node { cursor: pointer; }
a.node:hover rect, a.node:hover polygon, a.node:focus rect { stroke-width: 2.6; }
.node, .edge { transition: opacity .15s, filter .15s; }
.flow-svg.focus .node:not(.on), .flow-svg.focus .edge:not(.on) { opacity: .16; filter: grayscale(1); }
.flow-svg.focus .edge.on .edge-line { stroke: #284b9b; stroke-width: 2.6; }
.flow-svg.focus .node.on rect, .flow-svg.focus .node.on polygon { stroke-width: 2.4; }

/* ---------- міні-прев'ю вайрфрейму ---------- */
.preview { position: fixed; z-index: 2000; width: 348px; background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 12px; text-decoration: none; color: var(--text); display: none; box-shadow: 0 18px 48px rgba(33, 37, 47, .18); }
.preview.show { display: block; }
.preview .pv-head { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; margin-bottom: 8px; }
.preview .pv-title { font-weight: 700; font-size: 14px; }
.preview .pv-note { font-size: 12px; color: var(--muted); margin: 6px 0 0; }
.preview .pv-frame { width: 322px; height: 202px; overflow: hidden; border: 1px solid var(--border); border-radius: 8px; background: #f2f2f2; position: relative; }
.preview iframe { width: 1560px; height: 980px; border: 0; transform-origin: 0 0; transform: scale(.25) translate(-248px, -8px); pointer-events: none; }
.preview .pv-go { display: inline-block; margin-top: 8px; font-size: 13px; font-weight: 700; color: var(--accent); }
@media (prefers-reduced-motion: reduce) { .node, .edge, .edge-line { transition: none; } }
</style>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="_nav/theme.css">
</head>
<body>
<main>
<header class="hero">
  <div class="eyebrow">CRM-MMMY · Структура · User flows</div>
  <h1>Усі шляхи автора — з екранами, які вже намальовані</h1>
  <p class="lead">${flows.length} flows з <a href="https://github.com/natocheiev/crm-mmmy/blob/main/flows.md" target="_blank" rel="noopener">flows.md</a> у тому ж вигляді, що у Figma: лінії з прямими кутами, пронумеровані розвилки і пояснення поруч. Наведи на вузол-екран — побачиш міні-екран з <a href="wireframes/board.html">вайрфреймів</a>, клікни — відкриєш його.</p>
  <nav class="toc" aria-label="Flows">${flows.map((f, i) => `<a href="#flow-${i + 1}">${esc(f.title.split(":")[0])}</a>`).join("")}</nav>
  <div class="stats">
    <div class="card"><div class="k">Flows</div><div class="big">${flows.length}</div><p>${flows.map((f) => esc(f.title.split(":")[0])).join(", ")}</p></div>
    <div class="card"><div class="k">Екранів у sitemap.md</div><div class="big">${screens.length}</div><p>${screenRows.filter((r) => r.have.includes("")).length} з вайрфреймом${screenRows.some((r) => !r.have.includes("")) ? ", без: " + esc(screenRows.filter((r) => !r.have.includes("")).map((r) => r.s.name).join(", ")) : ""}</p></div>
    <div class="card yes"><div class="k">Сторінок вайрфреймів</div><div class="big">${totalHave}/${totalWant}</div><p>базові сторінки і стани з колонки «Стани»</p></div>
  </div>
  <div class="how">
    <div class="card"><div class="k">Наведи на вузол чи лінію</div><p>Підсвітиться один шлях: як людина сюди дійшла і найкоротший шлях до кінця. Решта схеми стане сірою.</p></div>
    <div class="card"><div class="k">Мітки на вузлах</div><p><span class="wf-pill t-done">вайрфрейм</span> — є своя сторінка; <span class="wf-pill t-variant">інший варіант</span> — сторінка стану показує сусідній варіант; <span class="wf-pill t-part">у базовому екрані</span> — стан без окремої сторінки.</p></div>
  </div>
</header>

<section aria-labelledby="scr-t">
  <h2 id="scr-t"><span class="num">00</span> Екрани і вайрфрейми</h2>
  <p class="sub">Що вже пропрацьовано: базова сторінка і стани з колонки «Стани» в sitemap.md.</p>
  <div class="table-wrap"><table>
    <thead><tr><th>Група</th><th>Екран</th><th>Сторінки</th><th>У flows</th></tr></thead>
    <tbody>${screenRows.map((r) => `<tr><td>${esc(r.s.group)}</td><td><a href="wireframes/${r.s.file}">${esc(r.s.name)}</a></td><td>${r.want.map((k) => `<a class="wf-pill ${r.have.includes(k) ? "t-done" : "t-none"}" href="wireframes/${k ? r.s.base + "-" + k + ".html" : r.s.file}">${UA[k]}</a>`).join(" ")}</td><td>${esc(r.inFlows.join(", ") || "—")}</td></tr>`).join("")}</tbody>
  </table></div>
</section>
${body}
<footer>Згенеровано з <a href="https://github.com/natocheiev/crm-mmmy/blob/main/flows.md">flows.md</a>, <a href="https://github.com/natocheiev/crm-mmmy/blob/main/sitemap.md">sitemap.md</a> і теки wireframes/ скриптом tools/flows/build.mjs.</footer>
</main>

<a class="preview" id="preview" href="#" aria-hidden="true" tabindex="-1">
  <div class="pv-head"><span class="pv-title"></span><span class="wf-pill pv-pill"></span></div>
  <div class="pv-frame"><iframe title="Міні-прев'ю вайрфрейму" loading="lazy" tabindex="-1"></iframe></div>
  <p class="pv-note"></p>
  <span class="pv-go">Відкрити сторінку →</span>
</a>

<script>
(function () {
  // ---------- один шлях: старт → вузол → найближчий кінець ----------
  document.querySelectorAll(".flow").forEach(function (sec) {
    var data = JSON.parse(sec.querySelector(".flow-data").textContent);
    var svg = sec.querySelector(".flow-svg");
    var out = {}, inn = {};
    data.edges.forEach(function (e, i) { (out[e[0]] = out[e[0]] || []).push([e[1], i]); (inn[e[1]] = inn[e[1]] || []).push([e[0], i]); });
    var kind = {}; data.nodes.forEach(function (n) { kind[n.id] = n.kind; });
    function bfs(from, isGoal) {
      var prev = {}, q = [from], seen = {}; seen[from] = 1;
      while (q.length) { var u = q.shift(); if (isGoal(u)) { var p = { nodes: [u], edges: [] }; while (prev[u]) { p.edges.push(prev[u][1]); u = prev[u][0]; p.nodes.push(u); } return p; }
        (out[u] || []).forEach(function (t) { if (!seen[t[0]]) { seen[t[0]] = 1; prev[t[0]] = [u, t[1]]; q.push(t[0]); } }); }
      return { nodes: [from], edges: [] };
    }
    function show(nodesOn, edgesOn) {
      svg.classList.add("focus");
      svg.querySelectorAll(".node").forEach(function (el) { el.classList.toggle("on", !!nodesOn[el.dataset.id]); });
      svg.querySelectorAll(".edge").forEach(function (el) { el.classList.toggle("on", !!edgesOn[el.dataset.e]); });
    }
    function pathThrough(a, b, edgeIdx) {
      var head = bfs(data.start, function (u) { return u === a; });
      var tail = bfs(b, function (u) { return kind[u] === "ok" || kind[u] === "ref" || !(out[u] || []).length; });
      var n = {}, e = {}; head.nodes.concat(tail.nodes).forEach(function (x) { n[x] = 1; }); head.edges.concat(tail.edges).forEach(function (x) { e[x] = 1; });
      if (edgeIdx != null) e[edgeIdx] = 1; n[a] = 1; n[b] = 1; show(n, e);
    }
    svg.querySelectorAll(".node").forEach(function (el) {
      el.addEventListener("mouseenter", function () { pathThrough(el.dataset.id, el.dataset.id, null); });
      el.addEventListener("focus", function () { pathThrough(el.dataset.id, el.dataset.id, null); });
    });
    svg.querySelectorAll(".edge").forEach(function (el) {
      el.addEventListener("mouseenter", function () { pathThrough(el.dataset.from, el.dataset.to, el.dataset.e); });
    });
    svg.addEventListener("mouseleave", function () { svg.classList.remove("focus"); });
  });

  // ---------- міні-прев'ю вайрфрейму над вузлом-екраном ----------
  var pv = document.getElementById("preview"), frame = pv.querySelector("iframe"), hideT = null;
  var LABEL = { done: "вайрфрейм", variant: "інший варіант", part: "у базовому екрані" };
  function place(el) {
    var r = el.getBoundingClientRect(), w = 348, h = pv.offsetHeight || 300;
    var x = r.right + 12; if (x + w > innerWidth - 8) x = r.left - w - 12; if (x < 8) x = Math.max(8, Math.min(innerWidth - w - 8, r.left));
    var y = Math.min(Math.max(8, r.top - 20), innerHeight - h - 8);
    pv.style.left = x + "px"; pv.style.top = y + "px";
  }
  function open(el) {
    clearTimeout(hideT);
    var page = el.getAttribute("data-page");
    pv.href = page; pv.querySelector(".pv-title").textContent = el.dataset.screen + " · " + el.dataset.state;
    var pill = pv.querySelector(".pv-pill"); pill.textContent = LABEL[el.dataset.status] || ""; pill.className = "wf-pill pv-pill t-" + el.dataset.status;
    pv.querySelector(".pv-note").textContent = el.dataset.note;
    if (frame.getAttribute("src") !== page) frame.setAttribute("src", page);
    pv.classList.add("show"); place(el);
  }
  function hideSoon() { clearTimeout(hideT); hideT = setTimeout(function () { pv.classList.remove("show"); }, 220); }
  document.querySelectorAll("a.node[data-page]").forEach(function (el) {
    el.addEventListener("mouseenter", function () { open(el); });
    el.addEventListener("mouseleave", hideSoon);
    el.addEventListener("focus", function () { open(el); });
    el.addEventListener("blur", hideSoon);
  });
  pv.addEventListener("mouseenter", function () { clearTimeout(hideT); });
  pv.addEventListener("mouseleave", hideSoon);
  document.querySelectorAll(".diagram").forEach(function (d) { d.addEventListener("scroll", function () { pv.classList.remove("show"); }); });
  addEventListener("scroll", function () { pv.classList.remove("show"); }, { passive: true });
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, "user-flows.html"), html);
const st = {}; flows.forEach((f) => f.nodes.forEach((n) => { if (n.map) st[n.map.status] = (st[n.map.status] || 0) + 1; }));
console.log("user-flows.html:", flows.length, "flows,", flows.reduce((a, f) => a + f.nodes.length, 0), "nodes; statuses", JSON.stringify(st), "; wireframe pages", totalHave + "/" + totalWant);
