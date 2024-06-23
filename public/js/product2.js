document.addEventListener('DOMContentLoaded', () => {
  const selectedImages = document.getElementById("selected_images");
  const buttonSaveImg = document.getElementById("save_the_image");
  const addImage = document.getElementById("add-images");
  const colorsCont = document.getElementById("colors");
  const addColorBtn = document.getElementById("add-colors");
  const addSizeBtn = document.getElementById("add-sizes");
  const saveColors = document.getElementById("save_colors");
  const nextColor = document.getElementById("nextColor");
  const saveVariation = document.getElementById("save-variation");
  const displayContainer = document.getElementById("display-container");
  const saveProduct = document.getElementById("save-product");
  const btns = document.querySelectorAll(".color-btn");
  const form = document.getElementById("all");
  const colorSizeButton = document.getElementById("colorSize");
  const colorContainerButtom = document.getElementById("color_containerButtom");
  const sizesSection = document.getElementById("sizes-section");
  const saveSizeBtn = document.getElementById("save-size");
  let inputColor = document.getElementById("colorr");

  let colors = [];
  let currentColor = {};
  let sizes = [];
  let formData = new FormData();

  addImage.addEventListener("click", (event) => {
    event.preventDefault();
    selectedImages.classList.remove("hide");
  });

  buttonSaveImg.addEventListener("click", (event) => {
    event.preventDefault();
    selectedImages.classList.add("hide");
    handleImageUpload("ProductImages", formData, "image1");
  });

  addColorBtn.addEventListener("click", (event) => {
    event.preventDefault();
    colorsCont.classList.remove("hide");
    addSizeBtn.disabled = true;
    addSizeBtn.style.backgroundColor = 'transparent';
  });

  addSizeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    sizesSection.classList.remove("hide");
    addColorBtn.disabled = true;
    addColorBtn.style.backgroundColor = 'transparent';
  });

  colorSizeButton.addEventListener("click", (event) => {
    event.preventDefault();
    const colorQuantity = parseInt(document.getElementById("color_quantity").value);
    const productQuantityElement = document.getElementById("product-quantity");
    const productQuantity = parseInt(productQuantityElement.value);
    const colorPrice = parseInt(document.getElementById("color-price").value);

    if (!currentColor.name || isNaN(colorQuantity) || isNaN(colorPrice)) {
      Swal.fire("الرجاء إدخال تفاصيل اللون", "تأكد من اختيار اللون وإدخال الكمية والسعر", "warning");
      return;
    }

    if (colorQuantity > productQuantity) {
      Swal.fire("الكمية غير متوفرة", "عدد القطع التي أدخلتها أكثر من عدد القطع المتبقية", "warning");
      return;
    }

    currentColor.quantity = colorQuantity;
    currentColor.price = colorPrice;
    currentColor.variations = currentColor.variations || []; // تأكد من وجود خاصية variations

    colorContainerButtom.classList.remove("hide");
  });

  btns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      btns.forEach((b) => (b.style.border = "none"));
      currentColor.name = btn.dataset.color ;
      btn.style.border = "2px solid black";
    });
  });

  inputColor.addEventListener("input", () => {
    currentColor.name = inputColor.value.trim();
  });

  nextColor.addEventListener("click", (event) => {
    event.preventDefault();
    saveColorDetails();
    clearColorDetails();
    addSizeBtn.disabled = true;
    addSizeBtn.style.backgroundColor = 'transparent';
  });

  saveColors.addEventListener("click", (event) => {
    event.preventDefault();
    saveColorDetails(true);
    addSizeBtn.disabled = true;
    addSizeBtn.style.backgroundColor = 'transparent';
  });

  saveVariation.addEventListener("click", (event) => {
    event.preventDefault();
    saveVariationDetails();
    addColorBtn.disabled = true;
    addColorBtn.style.backgroundColor = 'transparent';
  });

  saveSizeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    saveSizeDetails();
    addColorBtn.disabled = true;
    addColorBtn.style.backgroundColor = 'transparent';
  });

  saveProduct.addEventListener("click", (event) => {
    event.preventDefault();
    saveProductDetails();
  });

  document.getElementById("cancel-product").addEventListener("click", (event) => {
    event.preventDefault();
    form.reset();
  });

  function handleImageUpload(inputId, formData, fieldName) {
    const imageInputs = document.getElementById(inputId);
    if (imageInputs.files.length > 0) {
      for (let i = 0; i < imageInputs.files.length; i++) {
        formData.append(fieldName, imageInputs.files[i]);
      }
      Swal.fire("تم الحفظ!", "تم الحفظ", "success");
    } else {
      Swal.fire("لم يتم اختيار أي صورة", "الرجاء اختيار صور", "warning");
    }
    console.log(imageInputs.files)
    
  }

  function saveVariationDetails() {
    const DimensionsType = document.getElementById("TYPE_OF").value;
    const DimensionsMeger = document.getElementById("meger").value;
    const colorSizeQuantity = parseInt(document.getElementById("Size_color_quantity").value);
    const colorPrice = parseInt(document.getElementById("variation_color_prise").value);
    const colorQuantityElement = document.getElementById("color_quantity");
    const colorQuantity = parseInt(colorQuantityElement.value);

    if (!DimensionsType || !DimensionsMeger || isNaN(colorSizeQuantity) || isNaN(colorPrice)) {
      Swal.fire(
        "الرجاء إدخال جميع تفاصيل المقاس",
        "تأكد من إدخال التصنيف، القياس، الكمية والسعر",
        "warning"
      );
      return;
    }

    if (colorSizeQuantity > currentColor.quantity) {
      Swal.fire(
        "الكمية غير متوفرة",
        "عدد القطع التي أدخلتها أكثر من عدد القطع الخاصة باللون",
        "warning"
      );
      return;
    }

    // التأكد من وجود خاصية variations في currentColor
    if (!currentColor.variations) {
      currentColor.variations = [];
    }

    currentColor.variations.push({
      DimensionsType: DimensionsType,
      DimensionsMeger: DimensionsMeger,
      quantity: colorSizeQuantity,
      price: colorPrice,
    });

    // تحديث الكمية الخاصة باللون
    currentColor.quantity -= colorSizeQuantity;

    console.log("Current Variation:", {
      DimensionsType: DimensionsType,
      DimensionsMeger: DimensionsMeger,
      quantity: colorSizeQuantity,
      price: colorPrice,
    });

    colorQuantityElement.value = colorQuantity - colorSizeQuantity;
    updateColorDisplay();

    document.getElementById("Size_color_quantity").value = "";
    document.getElementById("meger").value = "";
    document.getElementById("variation_color_prise").value = "";
  }

  function saveColorDetails(hideSection = false) {
    const colorQuantity = parseInt(document.getElementById("color_quantity").value);
    const productQuantityElement = document.getElementById("product-quantity");
    const productQuantity = parseInt(productQuantityElement.value);
    const colorPrice = parseInt(document.getElementById("color-price").value);

    if (isNaN(productQuantity)) {
      Swal.fire(
        "الرجاء إدخال تفاصيل المنتج",
        "تأكد من إدخال عدد القطع الكلي والسعر العام",
        "warning"
      );
      return;
    }

    console.log(productQuantity + " product-quantity");

    if (isNaN(colorQuantity) || isNaN(colorPrice)) {
      Swal.fire(
        "الرجاء إدخال تفاصيل اللون",
        "تأكد من إدخال الكمية والسعر",
        "warning"
      );
      return;
    }

    if (colorQuantity > productQuantity) {
      Swal.fire(
        "الكمية غير متوفرة",
        "عدد القطع التي أدخلتها أكثر من عدد القطع المتبقية",
        "warning"
      );
      return;
    }

    currentColor.quantity = colorQuantity;
    currentColor.price = colorPrice;
    currentColor.variations = currentColor.variations || []; // تأكد من وجود خاصية variations

    handleImageUpload("ColorImage", formData, "image2");

    colors.push(currentColor);
    console.log("Current Color:", currentColor);

    Swal.fire("تم حفظ خيارات اللون", "اختر اللون التالي", "success");

    updateColorDisplay();

    // تصفير القيم بعد الحفظ الناجح
    clearColorDetails();

    if (hideSection) {
      colorsCont.classList.add("hide");
    }

    // قم بطرح الكمية المستخدمة من كمية المنتج المتبقية
    productQuantityElement.value = productQuantity - colorQuantity;
  }

  function clearColorDetails() {
    currentColor = {};
    document.getElementById("color_quantity").value = "";
    document.getElementById("color-price").value = "";
    document.getElementById("ColorImage").value = "";
    document.getElementById("TYPE_OF").value = "";
    inputColor.value = "";
    btns.forEach((b) => (b.style.border = "none"));
  }

  function updateColorDisplay() {
    displayContainer.innerHTML = "";
    colors.forEach((color, index) => {
      let colorItem = document.createElement("div");
      colorItem.innerHTML = `
        <h3>Color: ${color.name}</h3>
        <ul>
          <li>Quantity: ${color.quantity}</li>
          <li>Price: ${color.price}</li>
          ${color.variations ? color.variations.map((variation, vIndex) => `
            <li>
              Type: ${variation.DimensionsType}, 
              Measure: ${variation.DimensionsMeger}, 
              Quantity: ${variation.quantity}, 
              Price: ${variation.price}
              <button class="delete-variation" data-color-index="${index}" data-variation-index="${vIndex}">حذف</button>
            </li>
          `).join('') : ''}
        </ul>
        <button class="delete-color" data-index="${index}">حذف اللون</button>
      `;
      displayContainer.appendChild(colorItem);
    });

    // إضافة مستمعات الحدث لأزرار الحذف
    document.querySelectorAll(".delete-color").forEach(button => {
      button.addEventListener("click", (event) => {
        const colorIndex = event.target.getAttribute("data-index");
        deleteColor(colorIndex);
      });
    });

    document.querySelectorAll(".delete-variation").forEach(button => {
      button.addEventListener("click", (event) => {
        const colorIndex = event.target.getAttribute("data-color-index");
        const variationIndex = event.target.getAttribute("data-variation-index");
        deleteVariation(colorIndex, variationIndex);
      });
    });
  }

  function saveSizeDetails() {
    const sizeType = document.getElementById("SIZE_TYPE").value;
    const size = document.getElementById("size").value;
    const sizeQuantity = parseInt(document.getElementById("size-quantity").value);
    const sizePrice = parseInt(document.getElementById("size-price").value);
    const productQuantityElement = document.getElementById("product-quantity");
    const productQuantity = parseInt(productQuantityElement.value);

    if (!sizeType || !size || isNaN(sizeQuantity) || isNaN(sizePrice)) {
      Swal.fire(
        "الرجاء إدخال جميع تفاصيل الحجم",
        "تأكد من إدخال التصنيف، القياس، الكمية والسعر",
        "warning"
      );
      return;
    }

    if (sizeQuantity > productQuantity) {
      Swal.fire(
        "الكمية غير متوفرة",
        "عدد القطع التي أدخلتها أكثر من عدد القطع المتبقية",
        "warning"
      );
      return;
    }

    sizes.push({
      DimensionsType: sizeType,
      size: size,
      quantity: sizeQuantity,
      price: sizePrice,
    });

    // تحديث الكمية الخاصة بالمنتج
    productQuantityElement.value = productQuantity - sizeQuantity;

    console.log("Current Size:", {
      DimensionsType: sizeType,
      size: size,
      quantity: sizeQuantity,
      price: sizePrice,
    });

    updateSizeDisplay();

    document.getElementById("size").value = "";
    document.getElementById("size-quantity").value = "";
    document.getElementById("size-price").value = "";
  }

  function updateSizeDisplay() {
    const sizesDisplay = document.createElement("div");
    sizesDisplay.innerHTML = "";
    sizes.forEach((size, index) => {
      let sizeItem = document.createElement("div");
      sizeItem.innerHTML = `
        <h3>Size: ${size.size}</h3>
        <ul>
          <li>النوع: ${size.DimensionsType}</li>
          <li>القياس: ${size.size}</li>
          <li>الكمية: ${size.quantity}</li>
          <li>السعر: ${size.price}</li>
        </ul>
        <button class="delete-button" data-index="${index}">حذف</button>
      `;
      sizesDisplay.appendChild(sizeItem);
    });

    // إضافة مستمعات الحدث لأزرار الحذف
    document.querySelectorAll(".delete-button").forEach(button => {
      button.addEventListener("click", (event) => {
        const index = event.target.getAttribute("data-index");
        deleteSize(index);
      });
    });
  }

  function deleteColor(index) {
    const color = colors[index];
    const productQuantityElement = document.getElementById("product-quantity");
    let productQuantity = parseInt(productQuantityElement.value);

    // إعادة الكمية إلى المخزون
    productQuantityElement.value = productQuantity + color.quantity;

    colors.splice(index, 1);
    updateColorDisplay();
    addSizeBtn.disabled = false;
    addSizeBtn.style.backgroundColor = ''; // إعادة تفعيل الزر
  }

  function deleteSize(index) {
    const size = sizes[index];
    const productQuantityElement = document.getElementById("product-quantity");
    let productQuantity = parseInt(productQuantityElement.value);

    // إعادة الكمية إلى المخزون
    productQuantityElement.value = productQuantity + size.quantity;

    sizes.splice(index, 1);
    updateSizeDisplay();
    addColorBtn.disabled = false;
    addColorBtn.style.backgroundColor = ''; // إعادة تفعيل الزر
  }

  function deleteVariation(colorIndex, variationIndex) {
    const color = colors[colorIndex];
    const variation = color.variations[variationIndex];

    // إعادة الكمية إلى اللون
    color.quantity += variation.quantity;

    // حذف المقاس من اللون
    color.variations.splice(variationIndex, 1);
    updateColorDisplay();
  }

  function saveProductDetails() {
    const ProductName = document.getElementById("product-name").value;
    const ProductDiscrption = document.getElementById("product-description").value;
    const PrdustPrise = document.getElementById("product-price").value;
    const product_category = document.getElementById("product-category").value;

    // التحقق من إدخال التفاصيل الأساسية للمنتج
    if (!ProductName || !ProductDiscrption || isNaN(PrdustPrise) || !product_category) {
      Swal.fire(
        "الرجاء إدخال جميع تفاصيل المنتج الأساسية",
        "تأكد من إدخال الاسم والوصف والسعر والتصنيف",
        "warning"
      );
      return;
    }

    formData.append("colors", JSON.stringify(colors));
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("PrdustPrise", PrdustPrise);
    formData.append("ProductDiscrption", ProductDiscrption);
    formData.append("ProductName", ProductName);
    formData.append("SubCategorie", product_category);

    console.log("Final Product Data:", {
      colors: colors,
      sizes: sizes,
      PrdustPrise: PrdustPrise,
      ProductDiscrption: ProductDiscrption,
      ProductName: ProductName,
      SubCategorie: product_category
    });

    fetch("/admin/Post_add_product", {
      method: "POST",
      body: formData,
      headers: {
        "CSRF-Token": document.querySelector('input[name="_csrf"]').value,
      },
    })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));

    Swal.fire("تم الحفظ!", "تم حفظ المنتج الجديد بنجاح", "success");
  }
});
