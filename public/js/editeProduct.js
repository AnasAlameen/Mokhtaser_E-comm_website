// scripts/editProduct.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('edit-product-form');
  const addColorBtn = document.getElementById('add-color-btn');
  const addSizeBtn = document.getElementById('add-size-btn');
  const colorsSection = document.getElementById('colors-section');
  const sizesSection = document.getElementById('sizes-section');

  addColorBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const colorItem = document.createElement('div');
    colorItem.classList.add('color-item', 'p-3', 'border', 'mb-2');
    colorItem.innerHTML = `
      <label class="form-label">Color: <input type="text" class="form-control" data-type="color-name"></label>
      <label class="form-label">Quantity: <input type="number" class="form-control" data-type="color-quantity"></label>
      <label class="form-label">Price: <input type="number" class="form-control" data-type="color-price"></label>
      <button class="remove-color-btn btn btn-danger mt-2">Remove</button>
    `;
    colorsSection.insertBefore(colorItem, addColorBtn);
    colorItem.querySelector('.remove-color-btn').addEventListener('click', (e) => {
      e.preventDefault();
      colorItem.remove();
    });
  });

  addSizeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const sizeItem = document.createElement('div');
    sizeItem.classList.add('size-item', 'p-3', 'border', 'mb-2');
    sizeItem.innerHTML = `
      <label class="form-label">Size: <input type="text" class="form-control" data-type="size-value"></label>
      <label class="form-label">Quantity: <input type="number" class="form-control" data-type="size-quantity"></label>
      <label class="form-label">Price: <input type="number" class="form-control" data-type="size-price"></label>
      <button class="remove-size-btn btn btn-danger mt-2">Remove</button>
    `;
    sizesSection.insertBefore(sizeItem, addSizeBtn);
    sizeItem.querySelector('.remove-size-btn').addEventListener('click', (e) => {
      e.preventDefault();
      sizeItem.remove();
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('_csrf', document.querySelector('input[name="_csrf"]').value);
    formData.append('ProductName', document.getElementById('product-name').value);
    formData.append('ProductDiscrption', document.getElementById('product-description').value);
    formData.append('PrdustPrise', document.getElementById('product-price').value);
    formData.append('SubCategorie', document.getElementById('product-category').value);

    const colors = [];
    document.querySelectorAll('.color-item').forEach(item => {
      const color = {
        name: item.querySelector('[data-type="color-name"]').value,
        quantity: parseInt(item.querySelector('[data-type="color-quantity"]').value),
        price: parseInt(item.querySelector('[data-type="color-price"]').value)
      };
      colors.push(color);
    });
    formData.append('colors', JSON.stringify(colors));

    const sizes = [];
    document.querySelectorAll('.size-item').forEach(item => {
      const size = {
        DimensionsType: 'size',
        size: item.querySelector('[data-type="size-value"]').value,
        quantity: parseInt(item.querySelector('[data-type="size-quantity"]').value),
        price: parseInt(item.querySelector('[data-type="size-price"]').value)
      };
      sizes.push(size);
    });
    formData.append('sizes', JSON.stringify(sizes));

    // Handling images
    const images = document.getElementById('product-images').files;
    for (let i = 0; i < images.length; i++) {
      formData.append('image1', images[i]);
    }

    try {
      const response = await fetch(`/edit-product/${productId}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert('Product updated successfully!');
      } else {
        alert('Error updating product: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating product');
    }
  });
});
