const head = document.querySelector(".head");
const header = document.querySelector(".header");
const scrollWatcher = document.createElement("div");
scrollWatcher.setAttribute("data-scroll-watcher", "");
header.before(scrollWatcher);
const navObserver = new IntersectionObserver((entries) => {
  head.classList.toggle("stiky-nav", !entries[0].isIntersecting);
});
navObserver.observe(scrollWatcher);

// سلايدر
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
let slideInterval = setInterval(() => changeSlide(1), 4000); // كل 4 ثوانٍ

function showSlide(index) {
  slides.forEach((slide) => slide.classList.remove("active"));
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
}

function changeSlide(step) {
  showSlide(currentSlide + step);
  resetInterval();
}

function resetInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(() => changeSlide(1), 4000);
}

// أول عرض
showSlide(currentSlide);

// const wilayaData = {
//   الجزائر: {
//     delivery: 400,
//     communes: ["باب الزوار", "الجزائر وسط", "بئر مراد رايس"],
//   },
//   وهران: {
//     delivery: 600,
//     communes: ["السانيا", "المدينة الجديدة", "الحمري"],
//   },
//   سطيف: {
//     delivery: 500,
//     communes: ["عين ولمان", "العلمة", "سطيف"],
//   },
// };

const wilayaData = {
  أدرار: { delivery: 1100, communes: [] },
  الشلف: { delivery: 450, communes: [] },
  الأغواط: { delivery: 700, communes: [] },
  "أم البواقي": { delivery: 500, communes: [] },
  باتنة: { delivery: 500, communes: [] },
  بجاية: { delivery: 500, communes: [] },
  بسكرة: { delivery: 600, communes: [] },
  بشار: { delivery: 1100, communes: [] },
  البليدة: { delivery: 450, communes: [] },
  البويرة: { delivery: 450, communes: [] },
  تمنراست: { delivery: 1400, communes: [] },
  تبسة: { delivery: 600, communes: [] },
  تلمسان: { delivery: 500, communes: [] },
  تيارت: { delivery: 500, communes: [] },
  "تيزي وزو": { delivery: 450, communes: [] },
  الجزائر: { delivery: 450, communes: [] },
  الجلفة: { delivery: 600, communes: [] },
  جيجل: { delivery: 500, communes: [] },
  سطيف: { delivery: 400, communes: [] },
  سعيدة: { delivery: 600, communes: [] },
  سكيكدة: { delivery: 500, communes: [] },
  "سيدي بلعباس": { delivery: 500, communes: [] },
  عنابة: { delivery: 500, communes: [] },
  قالمة: { delivery: 600, communes: [] },
  قسنطينة: { delivery: 450, communes: [] },
  المدية: { delivery: 450, communes: [] },
  مستغانم: { delivery: 500, communes: [] },
  المسيلة: { delivery: 500, communes: [] },
  معسكر: { delivery: 600, communes: [] },
  ورقلة: { delivery: 800, communes: [] },
  وهران: { delivery: 450, communes: [] },
  البيض: { delivery: 800, communes: [] },
  إليزي: { delivery: 1700, communes: [] },
  "برج بوعريريج": { delivery: 450, communes: [] },
  بومرداس: { delivery: 450, communes: [] },
  الطارف: { delivery: 600, communes: [] },
  تندوف: { delivery: 1400, communes: [] },
  تسمسيلت: { delivery: 500, communes: [] },
  الوادي: { delivery: 800, communes: [] },
  خنشلة: { delivery: 600, communes: [] },
  "سوق أهراس": { delivery: 600, communes: [] },
  تيبازة: { delivery: 450, communes: [] },
  ميلة: { delivery: 500, communes: [] },
  "عين الدفلى": { delivery: 450, communes: [] },
  النعامة: { delivery: 800, communes: [] },
  "عين تموشنت": { delivery: 600, communes: [] },
  غرداية: { delivery: 800, communes: [] },
  غليزان: { delivery: 500, communes: [] },
  تيميمون: { delivery: 1100, communes: [] },
  "برج باجي مختار": { delivery: 1700, communes: [] },
  "أولاد جلال": { delivery: 700, communes: [] },
  "بني عباس": { delivery: 1100, communes: [] },
  "عين صالح": { delivery: 1100, communes: [] },
  "عين قزام": { delivery: 1700, communes: [] },
  توقرت: { delivery: 800, communes: [] },
  جانت: { delivery: 1700, communes: [] },
  المغير: { delivery: 800, communes: [] },
  المنيعة: { delivery: 1000, communes: [] },
};

