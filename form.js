const SETTINGS = {
  scriptURL:
    "https://script.google.com/macros/s/AKfycbxiG0mAPQoaKJmrHaq5WPD9lXh1ZxmXUN72dVE1dlBJJb1BaS9mTREihnizFv-z15vksQ/exec",
  fallbackShipping: { office: 600, home: 800 },
};

let locations = {};
let remoteData = { shipping: {}, products: {}, locations: [] };

const getEl = (id) => document.getElementById(id);

// دالة سحرية لزرع كود الفيسبوك في الصفحة ديناميكياً
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
  console.log("✅ Facebook Pixel Active: " + id);
}

// تهيئة البيانات عند فتح الصفحة
async function initApp() {
  try {
    const response = await fetch(`${SETTINGS.scriptURL}?t=${Date.now()}`);
    if (!response.ok) throw new Error("Network response was not ok");

    remoteData = await response.json();

    // التحقق من وصول البيانات بشكل صحيح
    if (!remoteData || typeof remoteData !== "object") {
      throw new Error("بيانات السيرفر غير صالحة");
    }

    // 🔥 زرع كود البيكسل تلقائياً إذا وجد الرقم في غوغل شيت
    if (remoteData.pixelId) {
      insertFacebookPixel(remoteData.pixelId);
    }

    // 1. تحديث المنتجات (بأمان) بناءً على العناصر الموجودة في الصفحة
    const productInputs = document.querySelectorAll(
      'input[name="product-choice"]',
    );

    productInputs.forEach((inputEl) => {
      const pId = inputEl.value;
      const pData = remoteData.products ? remoteData.products[pId] : null;

      const nameEl = getEl(`${pId}-name`);
      const priceEl = getEl(`${pId}-price`);
      const containerEl = getEl(`${pId}-container`);

      if (pData && pData.name && pData.name.trim() !== "") {
        if (nameEl) nameEl.textContent = pData.name;
        if (priceEl) priceEl.textContent = pData.price + " دج";
        if (containerEl) containerEl.style.display = "flex";
        inputEl.disabled = false;
      } else {
        if (containerEl) containerEl.style.display = "none";
        inputEl.disabled = true;

        // إذا كان المنتج المحذوف محدداً مسبقاً، نزيل التحديد
        if (inputEl.checked) {
          inputEl.checked = false;
        }
      }
    });

    // تحديد أول منتج متاح إذا لم يكن هناك منتج محدد
    const checkedProduct = document.querySelector(
      'input[name="product-choice"]:checked',
    );
    if (!checkedProduct) {
      const firstAvailable = document.querySelector(
        'input[name="product-choice"]:not(:disabled)',
      );
      if (firstAvailable) {
        firstAvailable.checked = true;
      }
    }

    // 2. معالجة الولايات (بأمان)
    if (remoteData.locations && Array.isArray(remoteData.locations)) {
      locations = {}; // إعادة تصفير الولايات
      remoteData.locations.forEach((item) => {
        if (item && item.wilaya_name) {
          const wAr = item.wilaya_name.trim(); // Arabic name
          const wFr = item.wilaya_name_ascii
            ? item.wilaya_name_ascii.trim()
            : item.wilaya_name_fr
              ? item.wilaya_name_fr.trim()
              : wAr; // Fallback to French or ASCII if available, else keep Arabic
          if (!locations[wAr]) {
            locations[wAr] = {
              name_fr: wFr,
              code: (item.wilaya_code || "00").toString().padStart(2, "0"),
              communes: [],
            };
          }
          if (item.commune_name) {
            const cAr = item.commune_name.trim();
            const cFr = item.commune_name_ascii
              ? item.commune_name_ascii.trim()
              : item.commune_name_fr
                ? item.commune_name_fr.trim()
                : cAr;
            if (!locations[wAr].communes.some((c) => c.ar === cAr)) {
              locations[wAr].communes.push({ ar: cAr, fr: cFr });
            }
          }
        }
      });
    }

    renderWilayas();
    window.updateTotal();
  } catch (error) {
    console.error("⚠️ خطأ في الاتصال بالسيرفر:", error);
    // إظهار رسالة بسيطة للمستخدم إذا فشل التحميل
    const wSelect = getEl("wilaya");
    if (wSelect)
      wSelect.innerHTML = '<option value="">خطأ في تحميل البيانات...</option>';
  }
}
// عرض الولايات في القائمة
function renderWilayas() {
  const wSelect = getEl("wilaya");
  if (!wSelect) return;
  wSelect.innerHTML = '<option value="">إختر الولاية</option>';
  Object.keys(locations)
    .sort()
    .forEach((w) => wSelect.add(new Option(w, w)));
}

