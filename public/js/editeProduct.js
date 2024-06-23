document.addEventListener('DOMContentLoaded', () => {
    const selectedImagesDiv = document.getElementById("selected_images");
    const saveImageBtn = document.getElementById("save_the_image");
    const addImageBtn = document.getElementById("add-images");
    const combinationsCont = document.getElementById("combinations");
    const addCombinationBtn = document.getElementById("add-combination");
    const saveCombinationBtn = document.getElementById("save-combination");
    const displayContainer = document.getElementById("all-combinations-display");
    const saveProductBtn = document.getElementById("save-product");
    const form = document.getElementById("all");
  
    let combinations = {};
    let formData = new FormData();
    const deletedImages = [];
    const deletedCombinations = [];
  
    addImageBtn.addEventListener("click", () => {
      selectedImagesDiv.classList.remove("hide");
    });
  
    saveImageBtn.addEventListener("click", () => {
      selectedImagesDiv.classList.add("hide");
      handleImageUpload("ProductImages", formData, "image1");
    });
  
    addCombinationBtn.addEventListener("click", () => {
      combinationsCont.classList.remove("hide");
    });
  
    saveCombinationBtn.addEventListener("click", (event) => {
      event.preventDefault();
      saveCombinationDetails();
    });
  
    saveProductBtn.addEventListener("click", (event) => {
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
        Swal.fire("لم يتم اختيار اي صورة", "الرجاء اختيار صور", "warning");
      }
    }
  
    function saveCombinationDetails() {
      const colorId = document.getElementById("combination-variant").value;
      const sizeValue = document.getElementById("combination-value").value;
      const sizeQuantity = parseInt(document.getElementById("combination-quantity").value);
      const sizePrice = parseInt(document.getElementById("combination-price").value);
  
      if (colorId && sizeValue && !isNaN(sizeQuantity) && !isNaN(sizePrice)) {
        if (!combinations[colorId]) {
          combinations[colorId] = {
            color: document.querySelector(`#combination-variant option[value="${colorId}"]`).textContent,
            sizes: []
          };
        }
        combinations[colorId].sizes.push({
          size: sizeValue,
          qty: sizeQuantity,
          price: sizePrice
        });
  
        updateCombinationDisplay();
        combinationsCont.classList.add("hide");
        Swal.fire("تم حفظ التوليفة", "اختر توليفة جديدة", "success");
      } else {
        Swal.fire("لم يتم ادخال بيانات التوليفة بشكل صحيح", "الرجاء ملء جميع الحقول", "warning");
      }
    }
  
    function updateCombinationDisplay() {
      displayContainer.innerHTML = "";
      Object.keys(combinations).forEach((colorId) => {
        const color = combinations[colorId];
        color.sizes.forEach((size, index) => {
          let combinationItem = document.createElement("div");
          combinationItem.innerHTML = `
            <label>اللون: ${color.color}, الحجم: ${size.size}, الكمية: ${size.qty}, السعر: ${size.price}</label>
            <button class="edit-button" data-color-id="${colorId}" data-index="${index}">تعديل</button>
            <button class="delete-button" data-color-id="${colorId}" data-index="${index}">×</button>
          `;
          displayContainer.appendChild(combinationItem);
        });
      });
    }
  
    function saveProductDetails() {
      const ProductName = document.getElementById("product-name").value;
      const ProductDescription = document.getElementById("product-description").value;
      const ProductPrice = document.getElementById("product-price").value;
      const productCategory = document.getElementById("product-category").value;
  
      formData.append("combinations", JSON.stringify(combinations));
      formData.append("ProductPrice", ProductPrice);
      formData.append("ProductDescription", ProductDescription);
      formData.append("ProductName", ProductName);
      formData.append("ProductCategory", productCategory);
      
      const formObject = {};
      formData.forEach((value, key) => {
        formObject[key] = value;
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
  
    document.querySelectorAll('.delete-image').forEach(button => {
      button.addEventListener('click', () => {
        const url = button.getAttribute('data-url');
        deletedImages.push(url);
        button.parentElement.remove();
      });
    });
  
    document.querySelectorAll('.delete-option').forEach(button => {
      button.addEventListener('click', () => {
        const colorId = button.getAttribute('data-color-id');
        const index = button.getAttribute('data-index');
        combinations[colorId].sizes.splice(index, 1);
        if (combinations[colorId].sizes.length === 0) {
          delete combinations[colorId];
        }
        updateCombinationDisplay();
      });
    });
  
    saveProductBtn.addEventListener('click', () => {
      const deletedImagesInput = document.createElement('input');
      deletedImagesInput.type = 'hidden';
      deletedImagesInput.name = 'deletedImages';
      deletedImagesInput.value = JSON.stringify(deletedImages);
      form.appendChild(deletedImagesInput);
  
      const deletedCombinationsInput = document.createElement('input');
      deletedCombinationsInput.type = 'hidden';
      deletedCombinationsInput.name = 'deletedCombinations';
      deletedCombinationsInput.value = JSON.stringify(deletedCombinations);
      form.appendChild(deletedCombinationsInput);
    });
  });
  