// 💰 أسعار العروض
const offers = {
  1: 1300,
  2: 2600,
  3: 3500,
};

let selectedOffer = null;
let selectedProductPrice = 0;
let selectedDeliveryType = ""; // 🔹 نوع التوصيل (منزل أو مكتب)

// ✅ اختيار العرض
function selectOffer(offerId) {
  document.querySelectorAll(".offer-card").forEach((card) => {
    card.classList.remove("active");
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = false;
  });

  const selectedCard = document.querySelector(
    `.offer-card[data-offer="${offerId}"]`
  );
  if (!selectedCard) return;

  selectedCard.classList.add("active");
  const checkbox = selectedCard.querySelector('input[type="checkbox"]');
  if (checkbox) checkbox.checked = true;

  selectedOffer = offerId;
  selectedProductPrice = offers[offerId];
  document.getElementById("product-price").textContent =
    selectedProductPrice + " دج";

  updateTotal();
}

// ✅ تحديث الإجمالي
function updateTotal() {
  const wilaya = document.getElementById("wilaya").value;
  const deliverySpan = document.getElementById("delivery");
  const totalSpan = document.getElementById("total-price");

  if (wilaya && wilayaData[wilaya]) {
    let deliveryPrice = wilayaData[wilaya].delivery;

    // 🔹 تعديل السعر حسب نوع التوصيل (المنزل أغلى بـ100 دج)
    if (selectedDeliveryType === "home") deliveryPrice += 100;
    if (selectedDeliveryType === "office") deliveryPrice -= 0; // بدون تخفيض حاليًا

    deliverySpan.textContent = deliveryPrice + " دج";
    totalSpan.textContent = selectedProductPrice
      ? selectedProductPrice + deliveryPrice + " دج"
      : "—";
  } else {
    deliverySpan.textContent = "—";
    totalSpan.textContent = "—";
  }
}

// ✅ تحديث البلديات
function updateCommunesAndDelivery() {
  const wilaya = document.getElementById("wilaya").value;
  const communeSelect = document.getElementById("commune");
  communeSelect.innerHTML = '<option value="">اختر البلدية</option>';

  if (wilaya && wilayaData[wilaya]) {
    wilayaData[wilaya].communes.forEach((commune) => {
      const option = document.createElement("option");
      option.value = commune;
      option.textContent = commune;
      communeSelect.appendChild(option);
    });
  }

  updateTotal();
}

// ✅ التحقق من البيانات
function validateName() {
  const name = document.getElementById("name").value.trim();
  document.getElementById("name-error").textContent = name
    ? ""
    : "الرجاء إدخال الاسم.";
}

function validatePhone() {
  const phone = document.getElementById("phone").value.trim();
  const phoneRegex = /^(05|06|07)\d{8}$/;
  document.getElementById("phone-error").textContent = phoneRegex.test(phone)
    ? ""
    : "الرجاء ادخال رقم يبدأ ب 05-06-07.";
}

function validateWilaya() {
  const wilaya = document.getElementById("wilaya").value;
  document.getElementById("wilaya-error").textContent = wilaya
    ? ""
    : "الرجاء اختيار الولاية.";
}

function validateCommune() {
  const commune = document.getElementById("commune").value;
  document.getElementById("commune-error").textContent = commune
    ? ""
    : "الرجاء اختيار البلدية.";
}

