// editeProduct.js

document.addEventListener("DOMContentLoaded", () => {
  const addImagesButton = document.getElementById("add-images");
  const addColorsButton = document.getElementById("add-colors");
  const buttonSaveImg = document.getElementById("save_the_image");
  const saveColorsButton = document.getElementById("save_colors");
  const selectedImagesSection = document.getElementById("selected_images");
  const colorsSection = document.getElementById("colors");
  const colorContainerButtom = document.getElementById("color_containerButtom");
  const colorSizeButton = document.getElementById("colorSize");
  const displayContainer = document.getElementById("display-container");
  const form = document.getElementById("all");
  const nextColorButton = document.getElementById("nextColor");
  const saveProductButton = document.getElementById("save-product");
  const add_colorButtons = document.querySelectorAll(".add-size");
  const addNewColorContainer = document.getElementById("addNewColorContainer");
  const add_new_color_button = document.getElementById("add_new_color_button");
  let color_id;
  let size_edit_fields = document.getElementById("size-edit-fields");
  let deleteProduct = document.getElementById("delet");
  let add_sizes = document.getElementById("add-sizes");
  let product_sizes_container = document.getElementById("sizes");
  let add_new_size_button = document.getElementById("add_new_size_button");
  let addNewSizeContainer=document.getElementById("addNewSizeContainer");
  let save_new_size_button=document.getElementById("save_new_size");
  let delete_size=document.getElementById("delete-size");

  const addedImages = [];
  const removedImages = [];
  const addedColors = [];
  const addedColorsVartion = [];
  const removedColors = [];
  const removedVartion = [];
  let currentColor = {};
  let colors = [];
  let sizes = [];
  let add_new_size = [];
  let formData = new FormData();

  addImagesButton.addEventListener("click", () => {
    selectedImagesSection.classList.toggle("hide");
  });
  if (addColorsButton) {
    addColorsButton.addEventListener("click", () => {
      colorsSection.classList.toggle("hide");
      addNewColorContainer.classList.add("hide");
    });
  }

  buttonSaveImg.addEventListener("click", (event) => {
    event.preventDefault();
    selectedImagesSection.classList.add("hide");
    handleImageUpload("ProductImages", formData, "image1");
  });
  if (saveColorsButton) {
    saveColorsButton.addEventListener("click", () => {
      saveColorDetails(true);
    });
  }
  if (nextColorButton) {
    nextColorButton.addEventListener("click", (event) => {
      event.preventDefault();
      saveColorDetails();
      clearColorDetails();
    });
  }
  if (add_sizes) {
    add_sizes.addEventListener("click", () => {
      product_sizes_container.classList.remove("hide");
    });
  }
  if(add_new_size_button)
  {
    add_new_size_button.addEventListener("click",()=>{
      addNewSizeContainer.classList.toggle("hide");
      
    })
  }

  add_colorButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      size_edit_fields.classList.remove("hide");

      const newFields = document.createElement("div");
      newFields.innerHTML = `
        <input type="text" id="megermentUnit" placeholder="وحدة القياس">
        <input type="text" id="megerment" placeholder="القياس">
        <input type="number" id="New_Size_color_quantity" placeholder="الكمية">
        <input type="number" id="New_variation_color_prise" placeholder="السعر">
        <button type="button" class="addVartion">اضافة القياس</button>
      `;

      color_id = btn.getAttribute("data-id");
      console.log(color_id + "fdfsd");

      size_edit_fields.appendChild(newFields);
      console.log("Fields added");

      // إضافة مستمع الحدث بعد إنشاء الحقول الجديدة
      newFields.querySelector(".addVartion").addEventListener("click", () => {
        event.preventDefault();
        handleAddSizecolor();
        size_edit_fields.classList.add("hide");
      });
    });
  });
  if (add_new_color_button) {
    add_new_color_button.addEventListener("click", (event) => {
      event.preventDefault();

      addNewColorContainer.classList.remove("hide");
    });
  }
  if(save_new_size_button){
    save_new_size_button.addEventListener("click",()=>{
      handleAddNewSize();
      clearAddNewSize();
    //  addNewColorContainer.classList.add("hide");


    })
  }

  function handleImageDelete(event) {
    const imageUrl = event.target.getAttribute("data-url");
    removedImages.push(imageUrl);
    event.target.parentElement.remove();
    console.log(removedImages + "fdsf");
  }

  function handleColorDelete(event) {
    const colorElement = event.target.parentElement;
    const colorId = colorElement.getAttribute("data-id");
    removedColors.push(colorId);
    colorElement.remove();
    console.log(removedColors + "kjjjj");
  }

  function handleColorVartionDelete(event) {
    const colorElement = event.target.parentElement;
    const colorId = colorElement.getAttribute("data-id");
    addedColorsVartion.push(colorId);
    colorElement.remove();
    console.log(addedColorsVartion + "vartion");
  }
  
  function handleAddNewSize(){
    event.preventDefault();
    let megerment=document.getElementById("megerment").value;
    let size=document.getElementById("size").value;
    let size_quantity=document.getElementById("size_quantity").value;
    let size_price=document.getElementById("size_price").value;
    sizes.push({
      megerment:megerment,
      size_quantity:size_quantity,
      size:size,
      size_price:size_price

    })
    console.log("sizes "+ sizes)
  }
  

  function handleSizeDelete(event) {
    const sizeId = event.target.getAttribute("data-id");
    const colorElement = event.target.closest(".size-item");
    removedVartion.push(sizeId);
    colorElement.remove();
    console.log("size is "+ removedVartion)

  }
  function clearAddNewSize(){
    let megerment=document.getElementById("megerment").value=""
    let size=document.getElementById("size").value="";
    let size_quantity=document.getElementById("size_quantity").value="";
    let size_price=document.getElementById("size_price").value="";
  
  }
  

  // function handleSizeEdit(event) {
  //   const sizeId = event.target.getAttribute('data-id');
  //   const colorElement = event.target.closest('.color-item');
  //   const colorId = colorElement.getAttribute('data-id');
  //   const color = addedColors.find(color => color.id === colorId);
  //   const size = color.relatedVariants.find(variant => variant.id === sizeId);

  //   const editFields = document.createElement('div');
  //   editFields.classList.add('size-edit-fields');
  //   editFields.innerHTML = `
  //     <input type="text" value="${size.DimensionsMeger}" class="edit-size-meger">
  //     <input type="number" value="${size.quantity}" class="edit-size-quantity">
  //     <input type="number" value="${size.price}" class="edit-size-price">
  //     <button type="button" class="save-edit-size" data-id="${size.id}">حفظ</button>
  //     <button type="button" class="cancel-edit-size">إلغاء</button>
  //   `;

  //   size.element.appendChild(editFields);

  //   editFields.querySelector('.save-edit-size').addEventListener('click', () => {
  //     const newMeger = editFields.querySelector('.edit-size-meger').value;
  //     const newQuantity = parseInt(editFields.querySelector('.edit-size-quantity').value);
  //     const newPrice = parseInt(editFields.querySelector('.edit-size-price').value);

  //     size.DimensionsMeger = newMeger;
  //     size.quantity = newQuantity;
  //     size.price = newPrice;

  //     updateColorDisplay();
  //   });

  //   editFields.querySelector('.cancel-edit-size').addEventListener('click', () => {
  //     editFields.remove();
  //   });
  // }

  document.querySelectorAll(".delete-image").forEach((button) => {
    button.addEventListener("click", handleImageDelete);
  });

  document.querySelectorAll(".delete-color").forEach((button) => {
    button.addEventListener("click", handleColorDelete);
  });
  document.querySelectorAll(".delete-color_vartion").forEach((button) => {
    button.addEventListener("click", handleColorVartionDelete);
  });
   document.querySelectorAll(".delete-size").forEach((button) => {
    button.addEventListener("click", handleSizeDelete);
  });

  if (colorSizeButton) {
    colorSizeButton.addEventListener("click", () => {
      colorContainerButtom.classList.toggle("hide");
    });
  }
  document.querySelectorAll(".color-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const color = event.target.getAttribute("data-color");
      selectColor(color);
    });
  });
  if (document.getElementById("save-variation")) {
    document.getElementById("save-variation").addEventListener("click", () => {
      saveVariationDetails();
    });
  }

  function createColorElement(colorItem) {
    const colorElement = document.createElement("div");
    colorElement.classList.add("color-item");
    colorElement.setAttribute("data-id", colorItem.id);
    colorElement.innerHTML = `
      <label>لون: ${colorItem.color}</label>
      <h4>المقاسات المتصلة:</h4>
      <div class="related-variants"></div>
      <button type="button" class="delete-color">X</button>
      <button type="button" class="edit-color">تعديل</button>
      <div class="color-edit-fields hide">
        <input type="text" value="${colorItem.color}" class="edit-color-input" />
        <input type="number" value="${colorItem.quantity}" class="edit-color-quantity" />
        <input type="number" value="${colorItem.price}" class="edit-color-price" />
        <button type="button" class="save-edit-color">حفظ</button>
      </div>
    `;
    colorElement
      .querySelector(".delete-color")
      .addEventListener("click", handleColorDelete);
    colorElement.querySelector(".edit-color").addEventListener("click", () => {
      colorElement.querySelector(".color-edit-fields").classList.toggle("hide");
    });
    colorElement
      .querySelector(".save-edit-color")
      .addEventListener("click", () => {
        const newColor = colorElement.querySelector(".edit-color-input").value;
        const newQuantity = parseInt(
          colorElement.querySelector(".edit-color-quantity").value
        );
        const newPrice = parseInt(
          colorElement.querySelector(".edit-color-price").value
        );
        colorItem.color = newColor;
        colorItem.quantity = newQuantity;
        colorItem.price = newPrice;
        updateColorDisplay();
      });
    return colorElement;
  }

  function selectColor(color) {
    currentColor.name = color;
    document
      .querySelectorAll(".color-btn")
      .forEach((btn) => (btn.style.border = "none"));
    event.target.style.border = "2px solid black";
  }

  function saveColorDetails(hideSection = false) {
    const colorQuantity = parseInt(
      document.getElementById("color_quantity").value
    );
    const colorPrice = parseInt(document.getElementById("color-price").value);

    if (isNaN(colorQuantity) || isNaN(colorPrice)) {
      Swal.fire(
        "الرجاء إدخال تفاصيل اللون",
        "تأكد من إدخال الكمية والسعر",
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
      colorsSection.classList.add("hide");
    }
  }

  function clearColorDetails() {
    currentColor = {};
    document.getElementById("color_quantity").value = "";
    document.getElementById("color-price").value = "";
    document.getElementById("ColorImage").value = "";
    document.getElementById("TYPE_OF").value = "";
    document.getElementById("colorr").value = "";
    document
      .querySelectorAll(".color-btn")
      .forEach((btn) => (btn.style.border = "none"));
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
          ${
            color.variations
              ? color.variations
                  .map(
                    (variation, vIndex) => `
            <li>
              Type: ${variation.DimensionsType}, 
              Measure: ${variation.DimensionsMeger}, 
              Quantity: ${variation.quantity}, 
              Price: ${variation.price}
              <button class="delete-variation" data-color-index="${index}" data-variation-index="${vIndex}">حذف</button>
            </li>
          `
                  )
                  .join("")
              : ""
          }
        </ul>
        <button class="delete-color" data-index="${index}">حذف اللون</button>
      `;
      displayContainer.appendChild(colorItem);
    });

    document.querySelectorAll(".edit-size").forEach((button) => {
      button.addEventListener("click", handleSizeEdit);
    });
  }
  function handleAddSizecolor() {
    const New_Size_color_quantity = document.getElementById( "New_Size_color_quantity");
    const New_variation_color_prise = document.getElementById( "New_variation_color_prise");
    const megerment = document.getElementById("megerment");
    const megermentUnit = document.getElementById("megermentUnit");
    add_new_size.push({
      New_Size_color_quantity: New_Size_color_quantity.value,
      New_variation_color_prise: New_variation_color_prise.value,
      megerment: megerment.value,
      id: color_id,
      megermentUnit: megermentUnit.value,
    });
    New_Size_color_quantity.value = "";
    New_variation_color_prise.value = "";
    console.log("new size " + add_new_size);
  }

  function saveVariationDetails() {
    const DimensionsType = document.getElementById("TYPE_OF").value;
    const DimensionsMeger = document.getElementById("meger").value;
    const colorSizeQuantity = parseInt(
      document.getElementById("Size_color_quantity").value
    );
    const colorPrice = parseInt(
      document.getElementById("variation_color_prise").value
    );
    // const colorQuantityElement = document.getElementById("color_quantity");
    // const colorQuantity = parseInt(colorQuantityElement.value);

    if (
      !DimensionsType ||
      !DimensionsMeger ||
      isNaN(colorSizeQuantity) ||
      isNaN(colorPrice)
    ) {
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

    if (!currentColor.variations) {
      currentColor.variations = [];
    }

    currentColor.variations.push({
      DimensionsType: DimensionsType,
      DimensionsMeger: DimensionsMeger,
      quantity: colorSizeQuantity,
      price: colorPrice,
      element: null,
    });

    currentColor.quantity -= colorSizeQuantity;

    updateColorDisplay();

    document.getElementById("Size_color_quantity").value = "";
    document.getElementById("meger").value = "";
    document.getElementById("variation_color_prise").value = "";
  }
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
    console.log(imageInputs.files);
  }

  saveProductButton.addEventListener("click", async(event) => {
    saveProductDetails();
   await Swal.fire("تم الحفظ!", "تم حفظ المنتج بنجاح", "success");

    location.reload(); // تحديث الصفحة


  });

  document
    .getElementById("cancel-product")
    .addEventListener("click", (event) => {
      event.preventDefault();
      form.reset();
    });
  function saveProductDetails() {
    const ProductName = document.getElementById("product-name").value;
    const ProductDiscrption = document.getElementById(
      "product-description"
    ).value;
    const PrdustPrise = document.getElementById("product-price").value;
    const Product_id = document.getElementById("productId").value;
    const image1 = document.getElementById("image1");
    const image2 = document.getElementById("image2");

    formData.append("removedColors", JSON.stringify(removedColors));
    formData.append("addedColorsVartion", JSON.stringify(addedColorsVartion));
    formData.append("removedImages", JSON.stringify(removedImages));
    formData.append("removedVartion", JSON.stringify(removedVartion));
    formData.append("colors", JSON.stringify(colors));
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("add_new_size", JSON.stringify(add_new_size));
    formData.append("PrdustPrise", PrdustPrise);
    formData.append("ProductDiscrption", ProductDiscrption);
    formData.append("ProductName", ProductName);
    formData.append("Product_id", Product_id);

    const csrfToken = document.querySelector('input[name="_csrf"]').value;

    axios
      .post("/admin/Post_Edite_Product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "CSRF-Token": csrfToken,
        },
      })
      .then((response) => {
        console.log(response.data);
        Swal.fire("تم الحفظ!", "تم حفظ المنتج بنجاح", "success");
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire("خطأ!", "حدث خطأ أثناء حفظ المنتج", "error");
      });
  }
});
// deleteProduct.addEventListener("click", ()=>{ axios
//   .post("/admin/postDeleteProduct", {
//     headers: {
//       "CSRF-Token": csrfToken,
//     },
//   })
//   .then((response) => {
//     console.log(response.data);
//     Swal.fire("تم الحفظ!", "تم حفظ المنتج بنجاح", "success");
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//     Swal.fire("خطأ!", "حدث خطأ أثناء حفظ المنتج", "error");
//   });

// })
