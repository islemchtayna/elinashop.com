// ==========================================
// 1. الإعدادات العامة (CONFIG)
// ==========================================
const SETTINGS = {
  // رابط الـ Web App الخاص بك من Google Apps Script
  sheetURL:
    "https://script.google.com/macros/s/AKfycbyjjHSUbZujpmZB6yezsu8q804iiK__cCmosEztjjY2zSly2mFp5_CG8i0GXMPw0XzOmQ/exec",
  whatsappNumber: "213696763017",
  // أسعار احتياطية في حال فشل الاتصال بجوجل شيت عند التحميل لأول مرة
  fallbackPrices: {
    16: { office: 400, home: 600 },
    Default: { office: 600, home: 900 },
  },
};

let locations = {}; // لتخزين بيانات الولايات والبلديات من JSON
let remoteShippingPrices = {}; // لتخزين الأسعار القادمة من شيت Settings

// ==========================================
// 2. التحقق الديناميكي من الهاتف (Validation) 🛡️
// ==========================================
const phoneInput = document.getElementById("phone");
const phoneError = document.getElementById("phone-error");

function validatePhone(value) {
  const phoneRegex = /^0(5|6|7)\d{8}$/;

  if (value.length === 0) {
    phoneError.textContent = "";
    phoneInput.style.borderColor = "var(--border-color)";
    return false;
  }

  if (
    !value.startsWith("05") &&
    !value.startsWith("06") &&
    !value.startsWith("07")
  ) {
    phoneError.textContent = "الرجاء ادخال رقم يبدأ بـ 05 أو 06 أو 07";
    phoneInput.style.borderColor = "var(--error-color)";
    return false;
  }

  if (value.length !== 10) {
    phoneError.textContent = "يجب أن يتكون الرقم من 10 أرقام بالضبط";
    phoneInput.style.borderColor = "var(--error-color)";
    return false;
  }

  phoneError.textContent = "";
  phoneInput.style.borderColor = "var(--success-color)";
  return true;
}

phoneInput.addEventListener("input", (e) => {
  if (e.target.value.length > 10) e.target.value = e.target.value.slice(0, 10);
  validatePhone(e.target.value);
});

// ==========================================
// 3. جلب البيانات (JSON & G-Sheets) 🌐
// ==========================================

// جلب أسعار التوصيل من جوجل شيت (دالة doGet)
async function fetchPricesFromSheet() {
  try {
    const response = await fetch(SETTINGS.sheetURL);
    remoteShippingPrices = await response.json();
    console.log("✅ تم تحديث أسعار التوصيل من Google Sheets");
  } catch (e) {
    console.error("⚠️ فشل جلب الأسعار، استخدام القيم الاحتياطية");
    remoteShippingPrices = SETTINGS.fallbackPrices;
  }
}

// جلب الولايات والبلديات من ملف JSON
async function loadLocations() {
  try {
    const response = await fetch("algeria_cities_commune_with_latlng.json");
    const data = await response.json();

    data.forEach((item) => {
      const wilayaAr = item.wilaya_name.trim();
      if (!locations[wilayaAr]) {
        locations[wilayaAr] = {
          fr: item.wilaya_name_ascii,
          code: item.wilaya_code,
          communes: [],
        };
      }
      locations[wilayaAr].communes.push({
        ar: item.commune_name,
        fr: item.commune_name_ascii,
      });
    });

    const wSelect = document.getElementById("wilaya");
    if (wSelect) {
      wSelect.innerHTML = '<option value="">إختر الولاية</option>';
      Object.keys(locations)
        .sort()
        .forEach((w) => wSelect.add(new Option(w, w)));
    }
  } catch (e) {
    console.error("❌ خطأ في تحميل ملف JSON:", e);
  }
}

// ==========================================
// 4. تحديث الواجهة (UI Logic) ✨
// ==========================================

window.populateCommunes = function () {
  const wAr = document.getElementById("wilaya").value;
  const cSelect = document.getElementById("commune");
  cSelect.innerHTML = '<option value="">إختر البلدية</option>';

  if (wAr && locations[wAr]) {
    locations[wAr].communes
      .sort((a, b) => a.ar.localeCompare(b.ar))
      .forEach((c) => {
        cSelect.add(new Option(c.ar, c.fr));
      });
  }
  window.updateTotal();
};

