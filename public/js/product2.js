let imageFile2 = [];
let colors = [];
let formData = new FormData();

const selected_images = document.getElementById("selected_images");
selected_images.classList.add("hide");

const ButtonSaveImg = document.getElementById("save_the_image");
const addImage = document.getElementById("add-images");

const colorsCont = document.getElementById("colors");
colorsCont.classList.add("hide");
const bikeColor = document.getElementById("add-colors");
const save_colors = document.getElementById("save_colors");
const nextColor = document.getElementById("nextColor");
let displayContainer = document.getElementById("display-container");
const save_product = document.getElementById("save-product");
let product_category=document.getElementById("product-category").value;
let total_products;
console.log("product_category"+product_category.value)
let btns = document.querySelectorAll(".color-btn");

addImage.addEventListener("click", function () {
  selected_images.classList.remove("hide");
  event.preventDefault();
});

ButtonSaveImg.addEventListener("click", function () {
  selected_images.classList.add("hide");
  event.preventDefault();
  let productQuantity = parseInt(
    document.getElementById("product-quantity").value
  );
  total_products = productQuantity;

  let imageInputs = document.getElementById("ProductImages");

  // زمنه files = imageInputs.files;

  if (imageInputs.files.length > 0) {
    for (let i = 0; i < imageInputs.files.length; i++) {
      //\\\\
      formData.append("image1", imageInputs.files[i]);
    }
    console.log("THIS IS THE FORM DATA IMGE 1");

    console.log(...formData);

    Swal.fire({
      title: "تم الحفظ!",
      text: "تم الحفظ",
      icon: "success",
      timer: 2333,
    });
  } else {
    console.log("No image file selected");
    Swal.fire({
      title: "لم يتم اختيار اي صورة",
      text: "الرجاء  اختيار صور",
      timer: 2333,
      // color:"orange",
    });
  }
});

bikeColor.addEventListener("click", function () {
  colorsCont.classList.remove("hide");
  event.preventDefault();
});
//

let color;

btns.forEach((btn) => {
  btn.addEventListener("click", () => {
    //ازالة جميع الحدود من الصور
    btns.forEach((b) => (b.style.border = "none"));
    event.preventDefault();
    // الحصول ع اللون
    color = btn.dataset.color;

    //وضع حد ع االون المختار
    btn.style.border = "2px solid black";
    borderBtn = btn;
  });
});

//
nextColor.addEventListener("click", (event) => {
  let colorQuantity = parseInt(document.getElementById("qua").value);
  let productQuantity = parseInt(
    document.getElementById("product-quantity").value
  );
  let imageInputs = document.getElementById("ColorImage");
  let DimensionsType = document.getElementById("TYPE_OF").value;
  let DimensionsMeger = document.getElementById("meger").value;

  event.preventDefault();

  if (isNaN(productQuantity)) {
    Swal.fire({
      title: "لم بتم ادخال كمية المنتج المتوفرة",
      text: "ادخل الكمية المتوفرة من المنتج اولا",
      timer: 5555,
    });
  } else {
    //we shold add check if the image or color are empty
    if (colorQuantity > productQuantity) {
      Swal.fire({
        title: "الكمية غير متوفرة",
        text: "ان عدد القطع التي ادخلتها اكثر من عدد القطع المتبقية",
        timer: 5555,
      });
    } else {
      displayContainer.innerHTML = "";

      
      if (imageInputs.files.length > 0) {
        // Image uploaded, add it to the formData
        formData.append("image2", imageInputs.files[0]);
      } else {
        // Image not uploaded, add null to formData
        formData.append("image2", null);
      }
      
      console.log(...formData);

      //we sholid add model showing the colors are chosing and the aplity to delet-->
      //by using the arry and delete the image from the image array by the index number
      colors.push({
        name: color,
        quantity: colorQuantity,
        DimensionsType: DimensionsType,
        DimensionsMeger: DimensionsMeger,
      });
      for (let i = 0; i < colors.length; i++) {
        let colorItem = document.createElement("div");
        colorItem.innerHTML = `
        <label >Color: ${colors[i].name}, Quantity: ${colors[i].quantity}, DimensionsMeger: ${colors[i].DimensionsMeger}, DimensionsType: ${colors[i].DimensionsType}</label>
        <button class="edit-button" data-index="${i}">تعديل</button>
        <button class="delete-button" data-index="${i}">حذف</button>
       `;
        displayContainer.appendChild(colorItem);
      }
      Swal.fire({
        title: "تم خيارات حفظ اللون ",
        text: "اختر اللون التالي",
        icon: "success",
        timer: 2333,
      });

      total_products = productQuantity;
      productQuantity -= colorQuantity;
      document.getElementById("product-quantity").value = productQuantity;
      imageInputs.value = ""; // لمسح الملفات المحددة سابقاً
      document.getElementById("qua").value = "";
    }
    document.getElementById("product-quantity").disabled = true;
    DimensionsType.disabled=true;
  }
  colorQuantity = "";
  DimensionsMeger = "";
  console.log(colors);
});

