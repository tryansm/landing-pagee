const WHATSAPP_NUMBER = "62000000";

const HOURS = {
  weekday: { open: 9, close: 20 },
  weekend: { open: 8, close: 21 },
};

const MENU = [
  { id: 1, category: "Nasi", name: "Nasi liwet teri", desc: "Liwet pandan wangi, teri medan, daun salam.", price: 22000 },
  { id: 2, category: "Nasi", name: "Nasi tutug oncom", desc: "Nasi diaduk oncom bakar bumbu kencur.", price: 20000 },
  { id: 3, category: "Lauk", name: "Ayam goreng kampung", desc: "Diungkep bumbu kuning, digoreng renyah.", price: 28000 },
  { id: 4, category: "Lauk", name: "Gurame bakar", desc: "Bumbu kecap dan sambal dadak.", price: 48000 },
  { id: 5, category: "Lauk", name: "Tahu tempe goreng", desc: "Seporsi isi enam potong.", price: 10000 },
  { id: 6, category: "Sambal & lalap", name: "Sambal dadak", desc: "Cabai rawit, tomat, terasi, diulek langsung.", price: 6000 },
  { id: 7, category: "Sambal & lalap", name: "Lalapan komplit", desc: "Timun, leunca, kemangi, kol, petai.", price: 8000 },
  { id: 8, category: "Minuman", name: "Es goyobod", desc: "Sagu, kelapa muda, sirup gula aren.", price: 14000 },
  { id: 9, category: "Minuman", name: "Bandrek hangat", desc: "Jahe, gula aren, serai, kayu manis.", price: 10000 },
  { id: 10, category: "Minuman", name: "Es cendol dawet", desc: "Cendol hijau, santan, gula merah.", price: 13000 },
];

const ALL = "Semua";
const categories = [ALL, ...new Set(MENU.map((item) => item.category))];
const cart = {};
let activeCategory = ALL;

const $ = (id) => document.getElementById(id);
const tabsEl = $("tabs");
const gridEl = $("menuGrid");
const cartListEl = $("cartList");
const totalEl = $("total");

const formatRupiah = (n) => "Rp" + n.toLocaleString("id-ID");
const getCartItems = () => MENU.filter((item) => cart[item.id]);
const getTotal = () => getCartItems().reduce((sum, item) => sum + cart[item.id] * item.price, 0);

function renderTabs() {
  tabsEl.innerHTML = categories
    .map((c) => `<button class="tab" role="tab" aria-selected="${c === activeCategory}" data-category="${c}">${c}</button>`)
    .join("");
}

function renderMenu() {
  const items = MENU.filter((m) => activeCategory === ALL || m.category === activeCategory);

  gridEl.innerHTML = items
    .map((m) => `
          <article class="item">
            <h3>${m.name}</h3>
            <p>${m.desc}</p>
            <div class="item-row">
              <span class="price">${formatRupiah(m.price)}</span>
              <div class="qty">
                <button type="button" data-id="${m.id}" data-delta="-1" aria-label="Kurangi ${m.name}">−</button>
                <span>${cart[m.id] || 0}</span>
                <button type="button" data-id="${m.id}" data-delta="1" aria-label="Tambah ${m.name}">+</button>
              </div>
            </div>
          </article>`)
    .join("");
}

function renderCart() {
  const items = getCartItems();

  cartListEl.innerHTML = items.length
    ? items.map((m) => `<li><span>${cart[m.id]}× ${m.name}</span><span>${formatRupiah(cart[m.id] * m.price)}</span></li>`).join("")
    : `<li class="empty">Belum ada menu dipilih. Tambahkan dari daftar menu.</li>`;

  totalEl.textContent = formatRupiah(getTotal());
}

function renderHoursStatus() {
  const now = new Date();
  const day = now.getDay();                                  // 0 = Minggu
  const hour = now.getHours() + now.getMinutes() / 60;
  const { open, close } = day > 0 && day < 6 ? HOURS.weekday : HOURS.weekend;
  const isOpen = hour >= open && hour < close;

  const el = $("hoursStatus");
  el.textContent = isOpen ? "Buka sekarang" : "Tutup. Pesanan diproses saat buka.";
  el.style.color = isOpen ? "var(--leaf-light)" : "var(--sambal)";
}

function changeQuantity(id, delta) {
  cart[id] = Math.max(0, (cart[id] || 0) + delta);
  renderMenu();
  renderCart();
}

function sendOrder() {
  const items = getCartItems();
  const nama = $("nama").value.trim();
  const alamat = $("alamat").value.trim();

  if (!items.length) return alert("Pilih minimal satu menu dulu.");
  if (!nama || !alamat) return alert("Isi nama dan alamat pengantaran dulu.");

  const lines = items.map((m) => `- ${cart[m.id]}× ${m.name}`).join("\n");
  const message =
    `Halo Saung Asih, saya ${nama}.\n` +
    `Pesanan:\n${lines}\n` +
    `Total: ${formatRupiah(getTotal())}\n` +
    `Alamat: ${alamat}`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

tabsEl.addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  activeCategory = tab.dataset.category;
  renderTabs();
  renderMenu();
});

gridEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (btn) changeQuantity(btn.dataset.id, Number(btn.dataset.delta));
});

$("sendBtn").addEventListener("click", sendOrder);

renderTabs();
renderMenu();
renderCart();
renderHoursStatus();