function validateDeliveryType() {
  const deliveryInputs = document.querySelectorAll(
    'input[name="delivery-type"]'
  );
  const selected = Array.from(deliveryInputs).some((r) => r.checked);
  document.getElementById("delivery-type-error").textContent = selected
    ? ""
    : "الرجاء اختيار نوع التوصيل.";
  return selected;
}

// ✅ التحقق النهائي
function validateForm() {
  validateName();
  validatePhone();
  validateWilaya();
  // validateCommune();
  // validateDeliveryType();

  const errors = document.querySelectorAll(".error");
  const hasError = Array.from(errors).some((el) => el.textContent !== "");

  if (!hasError) {
    sendToSheet();
    showModal();
    document.getElementById("success-message").textContent =
      "✅ تم إرسال الطلب بنجاح!";

    setTimeout(() => {
      // 🔄 إعادة تعيين الحقول
      document.querySelectorAll("input, select").forEach((el) => {
        if (el.type === "checkbox" || el.type === "radio") el.checked = false;
        else el.value = "";
      });

      // تصفير الأسعار
      document.getElementById("delivery").textContent = "—";
      document.getElementById("product-price").textContent = "—";
      document.getElementById("total-price").textContent = "—";

      document
        .querySelectorAll(".offer-card")
        .forEach((card) => card.classList.remove("active"));

      selectedOffer = null;
      selectedProductPrice = 0;
      selectedDeliveryType = "";

      document.getElementById("success-message").textContent = "";
    }, 2000);
  }
}

// ✅ التحكم في checkbox
function handleOfferSelection(checkbox) {
  document.querySelectorAll('input[name="offer"]').forEach((cb) => {
    const card = cb.closest(".offer-card");
    card.classList.remove("active");
    if (cb !== checkbox) cb.checked = false;
  });

  if (checkbox.checked) {
    const card = checkbox.closest(".offer-card");
    card.classList.add("active");
    selectOffer(checkbox.value);
  } else {
    selectedOffer = null;
    selectedProductPrice = 0;
    document.getElementById("product-price").textContent = "—";
    document.getElementById("total-price").textContent = "—";
  }
}

// ✅ التعامل مع اختيار نوع التوصيل
function handleDeliverySelection(radio) {
  selectedDeliveryType = radio.value;
  updateTotal();
}

// ✅ الإرسال إلى Google Sheets
function sendToSheet() {
  const data = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    wilaya: document.getElementById("wilaya").value,
    commune: document.getElementById("commune").value,
    deliveryType:
      selectedDeliveryType === "home" ? "توصيل للمنزل" : "استلام من المكتب",
    offer: selectedOffer
      ? selectedOffer + " (" + selectedProductPrice + " دج)"
      : "—",
    delivery: document.getElementById("delivery").textContent,
    total: document.getElementById("total-price").textContent,
  };

  fetch(
    "https://script.google.com/macros/s/AKfycbyReWwXPINXe6rner2QBYwrkIT7pVCIhXhfawkJ2mBzQZ_g6IKlMAR3D1be9nF-fzeonA/exec",
    {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  )
    .then(() => console.log("✅ تم الإرسال إلى Google Sheets"))
    .catch((err) => console.error("❌ خطأ أثناء الإرسال:", err));
}

// ✅ إظهار النافذة بعد نجاح الإرسال
function showModal() {
  document.getElementById("successModal").style.display = "flex";
}

// ✅ إغلاق النافذة
function closeModal() {
  document.getElementById("successModal").style.display = "none";
}

// // 💰 أسعار العروض
// const offers = {
//   "1": 1300,
//   "2": 2600,
//   "3": 3500,
// };

// let selectedOffer = null;
// let selectedProductPrice = 0;

// // ✅ اختيار العرض
// function selectOffer(offerId) {
//   document.querySelectorAll(".offer-card").forEach(card => {
//     card.classList.remove("active");
//     const checkbox = card.querySelector('input[type="checkbox"]');
//     if (checkbox) checkbox.checked = false;
//   });

//   const selectedCard = document.querySelector(`.offer-card[data-offer="${offerId}"]`);
//   if (!selectedCard) return;

