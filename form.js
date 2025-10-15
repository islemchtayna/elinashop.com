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

  function updateCommunesAndDelivery() {
    const wilaya = document.getElementById("wilaya").value;
    const communeSelect = document.getElementById("commune");
    const deliveryInput = document.getElementById("delivery");

    communeSelect.innerHTML = '<option value="">اختر البلدية</option>';

    if (wilaya && wilayaData[wilaya]) {
      wilayaData[wilaya].communes.forEach(commune => {
        const option = document.createElement("option");
        option.value = commune;
        option.textContent = commune;
        communeSelect.appendChild(option);
      });

      deliveryInput.value = wilayaData[wilaya].delivery + " دج";
    } else {
      deliveryInput.value = "";
    }
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

  function validateSize() {
    const size = document.getElementById("size").value;
    document.getElementById("size-error").textContent = size ? "" : "الرجاء اختيار المقاس.";
  }

  function validateForm() {
    validateName();
    validatePhone();
    validateWilaya();
    validateCommune();
    validateSize();

    const errors = document.querySelectorAll(".error");
    const hasError = Array.from(errors).some(el => el.textContent !== "");

    if (!hasError) {
      document.getElementById("success-message").textContent = "✅ تم إرسال الطلب بنجاح!";
    } else {
      document.getElementById("success-message").textContent = "";
    }
  }