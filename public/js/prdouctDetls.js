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
    if (selectedOptionId) {
      const selectedSizeOption = document.querySelector(
        `label[data-OptionId="${selectedOptionId}"]`
      );
      if (selectedSizeOption) {
        productPrice = selectedSizeOption.getAttribute("data-price");
        qwan = selectedSizeOption.getAttribute("data-qty");
        quantityInput.max = qwan;
      }
    } else if (selectedColorVartion) {
      const selectedColorImage = document.querySelector(
        `img[data-vartionId="${selectedColorVartion}"]`
      );
      if (selectedColorImage) {
        productPrice = selectedColorImage.getAttribute("data-price");
        qwan = selectedColorImage.getAttribute("data-qty");
        quantityInput.max = qwan;
      }
    }
    console.log("Updating price to:", productPrice);
    productPriceElement.textContent = `$${productPrice}`;
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
        colorImages.forEach((img) => (img.style.border = "none"));
        image.style.border = "2px solid black";
        selectedImage = image.src;
        selectedColor = image.getAttribute("data-color");
        selectedColorVartion = image.getAttribute("data-vartionId");
        selectedImageId = image.getAttribute("data-id");

        console.log("Selected Color:", selectedColor);
        console.log("Product Price:", productPrice);

        document.querySelector(".main_image img").src = image.src;

        const sizes = document.querySelectorAll(
          `.size-option[data-color-id="${selectedColorVartion}"]`
        );
        if (sizes.length > 0) {
          sizeOptionsContainer.classList.remove("hide");
          sizeLabels.forEach((label) => label.classList.add("disabled"));
          sizes.forEach((size) => size.classList.remove("disabled"));


          // إخفاء المقاسات التي نفذت كمياتها
          sizes.forEach((size) => {
            if (parseInt(size.getAttribute("data-qty")) <= 0) {
              size.classList.add("hide");
            }
          });

          // التحقق مما إذا كان اللون يحتوي على أي مقاسات متاحة
          const availableSizes = Array.from(sizes).filter(
            (size) => !size.classList.contains("hide")
          );
          if (availableSizes.length === 0) {
            image.classList.add("hide");
          }
        } else {
          sizeOptionsContainer.classList.add("hide");
        }

        updatePriceAndQuantity();
      });
    });
  }

  // التحقق من الألوان والمقاسات عند تحميل الصفحة
  function initializePage() {
    const sizesAvailable = sizeLabels.length > 0;
    const colorsAvailable = colorImages.length > 0;

    console.log(sizesAvailable + " size available");
    console.log(colorsAvailable + " size colorsAvailable");

    // تحقق من المقاسات عند تحميل الصفحة
    if (sizesAvailable) {
      sizeLabels.forEach((size) => {
        if (parseInt(size.getAttribute("data-qty")) <= 0) {
          size.classList.add("hide");
        }
      });
    }

    // تحقق من الألوان عند تحميل الصفحة
    if (colorsAvailable) {
      colorImages.forEach((image) => {
        const sizes = document.querySelectorAll(
          `.size-option[data-color-id="${image.getAttribute(
            "data-vartionId"
          )}"]`
        );
        if (sizes.length > 0) {
          const availableSizes = Array.from(sizes).filter(
            (size) => !size.classList.contains("hide")
          );
          if (availableSizes.length === 0) {
            image.classList.add("hide");
          }
        } else {
          if (parseInt(image.getAttribute("data-qty")) <= 0) {
            image.classList.add("hide");
          }
        }
      });

      // تحديث السعر والكمية بناءً على أول لون متاح
      const firstAvailableColor = Array.from(colorImages).find(
        (image) => !image.classList.contains("hide")
      );
      if (firstAvailableColor) {
        firstAvailableColor.click();
      }
    }

    // التحقق من نفاد جميع الألوان أو المقاسات
    checkAvailability();
  }

  function getQueryParams() {
    return new URLSearchParams(window.location.search);
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
        );
        console.log("Response from server:", response);
        qwan = lastQuan;
        Swal.fire({
          title: "الف مبروك",
          text: "تمت عملية الشراء بنجاح",
          icon: "success",
          timer: 3000,
        });
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

  addToCartButton.addEventListener("click", handleAddToCart);
  buyNowButton.addEventListener("click", handleBuyNow);

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

  function checkAvailability() {
    //   // التحقق مما إذا كانت هناك ألوان متاحة
    const colorsAvailable = colorImages.length > 0;

    //   // التحقق مما إذا كانت هناك مقاسات متاحة
    const sizesAvailable = sizeLabels.length > 0;

    //   // تحقق مما إذا كانت جميع الألوان غير متاحة إذا كانت الألوان موجودة
    const allColorsUnavailable = colorsAvailable
      ? Array.from(colorImages).every((image) =>
          image.classList.contains("hide")
        )
      : false;

    //   // تحقق مما إذا كانت جميع المقاسات غير متاحة إذا كانت المقاسات موجودة
    const allSizesUnavailable = sizesAvailable
      ? Array.from(sizeLabels).every((label) =>
          label.classList.contains("hide")
        )
      : false;

    //   // إذا كانت الألوان غير متاحة أو إذا كانت المقاسات غير متاحة، فهذا يعني أن المنتج غير متوفر
    if (
      (colorsAvailable && allColorsUnavailable) ||
      (sizesAvailable && allSizesUnavailable)
    ) {
      addToCartButton.disabled = true;
      buyNowButton.disabled = true;
      showError("عذراً، المنتج غير متوفر حالياً.");
    }
  }
  addToCartButton.addEventListener("click", handleAddToCart);
  buyNowButton.addEventListener("click", handleBuyNow);
  // // استدعاء دالة التحقق من التوفر عند تحميل الصفحة
  initializePage();
});
