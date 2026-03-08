const SETTINGS = {
  scriptURL:
    "https://script.google.com/macros/s/AKfycbzz1mwpnR_YR6Oh4Bs6DRQt0oEtaAodOVM91kxCcJmI1M-bMxNpS9sZNGbjMIFoQzyCmQ/exec",
  fallbackShipping: { office: 600, home: 800 },
};

let locations = {};
let remoteData = { shipping: {}, products: {}, locations: [] };
let isFormSubmitted = false;
let lastSentPhone = ""; // متغير جديد لتتبع آخر رقم تم إرساله بنجاح

const getEl = (id) => document.getElementById(id);

// --- 1. نظام الفيسبوك بيكسل ---
function insertFacebookPixel(id) {
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js",
  );
  fbq("init", id);
  fbq("track", "PageView");
}

// --- 2. تهيئة البيانات ---
async function initApp() {
  try {
    const response = await fetch(`${SETTINGS.scriptURL}?t=${Date.now()}`);
    if (!response.ok) throw new Error("Network response was not ok");

    remoteData = await response.json();
    if (remoteData.pixelId) insertFacebookPixel(remoteData.pixelId);

    document
      .querySelectorAll('input[name="product-choice"]')
      .forEach((inputEl) => {
        const pId = inputEl.value;
        const pData = remoteData.products?.[pId];
        const containerEl = getEl(`${pId}-container`);

        if (pData && pData.name && pData.name.trim() !== "") {
          if (getEl(`${pId}-name`))
            getEl(`${pId}-name`).textContent = pData.name;
          if (getEl(`${pId}-price`))
            getEl(`${pId}-price`).textContent = pData.price + " دج";
          if (containerEl) containerEl.style.display = "flex";
          inputEl.disabled = false;
        } else {
          if (containerEl) containerEl.style.display = "none";
          inputEl.disabled = true;
        }
      });

    if (remoteData.locations && Array.isArray(remoteData.locations)) {
      locations = {};
      remoteData.locations.forEach((item) => {
        const wAr = item.wilaya_name?.trim();
        if (wAr) {
          if (!locations[wAr]) {
            locations[wAr] = {
              name_fr: item.wilaya_name_ascii || item.wilaya_name_fr || wAr,
              code: (item.wilaya_code || "00").toString().padStart(2, "0"),
              communes: [],
            };
          }
          if (item.commune_name) {
            locations[wAr].communes.push({
              ar: item.commune_name.trim(),
              fr: item.commune_name_ascii || item.commune_name,
            });
          }
        }
      });
    }

    renderWilayas();
    window.updateTotal();
  } catch (error) {
    console.error("⚠️ خطأ:", error);
  }
}

function renderWilayas() {
  const wSelect = getEl("wilaya");
  if (!wSelect) return;
  wSelect.innerHTML = '<option value="">إختر الولاية</option>';
  Object.keys(locations)
    .sort()
    .forEach((w) => wSelect.add(new Option(w, w)));
}

window.populateCommunes = function () {
  const wAr = getEl("wilaya").value;
  if (getEl("wilaya_fr"))
    getEl("wilaya_fr").value = locations[wAr]?.name_fr || "";
  const cSelect = getEl("commune");
  if (!cSelect) return;
  cSelect.innerHTML = '<option value="">إختر البلدية</option>';
  if (locations[wAr]) {
    locations[wAr].communes
      .sort((a, b) => a.ar.localeCompare(b.ar, "ar"))
      .forEach((c) => cSelect.add(new Option(c.ar, c.fr)));
  }
  window.updateTotal();
};

// --- 4. التحقق من الهاتف ---
const phoneInput = getEl("phone");
const phoneCounter = getEl("phone-counter");

if (phoneInput) {
  phoneInput.addEventListener("input", function () {
    let val = this.value.replace(/\D/g, "");
    if (val.length > 0 && val[0] !== "0") val = "0" + val;
    if (val.length > 1 && !["5", "6", "7"].includes(val[1]))
      val = val.substring(0, 1);
    this.value = val.substring(0, 10);

    if (phoneCounter) {
      const remaining = 10 - this.value.length;
      phoneCounter.textContent =
        remaining === 0
          ? /^0(5|6|7)\d{8}$/.test(this.value)
            ? "رقم صحيح ✓"
            : "تأكد من الرقم ✗"
          : `باقي ${remaining} أرقام`;
      phoneCounter.style.color =
        remaining === 0
          ? /^0(5|6|7)\d{8}$/.test(this.value)
            ? "#27ae60"
            : "#e74c3c"
          : "#e67e22";
    }
  });

  // ملاحقة الطلب المتروك عند الخروج من الحقل
  phoneInput.addEventListener("blur", function () {
    sendAbandonedOrderData();
  });
}

