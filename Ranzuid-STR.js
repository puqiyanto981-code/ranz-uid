// ====== PENGATURAN ======
const WA_NUMBER = "6283134178809";
const ADMIN_PIN = "1234"; // ganti PIN ini
const STORE_KEY = "jualid.items.v1";
const DEFAULT = [
  { id: "19199999996", harga: "30K" },
  { id: "1920000001", harga: "50K" },
  { id: "1920000002", harga: "30K" }
];
// ========================

const $ = (s) => document.querySelector(s);
let items = load();

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) return a; }
  } catch (e) {}
  return DEFAULT.map((x) => ({ ...x }));
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(items)); } catch (e) {}
}
function waLink(it) {
  const t = `Assalamu'alaikum bang, saya mau membeli ID ${it.id} dengan harga ${it.harga.toLowerCase()}`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;
}
function toK(str) {
  let n = parseFloat(String(str).replace(/[^\d.,]/g, "").replace(",", "."));
  if (isNaN(n) || n <= 0) return null;
  if (/jt|juta/i.test(str)) n *= 1000;
  else if (!/k/i.test(str) && n >= 1000) n /= 1000;
  return `${Math.round(n * 100) / 100}K`;
}
const num = (h) => parseFloat(h) || 0;

function render() {
  const q = $("#search").value.trim();
  const list = $("#list");
  list.textContent = "";
  const shown = items.filter((i) => i.id.includes(q));
  shown.forEach((it) => {
    const c = document.createElement("article");
    c.className = "card glass";
    const id = document.createElement("div");
    id.className = "id";
    id.textContent = it.id;
    const row = document.createElement("div");
    row.className = "row";
    const p = document.createElement("span");
    p.className = "price";
    p.textContent = it.harga;
    const a = document.createElement("a");
    a.className = "btn sm";
    a.textContent = "BELI";
    a.href = waLink(it);
    a.target = "_blank";
    a.rel = "noopener";
    row.append(p, a);
    c.append(id, row);
    list.append(c);
  });
  $("#empty").hidden = shown.length > 0;

  $("#statCount").textContent = items.length;
  $("#statMin").textContent = items.length ? items.reduce((m, i) => (num(i.harga) < num(m) ? i.harga : m), items[0].harga) : "-";
  const f = items[0];
  $("#featId").textContent = f ? f.id : "Segera hadir";
  $("#featPrice").textContent = f ? f.harga : "-";
  $("#featBuy").href = f ? waLink(f) : "#";
  $("#featBuy").style.display = f ? "" : "none";
}

// ====== PANEL TERSEMBUNYI ======
const dlg = $("#admin");
function openAdmin() {
  $("#pinForm").hidden = false;
  $("#panel").hidden = true;
  $("#pin").value = "";
  $("#pinMsg").textContent = "";
  dlg.showModal();
  $("#pin").focus();
}
let taps = 0, tapTimer;
$("#logo").addEventListener("click", () => {
  taps++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => (taps = 0), 1800);
  if (taps >= 5) { taps = 0; openAdmin(); }
});
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") { e.preventDefault(); openAdmin(); }
});
$("#close").addEventListener("click", () => dlg.close());

$("#pinForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if ($("#pin").value === ADMIN_PIN) {
    $("#pinForm").hidden = true;
    $("#panel").hidden = false;
    renderAdmin();
  } else {
    $("#pinMsg").textContent = "PIN salah. Coba lagi.";
  }
});

function renderAdmin() {
  const ul = $("#adminList");
  ul.textContent = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "Belum ada ID. Tambahkan di atas.";
    ul.append(li);
    return;
  }
  items.forEach((it, idx) => {
    const li = document.createElement("li");
    const t = document.createElement("span");
    t.className = "mono";
    t.textContent = `${it.id} | ${it.harga}`;
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = "Hapus";
    b.addEventListener("click", () => {
      if (!confirm(`Hapus ID ${it.id}?`)) return;
      items.splice(idx, 1);
      save(); render(); renderAdmin();
    });
    li.append(t, b);
    ul.append(li);
  });
}

$("#addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = $("#addMsg");
  msg.className = "msg";
  const id = $("#newId").value.trim();
  const harga = toK($("#newPrice").value);
  if (!/^\d{4,}$/.test(id)) { msg.textContent = "ID harus berupa angka, minimal 4 digit."; return; }
  if (!harga) { msg.textContent = "Harga tidak valid. Contoh: 30k"; return; }
  if (items.some((i) => i.id === id)) { msg.textContent = "ID itu sudah ada di daftar."; return; }
  items.unshift({ id, harga });
  save(); render(); renderAdmin();
  e.target.reset();
  msg.className = "msg ok";
  msg.textContent = `ID ${id} ditambahkan.`;
});

$("#copy").addEventListener("click", async () => {
  const msg = $("#addMsg");
  try {
    await navigator.clipboard.writeText(JSON.stringify(items, null, 2));
    msg.className = "msg ok";
    msg.textContent = "Data tersalin. Tempel ke DEFAULT di Ranzuid-STR.js.";
  } catch (e) {
    msg.className = "msg";
    msg.textContent = "Gagal menyalin. Salin manual dari daftar di atas.";
  }
});
$("#reset").addEventListener("click", () => {
  if (!confirm("Kembalikan daftar ke data awal di Ranzuid-STR.js?")) return;
  try { localStorage.removeItem(STORE_KEY); } catch (e) {}
  items = DEFAULT.map((x) => ({ ...x }));
  render(); renderAdmin();
});

$("#search").addEventListener("input", render);
render();