//   selectedCard.classList.add("active");
//   const checkbox = selectedCard.querySelector('input[type="checkbox"]');
//   if (checkbox) checkbox.checked = true;

//   selectedOffer = offerId;
//   selectedProductPrice = offers[offerId];
//   document.getElementById("product-price").textContent = selectedProductPrice + " دج";

//   updateTotal();
// }

// // ✅ تحديث الإجمالي
// function updateTotal() {
//   const wilaya = document.getElementById("wilaya").value;
//   const deliverySpan = document.getElementById("delivery");
//   const totalSpan = document.getElementById("total-price");

//   if (wilaya && wilayaData[wilaya]) {
//     const deliveryPrice = wilayaData[wilaya].delivery;
//     deliverySpan.textContent = deliveryPrice + " دج";
//     totalSpan.textContent = selectedProductPrice
//       ? selectedProductPrice + deliveryPrice + " دج"
//       : "—";
//   } else {
//     deliverySpan.textContent = "—";
//     totalSpan.textContent = "—";
//   }
// }

// // ✅ تحديث البلديات
// function updateCommunesAndDelivery() {
//   const wilaya = document.getElementById("wilaya").value;
//   const communeSelect = document.getElementById("commune");
//   communeSelect.innerHTML = '<option value="">اختر البلدية</option>';

//   if (wilaya && wilayaData[wilaya]) {
//     wilayaData[wilaya].communes.forEach(commune => {
//       const option = document.createElement("option");
//       option.value = commune;
//       option.textContent = commune;
//       communeSelect.appendChild(option);
//     });
//   }

//   updateTotal();
// }

// // ✅ التحقق من البيانات
// function validateName() {
//   const name = document.getElementById("name").value.trim();
//   document.getElementById("name-error").textContent = name ? "" : "الرجاء إدخال الاسم.";
// }

// function validatePhone() {
//   const phone = document.getElementById("phone").value.trim();
//   const phoneRegex = /^(05|06|07)\d{8}$/;
//   document.getElementById("phone-error").textContent = phoneRegex.test(phone)
//     ? ""
//     : "الرجاء ادخال رقم يبدأ ب 05-06-07.";
// }

// function validateWilaya() {
//   const wilaya = document.getElementById("wilaya").value;
//   document.getElementById("wilaya-error").textContent = wilaya ? "" : "الرجاء اختيار الولاية.";
// }

// function validateCommune() {
//   const commune = document.getElementById("commune").value;
//   document.getElementById("commune-error").textContent = commune ? "" : "الرجاء اختيار البلدية.";
// }

// // ✅ التحقق النهائي
// function validateForm() {
//   validateName();
//   validatePhone();
//   validateWilaya();
//   validateCommune();

//   const errors = document.querySelectorAll(".error");
//   const hasError = Array.from(errors).some(el => el.textContent !== "");

//   if (!hasError) {
//     sendToSheet();
//     document.getElementById("success-message").textContent = "✅ تم إرسال الطلب بنجاح!";

//     setTimeout(() => {
//       // 🔄 إعادة تعيين الحقول
//       document.querySelectorAll("input, select").forEach(el => {
//         if (el.type === "checkbox") el.checked = false;
//         else el.value = "";
//       });

//       // تصفير الأسعار
//       document.getElementById("delivery").textContent = "—";
//       document.getElementById("product-price").textContent = "—";
//       document.getElementById("total-price").textContent = "—";

//       // إزالة التفعيل من العروض
//       document.querySelectorAll(".offer-card").forEach(card => card.classList.remove("active"));

//       // إعادة تفعيل الاختيار من جديد بعد الإرسال ✅
//       selectedOffer = null;
//       selectedProductPrice = 0;

//       document.getElementById("success-message").textContent = "";
//     }, 2000);
//   }
// }

// // ✅ التحكم في checkbox
// function handleOfferSelection(checkbox) {
//   document.querySelectorAll('input[name="offer"]').forEach(cb => {
//     const card = cb.closest(".offer-card");
//     card.classList.remove("active");
//     if (cb !== checkbox) cb.checked = false;
//   });

