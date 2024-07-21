document.addEventListener("DOMContentLoaded", function () {
  
  const images = document.querySelectorAll(".option img");
  const colorImages = document.querySelectorAll(".color-image img");
  const sizeLabels = document.querySelectorAll(".size-option");
  const addToCartButton = document.getElementById("addTo");
  const buyNowButton = document.getElementById("buyNow");
  const quantityInput = document.getElementById("number");
  const detailsButton = document.getElementById("details");
  const detailsContainer = document.getElementById("main");
  const productPriceElement = document.getElementById("productPrice");
  const sizeOptionsContainer = document.getElementById("details1");
  const orderSummaryModal = document.getElementById("orderSummaryModal");
  const orderDetails = document.getElementById("orderDetails");
  const confirmOrderButton = document.getElementById("confirmOrder");
  const cancelOrderButton = document.getElementById("cancelOrder");
  const closeButton = document.querySelector(".close");

  let selectedOptionId,
    selectedImageId,
    selectedColor,
    selectedColorVartion,
    selectedImage;
  let productPrice = productPriceElement.textContent.trim().replace("$", "");
  let qwan;

  // تحديث السعر والكمية بناءً على الاختيار الحالي
  function updatePriceAndQuantity() {
    let highestPrice = 0;
    let lowestQuantity = Infinity;
    const selectedOptions = document.querySelectorAll('.size-option.selected');
  
    selectedOptions.forEach(option => {
      const price = parseFloat(option.getAttribute("data-price"));
      const qty = parseInt(option.getAttribute("data-qty"));
  
      if (price > highestPrice) {
        highestPrice = price;
      }
  
      if (qty < lowestQuantity) {
        lowestQuantity = qty;
      }
    });
  
    if (selectedColorVartion && selectedOptions.length === 0) {
      const selectedColorImage = document.querySelector(
        `img[data-vartionId="${selectedColorVartion}"]`
      );
      if (selectedColorImage) {
        const colorPrice = parseFloat(selectedColorImage.getAttribute("data-price"));
        const colorQty = parseInt(selectedColorImage.getAttribute("data-qty"));
  
        if (colorPrice > highestPrice) {
          highestPrice = colorPrice;
        }
  
        if (colorQty < lowestQuantity) {
          lowestQuantity = colorQty;
        }
      }
    }
  
    if (highestPrice > 0) {
      productPrice = highestPrice.toFixed(2);
      productPriceElement.textContent = `$${productPrice}`;
    }
  
    if (lowestQuantity !== Infinity) {
      qwan = lowestQuantity;
      quantityInput.max = qwan;
    } else {
      qwan = 0;
      quantityInput.max = 0;
    }
  
    console.log("Updating price to:", productPrice);
    console.log("Updating quantity to:", qwan);
  }

  // معالجة النقر على خيار المقاس
  function handleLabelClick() {
    sizeLabels.forEach((label) => {
      label.addEventListener("click", () => {
        sizeLabels.forEach((lbl) => (lbl.style.border = "none"));
        selectedOptionId = label.getAttribute("data-OptionId");
        label.style.border = "2px solid black";
        updatePriceAndQuantity();
      });
    });
  }

  // معالجة النقر على الصورة الرئيسية
  function handleMainImageClick() {
    images.forEach((image) => {
      image.addEventListener("click", () => {
        colorImages.forEach((img) => (img.style.border = "none"));
        images.forEach((img) => (img.style.border = "none"));
        image.style.border = "2px solid black";
        document.querySelector(".main_image img").src = image.src;
      });
    });
  }

  // معالجة النقر على صور الألوان
  function handleColorImageClick() {
    colorImages.forEach((image) => {
      image.addEventListener("click", () => {
        if (image.classList.contains("disabled")) return;
  
        colorImages.forEach((img) => (img.style.border = "none"));
        image.style.border = "2px solid black";
        selectedImage = image.src;
        selectedColor = image.getAttribute("data-color");
        selectedColorVartion = image.getAttribute("data-vartionId");
        selectedImageId = image.getAttribute("data-id");
  
        document.querySelector(".main_image img").src = image.src;
  
        const sizes = document.querySelectorAll(
          `.size-option[data-color-id="${selectedColorVartion}"]`
        );
        
        sizeLabels.forEach((label) => {
          label.classList.add("disabled");
          label.style.opacity = "0.5";
          label.style.pointerEvents = "none";
        });
  
        if (sizes.length > 0) {
          sizeOptionsContainer.classList.remove("hide");
          sizes.forEach((size) => {
            size.classList.remove("disabled");
            size.style.opacity = "1";
            size.style.pointerEvents = "auto";
            if (parseInt(size.getAttribute("data-qty")) <= 0) {
              size.classList.add("disabled");
              size.style.opacity = "0.5";
              size.style.pointerEvents = "none";
            }
          });
        } else {
          sizeOptionsContainer.classList.add("hide");
        }
  
        updatePriceAndQuantity();
        checkColorAvailability();
      });
    });
  }

  // التحقق من الألوان والمقاسات عند تحميل الصفحة
  function initializePage() {
    const sizesAvailable = sizeLabels.length > 0;
    const colorsAvailable = colorImages.length > 0;
  
    if (sizesAvailable) {
      sizeLabels.forEach((size) => {
        if (parseInt(size.getAttribute("data-qty")) <= 0) {
          size.classList.add("disabled");
          size.style.opacity = "0.5";
          size.style.pointerEvents = "none";
        }
      });
    } else if (colorsAvailable) {
      colorImages.forEach((image) => {
        if (parseInt(image.getAttribute("data-qty")) <= 0) {
          image.classList.add("disabled");
          image.style.opacity = "0.5";
          image.style.pointerEvents = "none";
        }
      });
    } 
    
    if (!colorsAvailable && !sizesAvailable) {
      // إذا لم يكن هناك ألوان أو مقاسات، تحقق من الكمية العامة
      const generalQuantity = parseInt(quantityInput.max);
      if (generalQuantity <= 0) {
        showUnavailableProductMessage();
      }
    }
  
    checkAvailability();
  
    // تحديث السعر والكمية بناءً على أول خيار متاح
    updateInitialPriceAndQuantity();
  }

  function getQueryParams() {
    return new URLSearchParams(window.location.search);
  }
  function checkColorAvailability() {
    const availableSizes = Array.from(sizeLabels).filter(
      (size) => !size.classList.contains("disabled") && size.style.display !== "none"
    );
    
    if (availableSizes.length === 0) {
      const currentColorImage = document.querySelector(`img[data-vartionId="${selectedColorVartion}"]`);
      if (currentColorImage) {
        currentColorImage.classList.add("disabled");
        currentColorImage.style.opacity = "0.5";
        currentColorImage.style.pointerEvents = "none";
      }
    }
    
    checkAvailability();
  }
  // التعامل مع إضافة المنتج إلى السلة
  async function handleAddToCart(e) {
    e.preventDefault();
    const colorsAvailable = colorImages.length > 0;
    const sizesAvailable = sizeLabels.length > 0;

    if (colorsAvailable && !selectedColorVartion) {
      return showError("يرجى تحديد اللون المطلوب قبل إضافة المنتج إلى السلة");
    }
    if (sizesAvailable && !selectedOptionId) {
      return showError("يرجى تحديد المقاس المطلوب قبل إضافة المنتج إلى السلة");
    }

    const lastQuan = parseInt(qwan) - parseInt(quantityInput.value);
    if (lastQuan < 0) {
      return showError(`عدد القطع المتوفرة من المنتج هي ${qwan}`);
    }

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("selectedOptionId", selectedOptionId);
    formData.append("selectedColor", selectedColor);
    formData.append("selectedImageId", selectedImageId);
    formData.append("quantity", quantityInput.value);
    formData.append("selectedColorVartionID", selectedColorVartion);
    formData.append("productPrice", productPrice);
    formData.append("lastQuan", lastQuan);

    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });

    console.log("Form data being sent:", formObject);

    try {
      const response = await axios.post(
        "http://localhost:3000/cart/add/toCart",
        formObject,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "CSRF-Token": document.querySelector('input[name="_csrf"]').value,
          },
        }
      );
      console.log("Response from server:", response);
      qwan = lastQuan;
      Swal.fire({
        title: "تم الاضافة الى السلة!",
        text: "تم حفظ المنتج الجديد بنجاح",
        icon: "success",
        timer: 3000,
      });
    } catch (error) {
      console.error("Error occurred:", error);
      showError("حدث خطأ أثناء إضافة المنتج إلى السلة");
    }
  }

  // التعامل مع الشراء الآن
  async function handleBuyNow(event) {
    event.preventDefault();
    const colorsAvailable = colorImages.length > 0;
    const sizesAvailable = sizeLabels.length > 0;

    if (colorsAvailable && !selectedColorVartion) {
      return showError("يرجى تحديد اللون المطلوب قبل الشراء");
    }
    if (sizesAvailable && !selectedOptionId) {
      return showError("يرجى تحديد المقاس المطلوب قبل الشراء");
    }

    const lastQuan = parseInt(qwan) - parseInt(quantityInput.value);
    if (lastQuan < 0) {
      return showError(`عدد القطع المتوفرة من المنتج هي ${qwan}`);
    }

    const product = {
      productId: productId,
      selectedOptionId: selectedOptionId,
      selectedColor: selectedColor,
      selectedImageId: selectedImageId,
      quantity: quantityInput.value,
      selectedColorVartionID: selectedColorVartion,
      productPrice: productPrice,
      lastQuan: lastQuan,
    };

    const selectedProducts = JSON.stringify([product]);

    console.log("Form data being sent:", selectedProducts);

    // عرض تفاصيل الطلبية في المودال
    orderDetails.innerHTML = `
      <p>رقم المنتج: ${productId}</p>
      <p>اللون: ${selectedColor}</p>
      <p>المقاس: ${selectedOptionId ? selectedOptionId : "N/A"}</p>
      <p>الكمية: ${quantityInput.value}</p>
      <p>السعر: ${productPrice}</p>
    `;
    orderSummaryModal.style.display = "block";

    confirmOrderButton.onclick = async function () {
      try {
        const response = await axios.post(
          "http://localhost:3000/cart/ordered",
          { selectedProducts: selectedProducts },
          {
            headers: {
              "Content-Type": "application/json",
              "CSRF-Token": document.querySelector('input[name="_csrf"]').value,
            },
          }
        )
        console.log("Response from server:", response);
        qwan = lastQuan;
        Swal.fire({
          title: "الف مبروك",
          text: "تمت عملية الشراء بنجاح",
          icon: "success",
          timer: 3000,
        })
        window.location.href = "/user/prdoduct/detlas"; // إعادة التوجيه بعد النجاح
        orderSummaryModal.style.display = "none";
      } catch (error) {
        console.error("Error occurred:", error);
        showError("حدث خطأ أثناء عملية الشراء");
      }
    };

    cancelOrderButton.onclick = function () {
      orderSummaryModal.style.display = "none";
    };
  }

  // عرض رسالة خطأ
  function showError(message) {
    Swal.fire({
      title: "خطأ",
      text: message,
      icon: "error",
      timer: 3000,
    });
  }

  const params = getQueryParams();
  const productId = params.get("product_id");

  detailsContainer.classList.add("hide");
  detailsButton.addEventListener("click", () => {
    detailsContainer.classList.remove("hide");
    detailsButton.classList.toggle("hide");
    images.forEach((image) => (image.style.border = "none"));
  });