window.updateTotal = function () {
  const wAr = document.getElementById("wilaya").value;
  const wCode = locations[wAr]?.code;
  const deliveryType = document.querySelector(
    'input[name="delivery"]:checked',
  )?.value;

  // قراءة سعر المنتج المختار (للعرض فقط)
  const selectedProduct = document.querySelector(
    'input[name="product-choice"]:checked',
  );
  const productPrice = selectedProduct
    ? parseInt(selectedProduct.getAttribute("data-price"))
    : 0;

  // حساب سعر التوصيل بناءً على البيانات القادمة من الشيت
  const priceData =
    remoteShippingPrices[wCode] || remoteShippingPrices["Default"];
  let shipping = 0;
  if (priceData) {
    shipping = deliveryType === "home" ? priceData.home : priceData.office;
  }

  // تحديث الأرقام في الصفحة
  document.getElementById("product-price").textContent = productPrice + " دج";
  document.getElementById("shipping-price").textContent = shipping + " دج";
  document.getElementById("total-price").textContent =
    productPrice + shipping + " دج";
};

// ==========================================
// 5. إرسال الطلب (Secure Submission) 🚀
// ==========================================
const orderForm = document.forms["google-sheet"];

if (orderForm) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // فحص نهائي لرقم الهاتف
    if (!validatePhone(phoneInput.value)) {
      phoneInput.focus();
      return;
    }

    const btn = document.getElementById("submit-btn");
    btn.disabled = true;
    btn.textContent = "جاري الإرسال...";

    const wAr = document.getElementById("wilaya").value;
    const wCode = locations[wAr]?.code;
    const deliveryType = document.querySelector(
      'input[name="delivery"]:checked',
    ).value;

    // تحديد سعر التوصيل لإرساله (للتوثيق فقط، السيرفر سيعيد الحساب للأمان)
    const priceData =
      remoteShippingPrices[wCode] || remoteShippingPrices["Default"];
    const shippingVal =
      deliveryType === "home" ? priceData.home : priceData.office;

    const formData = new FormData(orderForm);

    // تجهيز الحقول الإضافية
    formData.set("wilaya", locations[wAr]?.fr || wAr);
    formData.set("code", wCode || "");
    formData.set("delivery_val", shippingVal);

    try {
      const response = await fetch(SETTINGS.sheetURL, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.result === "success") {
        window.showModal("successModal");
        orderForm.reset();
        window.updateTotal();
      } else {
        throw new Error();
      }
    } catch (err) {
      window.showModal("offerErrorModal");
    } finally {
      btn.disabled = false;
      btn.textContent = "إرسال الطلب";
    }
  });
}

// ==========================================
// 6. السلايدر والمودال (Slider & Modals)
// ==========================================
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(index) {
  if (!slides.length) return;
  slides.forEach((s) => s.classList.remove("active"));
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
}
setInterval(() => showSlide(currentSlide + 1), 3000);

window.showModal = (id) => (document.getElementById(id).style.display = "flex");
window.closeModal = (id) =>
  (document.getElementById(id).style.display = "none");

// زر العودة للأعلى
const upBtn = document.querySelector(".up");
window.onscroll = () => {
  if (window.scrollY >= 300) upBtn?.classList.add("show");
  else upBtn?.classList.remove("show");
};

// ==========================================
// 7. التشغيل الابتدائي (Initialization)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. جلب الأسعار والولايات
  fetchPricesFromSheet().then(() => {
    loadLocations();
  });

  // 2. تشغيل السلايدر
  if (typeof showSlide === "function") showSlide(0);

  // 3. إنشاء زر واتساب ديناميكياً (إذا لم يكن موجوداً في HTML)
  if (!document.querySelector(".whatsapp-fab")) {
    const wa = document.createElement("a");
    wa.href = `https://wa.me/${SETTINGS.whatsappNumber}`;
    wa.className = "whatsapp-fab";
    wa.innerHTML = '<i class="fab fa-whatsapp"></i>';
    wa.target = "_blank";
    document.body.appendChild(wa);
  }
});
