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
  "1": 2500,
  "2": 4500,
  "3": 6000
};

let selectedOffer = null;
let selectedProductPrice = 0;


// function updateProductPrice() {
//   const offer = document.getElementById("offer").value;
//   const productPriceSpan = document.getElementById("product-price");
//   const totalSpan = document.getElementById("total");
//   const deliverySpan = document.getElementById("delivery");

//   if (offer && offers[offer]) {
//     selectedProductPrice = offers[offer];
//     productPriceSpan.textContent = selectedProductPrice + " دج";
//   } else {
//     selectedProductPrice = 0;
//     productPriceSpan.textContent = "—";
//   }

//   // تحديث الإجمالي إذا كانت الولاية مختارة
//   const wilaya = document.getElementById("wilaya").value;
//   if (wilaya && wilayaData[wilaya]) {
//     const deliveryPrice = wilayaData[wilaya].delivery;
//     deliverySpan.textContent = deliveryPrice + " دج";
//     if (selectedProductPrice) {
//       totalSpan.textContent = (selectedProductPrice + deliveryPrice) + " دج";
//     } else {
//       totalSpan.textContent = "—";
//     }
//   } else {
//     totalSpan.textContent = "—";
//   }
// }



// عند اختيار عرض
function selectOffer(offerId) {
  // إزالة التفعيل عن كل البطاقات
  document.querySelectorAll(".offer-card").forEach(card => {
    card.classList.remove("active");
  });

  // تفعيل البطاقة المحددة
  const selectedCard = document.querySelector(`.offer-card[data-offer="${offerId}"]`);
  selectedCard.classList.add("active");

  // تحديث السعر
  selectedOffer = offerId;
  selectedProductPrice = offers[offerId];
  document.getElementById("product-price").textContent = selectedProductPrice + " دج";

  updateTotal();
}

// تحديث الإجمالي عند اختيار العرض أو الولاية
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



// function updateCommunesAndDelivery() {
//   const wilaya = document.getElementById("wilaya").value;
//   const communeSelect = document.getElementById("commune");
//   const deliverySpan = document.getElementById("delivery");
//   const totalSpan = document.getElementById("total");

//   communeSelect.innerHTML = '<option value="">اختر البلدية</option>';

//   if (wilaya && wilayaData[wilaya]) {
//     // تعبئة البلديات
//     wilayaData[wilaya].communes.forEach(commune => {
//       const option = document.createElement("option");
//       option.value = commune;
//       option.textContent = commune;
//       communeSelect.appendChild(option);
//     });

//     // سعر التوصيل
//     const deliveryPrice = wilayaData[wilaya].delivery;
//     deliverySpan.textContent = deliveryPrice + " دج";

//     // السعر الإجمالي = المنتج + التوصيل
//     const total = productPrice + deliveryPrice;
//     totalSpan.textContent = total + " دج";
//   } else {
//     deliverySpan.textContent = "—";
//     totalSpan.textContent = "—";
//   }
// }


// function updateCommunesAndDelivery() {
//   const wilaya = document.getElementById("wilaya").value;
//   const communeSelect = document.getElementById("commune");
//   const deliverySpan = document.getElementById("delivery");
//   const totalSpan = document.getElementById("total");

//   communeSelect.innerHTML = '<option value="">اختر البلدية</option>';

//   if (wilaya && wilayaData[wilaya]) {
//     // تعبئة البلديات
//     wilayaData[wilaya].communes.forEach(commune => {
//       const option = document.createElement("option");
//       option.value = commune;
//       option.textContent = commune;
//       communeSelect.appendChild(option);
//     });

//     // سعر التوصيل
//     const deliveryPrice = wilayaData[wilaya].delivery;
//     deliverySpan.textContent = deliveryPrice + " دج";

//     // السعر الإجمالي إذا تم اختيار عرض
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

  function validateName() {
    const name = document.getElementById("name").value.trim();
    document.getElementById("name-error").textContent = name ? "" : "الرجاء إدخال الاسم.";
  }

  function validatePhone() {
    const phone = document.getElementById("phone").value.trim();
    const phoneRegex = /^(05|06|07)\d{8}$/;
    document.getElementById("phone-error").textContent = phoneRegex.test(phone) ? "" : "رقم الهاتف غير صحيح.";
  }

  function validateWilaya() {
    const wilaya = document.getElementById("wilaya").value;
    document.getElementById("wilaya-error").textContent = wilaya ? "" : "الرجاء اختيار الولاية.";
  }

  function validateCommune() {
    const commune = document.getElementById("commune").value;
    document.getElementById("commune-error").textContent = commune ? "" : "الرجاء اختيار البلدية.";
  }

  // function validateSize() {
  //   const size = document.getElementById("size").value;
  //   document.getElementById("size-error").textContent = size ? "" : "الرجاء اختيار اللون.";
  // }

  function validateForm() {
    validateName();
    validatePhone();
    validateWilaya();
    validateCommune();
    // validateSize();

    const errors = document.querySelectorAll(".error");
    const hasError = Array.from(errors).some(el => el.textContent !== "");

    // if (!hasError) {
    //   document.getElementById("success-message").textContent = "✅ تم إرسال الطلب بنجاح!";
    // } else {
    //   document.getElementById("success-message").textContent = "";
    // }
if (!hasError) {
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