if(addToCartButton && buyNowButton){
  addToCartButton.addEventListener("click", handleAddToCart);
  buyNowButton.addEventListener("click", handleBuyNow);
} 
  handleLabelClick();
  handleMainImageClick();
  handleColorImageClick();

  // إغلاق المودال عند النقر على زر الإغلاق
  closeButton.onclick = function () {
    orderSummaryModal.style.display = "none";
  };

  // إغلاق المودال عند النقر خارج المودال
  window.onclick = function (event) {
    if (event.target == orderSummaryModal) {
      orderSummaryModal.style.display = "none";
    }
  };
  function checkColorAvailability() {
    const availableSizes = Array.from(sizeLabels).filter(
      (size) => !size.classList.contains("disabled") && size.style.display !== "none"
    );
    
    if (availableSizes.length === 0) {
      const currentColorImage = document.querySelector(`img[data-vartionId="${selectedColorVartion}"]`);
      if (currentColorImage) {
        currentColorImage.classList.add("disabled");
        currentColorImage.style.opacity = "0.5";
        currentColorImage.style.pointerEvents = "none";
      }
    }
    
    checkAvailability();
  }
  function checkAvailability() {
    const colorsAvailable = colorImages.length > 0;
    const sizesAvailable = sizeLabels.length > 0;
  
    let allUnavailable = false;
  
    if (colorsAvailable) {
      allUnavailable = Array.from(colorImages).every((image) => image.classList.contains("disabled"));
    } else if (sizesAvailable) {
      allUnavailable = Array.from(sizeLabels).every((label) => label.classList.contains("disabled"));
    } else {
      allUnavailable = parseInt(quantityInput.max) <= 0;
    }
  
    if (allUnavailable) {
      addToCartButton.disabled = true;
      buyNowButton.disabled = true;
      showUnavailableProductMessage();
    } else {
      addToCartButton.disabled = false;
      buyNowButton.disabled = false;
    }
  }
  addToCartButton.addEventListener("click", handleAddToCart);
  buyNowButton.addEventListener("click", handleBuyNow);
  // // استدعاء دالة التحقق من التوفر عند تحميل الصفحة
    initializePage();

});
  const mainImage = document.querySelector('.main_image img');
  const thumbnails = document.querySelectorAll('.option img');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const close = document.querySelector('.lightbox .close');
  const prev = document.querySelector('.lightbox .prev');
  const next = document.querySelector('.lightbox .next');
  let currentIndex = 0;

  function openLightbox(src, index) {
    lightbox.style.display = 'block';
    lightboxImg.src = src;
    currentIndex = index;
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
  }

  function showPrevImage() {
    currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    lightboxImg.src = thumbnails[currentIndex].src;
  }

  function showNextImage() {
    currentIndex = (currentIndex + 1) % thumbnails.length;
    lightboxImg.src = thumbnails[currentIndex].src;
  }

  // فتح العرض المكبر عند النقر على الصورة الرئيسية
  mainImage.addEventListener('click', function() {
    openLightbox(this.src, 0);
  });

  function showUnavailableProductMessage() {
    Swal.fire({
      title: "المنتج غير متوفر",
      text: "عذراً، هذا المنتج غير متوفر حالياً",
      icon: "info",
      confirmButtonText: "حسناً"
    });
  }
  function updateInitialPriceAndQuantity() {
    if (colorImages.length > 0) {
      const firstAvailableColor = Array.from(colorImages).find(
        (image) => !image.classList.contains("disabled")
      );
      if (firstAvailableColor) {
        firstAvailableColor.click();
      }
    } else if (sizeLabels.length > 0) {
      const firstAvailableSize = Array.from(sizeLabels).find(
        (label) => !label.classList.contains("disabled")
      );
      if (firstAvailableSize) {
        firstAvailableSize.click();
      }
    } else {
      updatePriceAndQuantity();
    }
  }

  // إغلاق العرض المكبر
  close.addEventListener('click', closeLightbox);

  // التنقل بين الصور
  prev.addEventListener('click', showPrevImage);
  next.addEventListener('click', showNextImage);

  // إغلاق العرض المكبر عند النقر خارج الصورة
  lightbox.addEventListener('click', function(e) {
    if (e.target === this) {
      closeLightbox();
    }
    
  });
  
