// print.js

function printShippingInfo(userId) {
  const shippingInfo = document.getElementById(`shipping-info-${userId}`);
  if (shippingInfo) {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        direction: rtl;
        margin-top: 25px;
    }
    
    .container {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    
    .invoice-header {
        text-align: center;
    }
    
    .invoice-header h1 {
        font-size: 2em;
        margin-bottom: 10px;
    }
    
    .invoice-header .site-logo {
        width: 100px;
        height: auto;
        margin-bottom: 10px;
    }
    
    .invoice-header h4 {
        font-size: 1.5em;
        margin-top: 0;
    }
    
    .invoice-details {
        padding: 10px;
        border-radius: 5px;
        background-color: #fff;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    }
    
    .invoice-details h2 {
        font-size: 1.8em;
        margin-bottom: 20px;
        text-align: center;
    }
    
    .shipping-info {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 10px;
        margin-top: 20px;
        background-color: #f9f9f9;
        border-radius: 8px;
    }
    
    .order-details, .shipping-details {
        padding: 10px;
        border-radius: 5px;
        background-color: #fff;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    }
    
    .order-details h4, .shipping-details h4 {
        margin-top: 0;
        font-size: 1.4em;
        margin-bottom: 10px;
    }
    
    .order-details p, .shipping-details p {
        margin: 5px 0;
        font-size: 14px;
    }
    
    .order-details ul {
        padding: 0;
        list-style-type: none;
    }
    
    .order-details ul li {
        background-color: #eee;
        padding: 5px;
        margin: 5px 0;
        border-radius: 4px;
    }
    
    button {
        background-color: #069a8e;
        color: #fff;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.3s;
        width: 100%;
        margin-top: 15px;
    }
    
    button:hover {
        background-color: #05534d;
    }
    
    @media print {
        @page {
            size: A4;
            margin: 20mm;
        }
    
        body {
            font-family: Arial, sans-serif;
            direction: rtl;
            margin: 0;
            padding: 0;
        }
    
        .shipping-details {
            page-break-after: always;
            display: block;
            margin: 20px;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
            background-color: #fff;
        }
    
        .shipping-details h4 {
            font-size: 1.1em;
            margin-bottom: 10px;
        }
    
        .shipping-details p {
            margin: 5px 0;
            font-size: 14px;
        }
    
        button {
            display: none;
        }
    }
    
    .hide {
        display: none;
    }
          <title>الفاتورة</title>
    </head>
    <body>
    
    <div class="container mt-5">
      <div class="invoice-header text-center mb-4">
        <h1>الموقع</h1>
        <img src="/images/logo.png" alt="موقع" class="img-fluid site-logo">
        <h4>رقم الطلبية: <span id="order-id">12345</span></h4>
      </div>
    
      <div class="invoice-details">
        <h2 class="text-center mb-4">تفاصيل الفاتورة</h2>
        <div class="shipping-info mb-4">
          <div class="order-details p-3 mb-4">
            <h4>تفاصيل الطلب</h4>
            <ul>
              <li>المنتج 1</li>
              <li>المنتج 2</li>
            </ul>
          </div>
          <div class="shipping-details p-3">
            <h4>تفاصيل الشحن</h4>
            <p>اسم المستلم: أنس الأمين</p>
            <p>رقم هاتف المستلم: 914070146</p>
            <p>رقم هاتف المتجر: 914070146</p>
            <h4>بيانات الشحن</h4>
            <p>المدينة: غير متاح</p>
            <p>المنطقة: غير متاح</p>
            <p>سعر التوصيل: غير متاح</p>
            <p>الإجمالي: 252530</p>
          </div>
        </div>
      </div>
      <div class="checkout text-center my-4">
        <button id="print-all-shipping-info">طباعة الفاتورة</button>
      </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="/js/print.js"></script>
    </body>
    </html>
    
    `);
    printWindow.document.write('<div class="shipping-details">');
    printWindow.document.write(shippingInfo.innerHTML);
    printWindow.document.write("</div>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  } else {
    console.error(`No shipping info found for user ${userId}`);
  }
}

function printAllShippingInfo() {
  const shippingInfos = document.querySelectorAll(".shipping-info");
  const printWindow = window.open("", "_blank");
  printWindow.document.write("<html><head><title>طباعة</title>");
  printWindow.document.write(
    "<style>body { font-family: Arial, sans-serif; direction: rtl; } .shipping-info { page-break-after: always; }</style>"
  );
  printWindow.document.write("</head><body>");
  shippingInfos.forEach((info) => {
    printWindow.document.write('<div class="shipping-info">');
    printWindow.document.write(info.innerHTML);
    printWindow.document.write("</div>");
  });
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.print();
}

document
  .getElementById("print-all-shipping-info")
  .addEventListener("click", printAllShippingInfo);

document.querySelectorAll(".shipping-info").forEach((info) => {
  info.classList.add("hide");
});

function toggleDetails(userId) {
  const shippingInfo = document.getElementById(`shipping-info-${userId}`);
  const printButton = document.getElementById(`print-button-${userId}`);
  const prepareButton = document.getElementById(`prepare-button-${userId}`);
  const toggleButton = document.querySelector(
    `.btn-toggle-details[onclick="toggleDetails('${userId}')"]`
  );

  if (shippingInfo.classList.contains("hide")) {
    shippingInfo.classList.remove("hide");
    printButton.classList.remove("hide");
    prepareButton.classList.remove("hide");
    toggleButton.textContent = "إخفاء تفاصيل الطلبية";
  } else {
    shippingInfo.classList.add("hide");
    printButton.classList.add("hide");
    prepareButton.classList.add("hide");
    toggleButton.textContent = "عرض تفاصيل الطلبية";
  }
}

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