// تحديث البلديات واسم الولاية بالفرنسية
window.populateCommunes = function () {
  const wAr = getEl("wilaya").value;
  const cSelect = getEl("commune");
  const wFrInput = getEl("wilaya_fr");

  if (wFrInput) {
    wFrInput.value = wAr && locations[wAr] ? locations[wAr].name_fr : "";
  }

  if (!cSelect) return;
  cSelect.innerHTML = '<option value="">إختر البلدية</option>';
  if (wAr && locations[wAr]) {
    locations[wAr].communes
      .sort((a, b) => a.ar.localeCompare(b.ar, "ar"))
      .forEach((c) => cSelect.add(new Option(c.ar, c.fr)));
  }
  window.updateTotal();
};

// Phone validation and dynamic counter
const phoneInput = getEl("phone");
const phoneCounter = getEl("phone-counter");
if (phoneInput && phoneCounter) {
  phoneInput.addEventListener("input", function (e) {
    let val = this.value.replace(/\D/g, ""); // Remove non-digits

    // Ensure it starts with 0
    if (val.length > 0 && val[0] !== "0") {
      val = "0" + val;
    }

    // Ensure second digit is 5, 6, or 7
    if (val.length > 1 && !["5", "6", "7"].includes(val[1])) {
      val = val.substring(0, 1);
    }

    this.value = val.substring(0, 10); // Max 10 chars

    const remaining = 10 - this.value.length;

    if (remaining === 10) {
      phoneCounter.textContent = "باقي 10 أرقام";
      phoneCounter.style.color = "#666";
    } else if (remaining > 0) {
      phoneCounter.textContent = `باقي ${remaining} أرقام`;
      phoneCounter.style.color = "#e67e22"; // Orange warning
    } else {
      // Validate full number
      if (/^0(5|6|7)\d{8}$/.test(this.value)) {
        phoneCounter.textContent = "رقم هاتف صحيح ✓";
        phoneCounter.style.color = "#27ae60"; // Green success
      } else {
        phoneCounter.textContent = "تأكد من صحة الرقم ✗";
        phoneCounter.style.color = "#e74c3c"; // Red error
      }
    }
  });
}

// حساب السعر الإجمالي
window.updateTotal = function () {
  const wAr = getEl("wilaya")?.value;
  const deliveryType = document.querySelector(
    'input[name="delivery"]:checked',
  )?.value;
  const productID =
    document.querySelector('input[name="product-choice"]:checked')?.value ||
    "p1";

  const product = remoteData.products[productID] || {
    name: "المنتج",
    price: 0,
  };
  const wCode = locations[wAr]?.code;
  const shippingPrices =
    remoteData.shipping[wCode] || SETTINGS.fallbackShipping;

  const shippingCost =
    deliveryType === "home"
      ? Number(shippingPrices.home)
      : Number(shippingPrices.office);
  const total = Number(product.price) + shippingCost;

  if (getEl("product-price"))
    getEl("product-price").textContent = product.price + " دج";
  if (getEl("shipping-price"))
    getEl("shipping-price").textContent = shippingCost + " دج";
  if (getEl("total-price")) getEl("total-price").textContent = total + " دج";

  return {
    productName: product.name,
    productPrice: product.price,
    shippingCost,
    total,
  };
};

// إرسال الطلب
document.forms["google-sheet"]?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = getEl("submit-btn");
  const phone = getEl("phone").value;

  if (!/^0(5|6|7)\d{8}$/.test(phone)) {
    alert("يرجى إدخال رقم هاتف صحيح");
    return;
  }

  btn.disabled = true;
  btn.textContent = "جاري إرسال طلبك...";

  const summary = window.updateTotal();
  const wilayaName = getEl("wilaya").value;

  const formData = new FormData();
  formData.append("full-name", getEl("full-name").value);
  formData.append("phone", phone);
  formData.append("wilaya", getEl("wilaya_fr").value || wilayaName); // Send French if available, fallback to Arabic
  formData.append("wilaya_ar", wilayaName); // Optionally send Arabic
  const communeSel = getEl("commune");
  const communeAr = communeSel.options[communeSel.selectedIndex]?.text || "";

  formData.append("wilaya_code", locations[wilayaName]?.code || "");
  formData.append("commune", getEl("commune").value); // Sends French/ASCII
  formData.append("commune_ar", communeAr); // Optionally send Arabic
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

    // داخل دالة Submit بعد الإرسال الناجح لغوغل شيت
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
    window.showModal("offerErrorModal");
  } finally {
    btn.disabled = false;
    btn.textContent = "إرسال الطلب";
  }
});

window.showModal = (id) => (getEl(id).style.display = "flex");
window.closeModal = (id) => (getEl(id).style.display = "none");

document.addEventListener("DOMContentLoaded", initApp);
