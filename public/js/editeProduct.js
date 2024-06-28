// editeProduct.js

document.addEventListener('DOMContentLoaded', () => {
  const addImagesButton = document.getElementById('add-images');
  const addColorsButton = document.getElementById('add-colors');
  const saveImageButton = document.getElementById('save_the_image');
  const saveColorsButton = document.getElementById('save_colors');
  const selectedImagesSection = document.getElementById('selected_images');
  const colorsSection = document.getElementById('colors');
  const colorContainerButtom = document.getElementById('color_containerButtom');
  const colorSizeButton = document.getElementById('colorSize');
  const displayContainer = document.getElementById('display-container');
  const form = document.getElementById('all');
  const nextColorButton = document.getElementById('nextColor');
  const saveProductButton = document.getElementById('save-product');
  const addedImages = [];
  const removedImages = [];
  const addedColors = [];
  const removedColors = [];
  let currentColor = {};

  addImagesButton.addEventListener('click', () => {
    selectedImagesSection.classList.toggle('hide');
  });

  addColorsButton.addEventListener('click', () => {
    colorsSection.classList.toggle('hide');
  });

  saveImageButton.addEventListener('click', () => {
    handleImageUpload('ProductImages', 'image1');
  });

  saveColorsButton.addEventListener('click', () => {
    saveColorDetails(true);
  });

  nextColorButton.addEventListener('click', (event) => {
    event.preventDefault();
    saveColorDetails();
    clearColorDetails();
  });

  function handleImageDelete(event) {
    const imageUrl = event.target.getAttribute('data-url');
    removedImages.push(imageUrl);
    event.target.parentElement.remove();
  }

  function handleColorDelete(event) {
    const colorElement = event.target.parentElement;
    const colorId = colorElement.getAttribute('data-id');
    removedColors.push(colorId);
    colorElement.remove();
  }

  document.querySelectorAll('.delete-image').forEach(button => {
    button.addEventListener('click', handleImageDelete);
  });

  document.querySelectorAll('.delete-color').forEach(button => {
    button.addEventListener('click', handleColorDelete);
  });

  colorSizeButton.addEventListener('click', () => {
    colorContainerButtom.classList.toggle('hide');
  });

  document.querySelectorAll('.color-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const color = event.target.getAttribute('data-color');
      selectColor(color);
    });
  });

  document.getElementById('save-variation').addEventListener('click', () => {
    saveVariationDetails();
  });

  function createColorElement(colorItem) {
    const colorElement = document.createElement('div');
    colorElement.classList.add('color-item');
    colorElement.setAttribute('data-id', colorItem.id);
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
    colorElement.querySelector('.delete-color').addEventListener('click', handleColorDelete);
    colorElement.querySelector('.edit-color').addEventListener('click', () => {
      colorElement.querySelector('.color-edit-fields').classList.toggle('hide');
    });
    colorElement.querySelector('.save-edit-color').addEventListener('click', () => {
      const newColor = colorElement.querySelector('.edit-color-input').value;
      const newQuantity = parseInt(colorElement.querySelector('.edit-color-quantity').value);
      const newPrice = parseInt(colorElement.querySelector('.edit-color-price').value);
      colorItem.color = newColor;
      colorItem.quantity = newQuantity;
      colorItem.price = newPrice;
      updateColorDisplay();
    });
    return colorElement;
  }

  function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
  }

  function selectColor(color) {
    currentColor.name = color;
    document.querySelectorAll('.color-btn').forEach(btn => btn.style.border = 'none');
    event.target.style.border = '2px solid black';
  }

  function saveColorDetails(hideSection = false) {
    const color = document.getElementById('colorr').value || currentColor.name;
    const quantity = parseInt(document.getElementById('color_quantity').value);
    const price = parseInt(document.getElementById('color-price').value);
    const colorItem = {
      color,
      quantity,
      price,
      relatedVariants: []
    };
    addedColors.push(colorItem);

    console.log('add color'+ addedColors);
    const colorElement = createColorElement(colorItem);
    displayContainer.appendChild(colorElement);

    if (hideSection) {
      colorsSection.classList.add('hide');
    }

    clearColorDetails();
  }

  function saveVariationDetails() {
    const DimensionsType = document.getElementById('TYPE_OF').value;
    const DimensionsMeger = document.getElementById('meger').value;
    const colorSizeQuantity = parseInt(document.getElementById('Size_color_quantity').value);
    const colorPrice = parseInt(document.getElementById('variation_color_prise').value);

    if (!DimensionsType || !DimensionsMeger || isNaN(colorSizeQuantity) || isNaN(colorPrice)) {
      Swal.fire('الرجاء إدخال جميع تفاصيل المقاس', 'تأكد من إدخال التصنيف، القياس، الكمية والسعر', 'warning');
      return;
    }

    const currentColor = addedColors.find(color => color.color === document.getElementById('colorr').value);

    if (colorSizeQuantity > currentColor.quantity) {
      Swal.fire('الكمية غير متوفرة', 'عدد القطع التي أدخلتها أكثر من عدد القطع الخاصة باللون', 'warning');
      return;
    }

    currentColor.relatedVariants.push({
      id: generateUniqueId(),
      DimensionsType,
      DimensionsMeger,
      qty: colorSizeQuantity,
      price: colorPrice
    });

    currentColor.quantity -= colorSizeQuantity;

    updateColorDisplay();

    document.getElementById('Size_color_quantity').value = '';
    document.getElementById('meger').value = '';
    document.getElementById('variation_color_prise').value = '';
  }

  function updateColorDisplay() {
    displayContainer.innerHTML = '';
    addedColors.forEach(color => {
      const colorElement = createColorElement(color);
      const variantsContainer = colorElement.querySelector('.related-variants');
      color.relatedVariants.forEach(variant => {
        const variantElement = document.createElement('div');
        variantElement.classList.add('size-item');
        variantElement.setAttribute('data-id', variant.id);
        variantElement.innerHTML = `
          <label class="form-label">مقاس: ${variant.DimensionsMeger}</label>
          <label class="form-label">كمية: ${variant.qty}</label>
          <label class="form-label">سعر: ${variant.price}</label>
          <button type="button" class="delete-size" data-id="${variant.id}">X</button>
        `;
        variantsContainer.appendChild(variantElement);
      });
      displayContainer.appendChild(colorElement);
    });
    attachDeleteSizeEvent();
  }

  function attachDeleteSizeEvent() {
    document.querySelectorAll('.delete-size').forEach(button => {
      button.addEventListener('click', handleSizeDelete);
    });
  }

  function handleSizeDelete(event) {
    const sizeId = event.target.getAttribute('data-id');
    const colorElement = event.target.closest('.color-item');
    const colorId = colorElement.getAttribute('data-id');
    const color = addedColors.find(color => color.id === colorId);
    color.relatedVariants = color.relatedVariants.filter(variant => variant.id !== sizeId);
    updateColorDisplay();
  }

  function handleImageUpload(inputId, fieldName) {
    const imageInputs = document.getElementById(inputId);
    if (imageInputs.files.length > 0) {
      for (let i = 0; i < imageInputs.files.length; i++) {
        formData.append(fieldName, imageInputs.files[i]);
      }
      Swal.fire('تم الحفظ!', 'تم الحفظ', 'success');
    } else {
      Swal.fire('لم يتم اختيار أي صورة', 'الرجاء اختيار صور', 'warning');
    }
  }

  saveProductButton.addEventListener('click', (event) => {
    event.preventDefault();
    saveProductDetails();
  });

  document.getElementById('cancel-product').addEventListener('click', (event) => {
    event.preventDefault();
    form.reset();
  });

  function clearColorDetails() {
    currentColor = {};
    document.getElementById('color_quantity').value = '';
    document.getElementById('color-price').value = '';
    document.getElementById('colorr').value = '';
    document.querySelectorAll('.color-btn').forEach(btn => btn.style.border = 'none');
  }

  function saveProductDetails() {
    const formData = new FormData(form);

    formData.append('addedColors', JSON.stringify(addedColors));
    formData.append('removedColors', JSON.stringify(removedColors));
    formData.append('removedImages', JSON.stringify(removedImages));

    fetch('/admin/Post_add_product', {
      method: 'POST',
      body: formData,
      headers: {
        'CSRF-Token': document.querySelector('input[name="_csrf"]').value,
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      Swal.fire('تم الحفظ!', 'تم حفظ المنتج بنجاح', 'success');
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire('خطأ!', 'حدث خطأ أثناء حفظ المنتج', 'error');
    });
  }
});