//   if (checkbox.checked) {
//     const card = checkbox.closest(".offer-card");
//     card.classList.add("active");
//     selectOffer(checkbox.value);
//   } else {
//     selectedOffer = null;
//     selectedProductPrice = 0;
//     document.getElementById("product-price").textContent = "—";
//     document.getElementById("total-price").textContent = "—";
//   }
// }

// // ✅ الإرسال إلى Google Sheets
// function sendToSheet() {
//   const data = {
//     name: document.getElementById("name").value,
//     phone: document.getElementById("phone").value,
//     wilaya: document.getElementById("wilaya").value,
//     commune: document.getElementById("commune").value,
//     offer: selectedOffer ? selectedOffer + " (" + selectedProductPrice + " دج)" : "—",
//     delivery: document.getElementById("delivery").textContent,
//     total: document.getElementById("total-price").textContent
//   };

//   fetch("https://script.google.com/macros/s/AKfycbyReWwXPINXe6rner2QBYwrkIT7pVCIhXhfawkJ2mBzQZ_g6IKlMAR3D1be9nF-fzeonA/exec", {
//     method: "POST",
//     mode: "no-cors",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data)
//   })
//   .then(() => console.log("✅ تم الإرسال إلى Google Sheets"))
//   .catch(err => console.error("❌ خطأ أثناء الإرسال:", err));
// }

//   // 💰 أسعار العروض
// const offers = {
//   "1": 1300,
//   "2": 2600,
//   "3": 3500,
// };

// let selectedOffer = null;
// let selectedProductPrice = 0;

// function selectOffer(offerId) {
//   // إزالة التفعيل عن كل البطاقات
//   document.querySelectorAll(".offer-card").forEach(card => {
//     card.classList.remove("active");
//     const checkbox = card.querySelector('input[type="checkbox"]');
//     if (checkbox) checkbox.checked = false;
//   });

//   // 🔍 تحديد البطاقة الصحيحة التي فيها نفس data-offer
//   const selectedCard = document.querySelector(`.offer-card[data-offer="${offerId}"]`);

//   if (!selectedCard) return; // 🛑 إذا لم يجد البطاقة يخرج بدون خطأ

//   selectedCard.classList.add("active");

//   // ✅ تحديد checkbox بداخلها
//   const checkbox = selectedCard.querySelector('input[type="checkbox"]');
//   if (checkbox) checkbox.checked = true;

//   // تحديث السعر
//   selectedOffer = offerId;
//   selectedProductPrice = offers[offerId];
//   document.getElementById("product-price").textContent = selectedProductPrice + " دج";

//   updateTotal();
// }

// // تحديث الإجمالي عند اختيار العرض أو الولاية
// function updateTotal() {
//   const wilaya = document.getElementById("wilaya").value;
//   const deliverySpan = document.getElementById("delivery");
//   const totalSpan = document.getElementById("total-price");

//   if (wilaya && wilayaData[wilaya]) {
//     const deliveryPrice = wilayaData[wilaya].delivery;
//     deliverySpan.textContent = deliveryPrice + " دج";

//     if (selectedProductPrice) {
//       totalSpan.textContent = (selectedProductPrice + deliveryPrice) + " دج";
//     } else {
//       totalSpan.textContent = "—";
//     }
//   } else {
//     deliverySpan.textContent = "—";
//     totalSpan.textContent = "—";
//   }
// }

// function updateCommunesAndDelivery() {
//   const wilaya = document.getElementById("wilaya").value;
//   const communeSelect = document.getElementById("commune");
//   communeSelect.innerHTML = '<option value="">اختر البلدية</option>';

//   if (wilaya && wilayaData[wilaya]) {
//     wilayaData[wilaya].communes.forEach(commune => {
//       const option = document.createElement("option");
//       option.value = commune;
//       option.textContent = commune;
//       communeSelect.appendChild(option);
//     });
//   }

