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
const slides = document.querySelectorAll('.slide');
let slideInterval = setInterval(() => changeSlide(1), 4000); // كل 4 ثوانٍ

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove('active'));
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
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



const wilayaData = {
    "الجزائر": {
      delivery: 400,
      communes: ["باب الزوار", "الجزائر وسط", "بئر مراد رايس"]
    },
    "وهران": {
      delivery: 600,
      communes: ["السانيا", "المدينة الجديدة", "الحمري"]
    },
    "سطيف": {
      delivery: 500,
      communes: ["عين ولمان", "العلمة", "سطيف"]
    }
  };
















// 💰 أسعار العروض
const offers = {
  "1": 1300,
  "2": 2600,
  "3": 3500,
};

let selectedOffer = null;
let selectedProductPrice = 0;


// 🟩 اختيار العرض
function selectOffer(offerId) {
  // إزالة التفعيل عن كل البطاقات
  document.querySelectorAll(".offer-card").forEach(card => {
    card.classList.remove("active");
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = false;
  });

  // 🔍 تحديد البطاقة الصحيحة التي فيها نفس data-offer
  const selectedCard = document.querySelector(`.offer-card[data-offer="${offerId}"]`);
  if (!selectedCard) return; // 🛑 إذا لم يجد البطاقة يخرج بدون خطأ

  selectedCard.classList.add("active");

  // ✅ تحديد checkbox بداخلها
  const checkbox = selectedCard.querySelector('input[type="checkbox"]');
  if (checkbox) checkbox.checked = true;

  // تحديث السعر
  selectedOffer = offerId;
  selectedProductPrice = offers[offerId];
  document.getElementById("product-price").textContent = selectedProductPrice + " دج";

  updateTotal();
}


// 🔄 تحديث الإجمالي عند اختيار العرض أو الولاية
function updateTotal() {
  const wilaya = document.getElementById("wilaya").value;
  const deliverySpan = document.getElementById("delivery");
  const totalSpan = document.getElementById("total-price");

  if (wilaya && wilayaData[wilaya]) {
    const deliveryPrice = wilayaData[wilaya].delivery;
    deliverySpan.textContent = deliveryPrice + " دج";

    if (selectedProductPrice) {
      totalSpan.textContent = (selectedProductPrice + deliveryPrice) + " دج";
    } else {
      totalSpan.textContent = "—";
    }
  } else {
    deliverySpan.textContent = "—";
    totalSpan.textContent = "—";
  }
}


// 🏙️ تحديث البلديات والسعر
function updateCommunesAndDelivery() {
  const wilaya = document.getElementById("wilaya").value;
  const communeSelect = document.getElementById("commune");
  communeSelect.innerHTML = '<option value="">اختر البلدية</option>';

  if (wilaya && wilayaData[wilaya]) {
    wilayaData[wilaya].communes.forEach(commune => {
      const option = document.createElement("option");
      option.value = commune;
      option.textContent = commune;
      communeSelect.appendChild(option);
    });
  }

  updateTotal(); // تحديث الأسعار بعد تغيير الولاية
}


// ✅ التحقق من الحقول
function validateName() {
  const name = document.getElementById("name").value.trim();
  document.getElementById("name-error").textContent = name ? "" : "الرجاء إدخال الاسم.";
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
  document.getElementById("wilaya-error").textContent = wilaya ? "" : "الرجاء اختيار الولاية.";
}

function validateCommune() {
  const commune = document.getElementById("commune").value;
  document.getElementById("commune-error").textContent = commune ? "" : "الرجاء اختيار البلدية.";
}


// 🧾 التحقق قبل الإرسال
function validateForm() {
  validateName();
  validatePhone();
  validateWilaya();
  validateCommune();

  const errors = document.querySelectorAll(".error");
  const hasError = Array.from(errors).some(el => el.textContent !== "");

  if (!hasError) {
    sendToSheet(); // ← نرسل البيانات إلى Google Sheets هنا
    document.getElementById("success-message").textContent = "✅ تم إرسال الطلب بنجاح!";

    setTimeout(() => {
      // مسح جميع الحقول
      document.querySelectorAll("input, select").forEach(el => el.value = "");

      // تصفير الأسعار
      document.getElementById("delivery").textContent = "—";
      document.getElementById("product-price").textContent = "—";
      document.getElementById("total-price").textContent = "—";

      // إزالة التفعيل من بطاقات العروض
      document.querySelectorAll(".offer-card").forEach(card => {
        card.classList.remove("active");
      });

      // إخفاء الرسالة
      document.getElementById("success-message").textContent = "";
    }, 2000);
  }
}


// 🟦 عند اختيار العرض
function handleOfferSelection(checkbox) {
  // إلغاء تفعيل كل checkboxes ما عدا المختار
  document.querySelectorAll('input[name="offer"]').forEach(cb => {
    const card = cb.closest(".offer-card");
    card.classList.remove("active");
    if (cb !== checkbox) cb.checked = false;
  });

  // إذا تم تحديد عرض
  if (checkbox.checked) {
    const card = checkbox.closest(".offer-card");
    card.classList.add("active");
    selectOffer(checkbox.value);
  } else {
    // في حال ألغى الاختيار
    selectedOffer = null;
    selectedProductPrice = 0;
    document.getElementById("product-price").textContent = "—";
    document.getElementById("total-price").textContent = "—";
  }
}


// 🚀 إرسال البيانات إلى Google Sheets
function sendToSheet() {
  // تحديث الأسعار قبل الإرسال
  updateTotal();

  const productPriceText = document.getElementById("product-price").textContent;
  const deliveryText = document.getElementById("delivery").textContent;
  const totalText = document.getElementById("total-price").textContent;

  const data = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    wilaya: document.getElementById("wilaya").value,
    commune: document.getElementById("commune").value,
    offer: selectedOffer
      ? selectedOffer + " (" + productPriceText + ")"
      : "—",
    delivery: deliveryText !== "—" ? deliveryText : "0 دج",
    total: totalText !== "—" ? totalText : productPriceText
  };

  console.log("📦 البيانات المرسلة:", data);

  fetch("https://script.google.com/macros/s/AKfycbzFKH0twCpN3-UQIDVUa3kf-lyFsciGtYeS36bwDEr8x-OY6ATlqM7Ln-Wbf0C3uhR3tA/exec", {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(() => console.log("✅ تم الإرسال إلى Google Sheets بنجاح"))
  .catch(err => console.error("❌ خطأ أثناء الإرسال:", err));
}

















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

//   fetch("https://script.google.com/macros/s/AKfycbxosCq2f5I1bc7uFdeKNNBs6aeDkmngIva2QI39K1YAIhv3WveUH6SRfpePwwgY319ITQ/exec", {
//     method: "POST",
//     mode: "no-cors",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data)
//   })
//   .then(() => console.log("✅ تم الإرسال إلى Google Sheets"))
//   .catch(err => console.error("❌ خطأ أثناء الإرسال:", err));
// }
