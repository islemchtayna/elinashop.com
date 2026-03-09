const SETTINGS = {
  scriptURL:
    "https://script.google.com/macros/s/AKfycbxKKRWoTe8bbVa_bC3TYbzcIlZCj9sBCiGTlaivVvZp4NrdStuWbCY7InVwE6yXpWCq7Q/exec",
  fallbackShipping: { office: 600, home: 800 },
};

// تحميل الإعدادات من الذاكرة أو قيم افتراضية
let remoteData = JSON.parse(localStorage.getItem("store_config")) || {
  products: {
    p1: { name: "المنتج 1", price: 3500 },
    p2: { name: "المنتج 2", price: 4500 },
  },
  shipping: {},
  pixelId: "",
};

let isFormSubmitted = false;
let lastSentPhone = "";
const getEl = (id) => document.getElementById(id);

function initApp() {
  renderWilayas();
  updateUI();
  fetchUpdates(); // تحديث صامت في الخلفية
}

async function fetchUpdates() {
  try {
    const response = await fetch(`${SETTINGS.scriptURL}?t=${Date.now()}`);
    if (response.ok) {
      const newData = await response.json();
      remoteData = newData;
      localStorage.setItem("store_config", JSON.stringify(newData));
      updateUI();
      if (newData.pixelId) insertFacebookPixel(newData.pixelId);
    }
  } catch (e) {
    console.warn("العمل بالبيانات المخزنة...");
  }
}

function renderWilayas() {
  const wSelect = getEl("wilaya");
  if (!wSelect) return;
  wSelect.innerHTML = '<option value="">إختر الولاية</option>';
  Object.keys(LOCAL_LOCATIONS)
    .sort()
    .forEach((w) => wSelect.add(new Option(w, w)));
}

window.populateCommunes = function () {
  const wAr = getEl("wilaya").value;
  if (getEl("wilaya_fr"))
    getEl("wilaya_fr").value = LOCAL_LOCATIONS[wAr]?.name_fr || "";
  const cSelect = getEl("commune");
  if (!cSelect) return;
  cSelect.innerHTML = '<option value="">إختر البلدية</option>';
  if (LOCAL_LOCATIONS[wAr]) {
    LOCAL_LOCATIONS[wAr].communes
      .sort((a, b) => a.ar.localeCompare(b.ar, "ar"))
      .forEach((c) => cSelect.add(new Option(c.ar, c.fr)));
  }
  window.updateTotal();
};

function updateUI() {
  document.querySelectorAll('input[name="product-choice"]').forEach((input) => {
    const pData = remoteData.products?.[input.value];
    if (pData) {
      if (getEl(`${input.value}-name`))
        getEl(`${input.value}-name`).textContent = pData.name;
      if (getEl(`${input.value}-price`))
        getEl(`${input.value}-price`).textContent = pData.price + " دج";
    }
  });
  window.updateTotal();
}

window.updateTotal = function () {
  const wAr = getEl("wilaya")?.value;
  const delType = document.querySelector(
    'input[name="delivery"]:checked',
  )?.value;
  const pId =
    document.querySelector('input[name="product-choice"]:checked')?.value ||
    "p1";
  const product = remoteData.products?.[pId] || { name: "منتج", price: 0 };
  const locCode = LOCAL_LOCATIONS[wAr]?.code;
  const shipping = remoteData.shipping?.[locCode] || SETTINGS.fallbackShipping;
  const shipCost =
    delType === "home" ? Number(shipping.home) : Number(shipping.office);
  const total = Number(product.price) + shipCost;

  if (getEl("product-price"))
    getEl("product-price").textContent = product.price + " دج";
  if (getEl("shipping-price"))
    getEl("shipping-price").textContent = shipCost + " دج";
  if (getEl("total-price")) getEl("total-price").textContent = total + " دج";
  return { total, productName: product.name };
};

function sendAbandonedOrderData() {
  const phone = getEl("phone")?.value || "";
  if (
    isFormSubmitted ||
    !/^0(5|6|7)\d{8}$/.test(phone) ||
    phone === lastSentPhone
  )
    return;
  lastSentPhone = phone;
  const summary = window.updateTotal();
  const formData = new FormData();
  formData.append("phone", phone);
  formData.append("full-name", getEl("full-name")?.value || "زبون متردد");
  formData.append("total_val", summary.total + " دج");
  formData.append("is_abandoned", "true");
  fetch(SETTINGS.scriptURL + "?is_abandoned=true", {
    method: "POST",
    body: formData,
    mode: "no-cors",
    keepalive: true,
  });
}

document.forms["google-sheet"]?.addEventListener("submit", async (e) => {
  e.preventDefault();
  isFormSubmitted = true;
  const btn = getEl("submit-btn");
  btn.disabled = true;
  btn.textContent = "جاري الحجز...";
  const summary = window.updateTotal();
  const formData = new FormData(e.target);
  formData.append("total_val", summary.total + " دج");
  try {
    await fetch(SETTINGS.scriptURL, {
      method: "POST",
      body: formData,
      mode: "no-cors",
    });
    window.showModal("successModal");
    e.target.reset();
  } catch (err) {
    isFormSubmitted = false;
    window.showModal("errorModal");
  } finally {
    btn.disabled = false;
    btn.textContent = "إرسال الطلب";
  }
});

getEl("phone")?.addEventListener("blur", sendAbandonedOrderData);
document.addEventListener("DOMContentLoaded", initApp);