//   updateTotal(); // تحديث الأسعار بعد تغيير الولاية
// }

//   function validateName() {
//     const name = document.getElementById("name").value.trim();
//     document.getElementById("name-error").textContent = name ? "" : "الرجاء إدخال الاسم.";
//   }

//   function validatePhone() {
//     const phone = document.getElementById("phone").value.trim();
//     const phoneRegex = /^(05|06|07)\d{8}$/;
//     document.getElementById("phone-error").textContent = phoneRegex.test(phone) ? "" : "الرجاء ادخال رقم يبدأ ب 05-06-07.";
//   }

//   function validateWilaya() {
//     const wilaya = document.getElementById("wilaya").value;
//     document.getElementById("wilaya-error").textContent = wilaya ? "" : "الرجاء اختيار الولاية.";
//   }

//   function validateCommune() {
//     const commune = document.getElementById("commune").value;
//     document.getElementById("commune-error").textContent = commune ? "" : "الرجاء اختيار البلدية.";
//   }

//   // function validateSize() {
//   //   const size = document.getElementById("size").value;
//   //   document.getElementById("size-error").textContent = size ? "" : "الرجاء اختيار اللون.";
//   // }

//   function validateForm() {
//     validateName();
//     validatePhone();
//     validateWilaya();
//     validateCommune();
//     // validateSize();

//     const errors = document.querySelectorAll(".error");
//     const hasError = Array.from(errors).some(el => el.textContent !== "");

// if (!hasError) {
//   sendToSheet(); // ← نرسل البيانات إلى Google Sheets هنا
//   document.getElementById("success-message").textContent = "✅ تم إرسال الطلب بنجاح!";

//   setTimeout(() => {
//     // مسح جميع الحقول
//     document.querySelectorAll("input, select").forEach(el => el.value = "");

//     // تصفير الأسعار
//     document.getElementById("delivery").textContent = "—";
//     document.getElementById("product-price").textContent = "—";
//     document.getElementById("total-price").textContent = "—";

//     // إزالة التفعيل من بطاقات العروض
//     document.querySelectorAll(".offer-card").forEach(card => {
//       card.classList.remove("active");
//     });

//     // إخفاء الرسالة
//     document.getElementById("success-message").textContent = "";

//   }, 2000);
// }

//   }

//   function handleOfferSelection(checkbox) {
//   // إلغاء تفعيل كل checkboxes ما عدا المختار
//   document.querySelectorAll('input[name="offer"]').forEach(cb => {
//     const card = cb.closest(".offer-card");
//     card.classList.remove("active");
//     if (cb !== checkbox) cb.checked = false;
//   });

//   // إذا تم تحديد عرض
//   if (checkbox.checked) {
//     const card = checkbox.closest(".offer-card");
//     card.classList.add("active");
//     selectOffer(checkbox.value); // استدعاء دالتك الأصلية 👍
//   } else {
//     // في حال ألغى الاختيار
//     selectedOffer = null;
//     selectedProductPrice = 0;
//     document.getElementById("product-price").textContent = "—";
//     document.getElementById("total-price").textContent = "—";
//   }
// }

// function sendToSheet() {
//   const data = {
//     name: document.getElementById("name").value,
//     phone: document.getElementById("phone").value,
//     wilaya: document.getElementById("wilaya").value,
//     commune: document.getElementById("commune").value,
//     offer: selectedOffer ? selectedOffer + " (" + selectedProductPrice + " دج)" : "—",
//     delivery: document.getElementById("delivery").textContent,
//     total: document.getElementById("total-price").textContent
//   };

//   fetch("https://script.google.com/macros/s/AKfycbyReWwXPINXe6rner2QBYwrkIT7pVCIhXhfawkJ2mBzQZ_g6IKlMAR3D1be9nF-fzeonA/exec", {
//     method: "POST",
//     mode: "no-cors",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data)
//   })
//   .then(() => console.log("✅ تم الإرسال إلى Google Sheets"))
//   .catch(err => console.error("❌ خطأ أثناء الإرسال:", err));
// }
