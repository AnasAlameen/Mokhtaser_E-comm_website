
async function markAsPrepared(userId) {
  const prepareButton = document.getElementById(`prepare-button-${userId}`);
  const productIds = prepareButton.getAttribute("data-product-ids").split(",");

  console.log(`Product IDs for user ${userId}:`, productIds);

  prepareButton.textContent = "✔";
  prepareButton.disabled = true;

  try {
    let formData = new FormData();
    formData.append("productIds", JSON.stringify(productIds));

    await axios.post("http://localhost:3000/cart/orderRedy", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "CSRF-Token": document.querySelector('input[name="_csrf"]').value,
      },
    });

    Swal.fire({
      title: "تم تجهيز الطلبية",
      text: "انتقل الى الشحنات ل متابعة تفاصيل الطلبية",
      icon: "success",
      timer: 3000,
    });
  } catch (error) {
    console.error(error);
    showError("حدث خطأ أثناء عملية الشراء");
  }
}

function showError(message) {
  Swal.fire({
    title: "خطأ",
    text: message,
    icon: "error",
    timer: 3000,
  });
}