document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('checkout').addEventListener('click', function(e) {
        e.preventDefault(); // منع السلوك الافتراضي للنموذج

        const checkboxes = document.querySelectorAll('.product-checkbox');
        let selectedProducts = [];
        let totalAmount = 0;

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const productId = checkbox.value;
                const quantityInput = document.getElementById(`quantity_${productId}`);
                const priceElement = document.getElementById(`Prise_${productId}`);
                const VOCIdElement = document.getElementById(`VOCId_${productId}`);
                const VOIdElement = document.getElementById(`VOId_${productId}`);
                const idElement = document.getElementById(`id_${productId}`);

                let price = parseFloat(priceElement.textContent.replace('السعر: $', ''));

                if (quantityInput) {
                    const quantity = Number(quantityInput.value);
                    totalAmount += quantity * price;
                    const ElementPrise = quantity * price;

                    const selectedProduct = {
                        productId: productId,
                        productPrice: price,
                        quantity: quantity,
                        productPrice: ElementPrise,
                        idElement:idElement.value
                    };

                    if (VOCIdElement) {
                        selectedProduct.VOCId = VOCIdElement.value;
                    }

                    if (VOIdElement) {
                        selectedProduct.VOId = VOIdElement.value;
                    }

                    selectedProducts.push(selectedProduct);
                } else {
                    console.error(`Quantity input not found for product ID: ${productId}`);
                }
            }
        });

        if (selectedProducts.length > 0) {
            let formData = new FormData();
            formData.append("selectedProducts", JSON.stringify(selectedProducts));
            console.log("from",selectedProducts)

            axios.post('/cart/ordered', formData, { 
                headers: {
                    "Content-Type": "multipart/form-data",
                    "CSRF-Token": document.querySelector('input[name="_csrf"]').value,
                }
            })
            .then(response => {
                const data = response.data;
                if (data.success) {
                    Swal.fire({
                        title: 'تم إتمام الطلب بنجاح',
                        text: 'سيتم تجهيز طلبك قريباً.',
                        icon: 'success',
                        confirmButtonText: 'موافق'
                    });
                } else {
                    Swal.fire({
                        title: 'حدث خطأ',
                        text: `حدث خطأ أثناء إتمام الطلب: ${data.message}`,
                        icon: 'error',
                        confirmButtonText: 'موافق'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'حدث خطأ',
                    text: 'حدث خطأ أثناء إتمام الطلب.',
                    icon: 'error',
                    confirmButtonText: 'موافق'
                });
            });
        } else {
            Swal.fire({
                title: 'لم يتم اختيار أي عناصر',
                text: 'اختر العناصر التي تريد شرائها',
                icon: 'warning',
                confirmButtonText: 'موافق'
            });
        }

        const totalPriceElement = document.getElementById('totalPrice');
        totalPriceElement.textContent = `المجموع: $${totalAmount.toFixed(2)}`;
    });
});