save_colors.addEventListener("click", function () {
  let colorQuantity = parseInt(document.getElementById("qua").value);
  let productQuantity = parseInt(
    document.getElementById("product-quantity").value
  );
  let imageInputs = document.getElementById("ColorImage");
  let DimensionsType = document.getElementById("TYPE_OF").value;
  let DimensionsMeger = document.getElementById("meger").value;

  if (isNaN(productQuantity)) {
    Swal.fire({
      title: "لم بتم ادخال كمية المنتج المتوفرة",
      text: "ادخل الكمية المتوفرة من المنتج اولا",
      timer: 5555,
    });
  } else {
    //we shold add check if the image or color are empty
    if (colorQuantity > productQuantity) {
      Swal.fire({
        title: "الكمية غير متوفرة",
        text: "ان عدد القطع التي ادخلتها اكثر من عدد القطع المتبقية",
        timer: 5555,
      });
    } else {
      displayContainer.innerHTML = "";

      imageFile2.push(imageInputs.files[0]);
      console.log(imageFile2);
      for (let i = 0; i <= imageFile2.lenth; i++) {
        console.log(imageFile2[i]);
      }
      //we sholid add model showing the colors are chosing and the aplity to delet-->
      //by using the arry and delete the image from the image array by the index number
      colors.push({
        name: color,
        quantity: colorQuantity,
        DimensionsType: DimensionsType,
        DimensionsMeger: DimensionsMeger,
      });
      for (let i = 0; i < colors.length; i++) {
        let colorItem = document.createElement("div");
        colorItem.textContent = `Color: ${colors[i].name}, Quantity: ${colors[i].quantity}`;
        displayContainer.appendChild(colorItem);
      }
    }
    DimensionsType.disabled=false;
  }
  colorsCont.classList.add("hide");
  event.preventDefault();

  Swal.fire({
    title: "تم الحفظ!",
    text: "تم الحفظ",
    icon: "success",
    timer: 2333,
  });
  // تعطيل خاصية الإدخال بعد النقر على الزر
  document.getElementById("product-quantity").disabled = true;

  productQuantity -= colorQuantity;
  document.getElementById("product-quantity").value = productQuantity;
  colorQuantity = "";
  DimensionsMeger = "";
  console.log(colors);
});

////

save_product.addEventListener("click", (e) => {
  {
    const ProductName = document.getElementById("product-name").value;
    const ProductDiscrption = document.getElementById(
      "product-description"
    ).value;
    const PrdustPrise = document.getElementById("product-price").value;
    console.log("total_products   " + total_products);

    formData.append("colors", JSON.stringify(colors));
    formData.append("PrdustPrise", PrdustPrise);
    formData.append("ProductDiscrption", ProductDiscrption);
    formData.append("ProductName", ProductName);
    formData.append("SubCategorie", product_category);


    for (let pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    console.log(PrdustPrise + ",,,,,");
    fetch("http://localhost:3000/admin/Post_add_product", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json)
      .then((data) => console.log(data));
    /*  async function uploadImage(formData) {
        try {
          const response = await axios.post("http://localhost:3000/admin/Post_add_product", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            
            },
          });
          console.log(response.data);
          // هنا يمكنك تخزين مسارات الصور في قاعدة البيانات أو تحديث الواجهة الأمامية
        } catch (error) {
          console.log("Error uploading images:", error);
          console.log(error);
        }
        
      }*/

    Swal.fire({
      title: "تم الحفظ!",
      text: "تم حفظ المنتج الجديد بنجاح",
      icon: "success",
      timer: 2333,
    });

    // استخدام الدالة

    //uploadImage(formData);

  }
});
const cansle = document.getElementById("cancel-product");
cansle.addEventListener("click", (event) => {});