// --- 5. حساب التكلفة الإجمالية ---
window.updateTotal = function () {
  const wAr = getEl("wilaya")?.value;
  const deliveryType = document.querySelector(
    'input[name="delivery"]:checked',
  )?.value;
  const productID =
    document.querySelector('input[name="product-choice"]:checked')?.value ||
    "p1";

  const product = remoteData.products?.[productID] || {
    name: "المنتج",
    price: 0,
  };
  const shipping =
    remoteData.shipping?.[locations[wAr]?.code] || SETTINGS.fallbackShipping;
  const shipCost =
    deliveryType === "home" ? Number(shipping.home) : Number(shipping.office);
  const total = Number(product.price) + shipCost;

  if (getEl("product-price"))
    getEl("product-price").textContent = product.price + " دج";
  if (getEl("shipping-price"))
    getEl("shipping-price").textContent = shipCost + " دج";
  if (getEl("total-price")) getEl("total-price").textContent = total + " دج";

  return {
    productName: product.name,
    productPrice: product.price,
    shippingCost: shipCost,
    total: total,
  };
};

// --- 6. منطق الطلبات المتروكة (المطور) ---
function sendAbandonedOrderData() {
  const phone = getEl("phone")?.value || "";

  // شروط الإرسال: لم يتم الإرسال النهائي + الرقم صالح + الرقم يختلف عن آخر رقم أرسلناه
  if (
    isFormSubmitted ||
    !/^0(5|6|7)\d{8}$/.test(phone) ||
    phone === lastSentPhone
  ) {
    return;
  }

  lastSentPhone = phone; // تحديث الرقم لمنع التكرار إلا إذا تغير الرقم
  const summary = window.updateTotal();
  const wilayaName = getEl("wilaya")?.value || "";

  const formData = new FormData();
  formData.append("full-name", getEl("full-name")?.value || "زبون متردد");
  formData.append("phone", phone);
  formData.append("wilaya", getEl("wilaya_fr")?.value || wilayaName);
  formData.append("wilaya_code", locations[wilayaName]?.code || "");
  formData.append("commune", getEl("commune")?.value || "");
  formData.append(
    "product_display",
    `${summary.productName} (${summary.productPrice} دج)`,
  );
  formData.append("delivery_price", summary.shippingCost + " دج");
  formData.append("total_val", summary.total + " دج");
  formData.append("is_abandoned", "true");

  fetch(SETTINGS.scriptURL + "?is_abandoned=true", {
    method: "POST",
    body: formData,
    mode: "no-cors",
    keepalive: true,
  });
  console.log("✅ Abandoned Order Tracked: " + phone);
}

// --- 7. إرسال الطلب النهائي ---
document.forms["google-sheet"]?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = getEl("submit-btn");
  const phone = getEl("phone").value;

  if (!/^0(5|6|7)\d{8}$/.test(phone)) return alert("يرجى إدخال رقم هاتف صحيح");

  isFormSubmitted = true;
  btn.disabled = true;
  btn.textContent = "جاري إرسال طلبك...";

  const summary = window.updateTotal();
  const wilayaName = getEl("wilaya").value;

  const formData = new FormData(e.target);
  formData.append("wilaya_code", locations[wilayaName]?.code || "");
  formData.append(
    "product_display",
    `${summary.productName} (${summary.productPrice} دج)`,
  );
  formData.append("delivery_price", summary.shippingCost + " دج");
  formData.append("total_val", summary.total + " دج");

  try {
    await fetch(SETTINGS.scriptURL, {
      method: "POST",
      body: formData,
      mode: "no-cors",
    });

    if (remoteData.pixelId && typeof fbq === "function") {
      fbq("track", "Purchase", {
        value: summary.total,
        currency: "DZD",
        content_name: summary.productName,
      });
    }

    window.showModal("successModal");
    e.target.reset();
    window.updateTotal();
  } catch (err) {
    isFormSubmitted = false;
    window.showModal("offerErrorModal");
  } finally {
    btn.disabled = false;
    btn.textContent = "إرسال الطلب";
  }
});

window.addEventListener("beforeunload", sendAbandonedOrderData);

window.showModal = (id) => {
  if (getEl(id)) getEl(id).style.display = "flex";
};
window.closeModal = (id) => {
  if (getEl(id)) getEl(id).style.display = "none";
};
document.addEventListener("DOMContentLoaded", initApp);
