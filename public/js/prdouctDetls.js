const images = document.querySelectorAll(".option img");
const images2 = document.querySelectorAll(".grid img");
const libles = document.querySelectorAll(".detals label");
let addTo = document.getElementById("addTo");
let Numbers = document.getElementById("number");
let thenumber;
let thetype;
let theImage;

libles.forEach((label) => {
  label.addEventListener("click", () => {
    libles.forEach((label) => (label.style.border = "none"));

    thetype = label.textContent;

    label.style.border = "2px solid black";
  });
});

let images_urls = [];

images.forEach((image) => {
  image.addEventListener("click", () => {
    const mainImage = document.querySelector(".main_image img");
    mainImage.src = image.src;
    images_urls.push(image.src);
  });
});
let images_urls2 = [];

images2.forEach((image) => {
  image.addEventListener("click", () => {
    images2.forEach((label) => (label.style.border = "none"));

    image.style.border = "2px solid black";
  });
});
const deatls = document.getElementById("details");
const deatls_contaner = document.getElementById("main");
deatls_contaner.classList.add("hide");

deatls.addEventListener("click", () => {
  deatls_contaner.classList.remove("hide");

  deatls.classList.add("hide");
  images.forEach((image) => {
    image.style.border = "none";
  });
});
images2.forEach((image) => {
  image.addEventListener("click", () => {
    images2.forEach((label) => (label.style.border = "none"));

    const mainImage = document.querySelector(".main_image img");
    mainImage.src = image.src;
    theImage = image.src;

    image.style.border = "2px solid black";
  });
});
let userType = localStorage.getItem("userType");
console.log(userType + "this is a user type");

const form = document.getElementById("all");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  thenumber = document.getElementById("number").value;
  total = thenumber * productPrice;
  let userid = localStorage.getItem("userid");
  let formData = new FormData();
  let productId1 = productId;
  let productName1 = productName;
  let productPrice1 = productPrice;
  let seller_id1 = seller_id;

  console.log("Product ID: " + productId1);
  console.log("seller_id1: " + seller_id1);

  console.log("productName: " + productName1);
  console.log("productPrice: " + productPrice1);
  console.log("productimage: " + theImage);
  console.log("thytype: " + thetype);
  console.log("thenumber: " + thenumber);
  console.log("total: " + total);
  console.log("userid: " + userid);

  formData.append("productId", productId1);
  formData.append("seller_id1", seller_id1);

  formData.append("productName", productName1);
  formData.append("productPrice", productPrice1);
  formData.append("theImage", theImage);
  formData.append("thetype", thetype);
  formData.append("thenumber", thenumber);
  formData.append("total", total);
  formData.append("userid", userid);
  console.log(formData);
  const formObject = {};
  formData.forEach((value, key) => {
    formObject[key] = value;
  });

  if (userType !== "seller") {
    console.log(formObject);
    axios
      .post("http://localhost:3050/order/orders", formObject)
      .then(function (response) {
        (response) => console.log(res);
      })
      .catch(function (error) {
        console.log("Error uploading images:", error);
        (error) => console.log(error);
      });
    Swal.fire({
      title: "تم الاضافة الى السلة!",
      text: "تم حفظ المنتج الجديد بنجاح",
      icon: "success",
      timer: 99999,
    });
  } else {
    Swal.fire({
      title: "لا يمكنك الاضافة",
      text: "لا يمكنك الاضافة ب حساب المتجر",
      timer: 99999,
    });
  }

  /**/
});
document.getElementById("buyNow").addEventListener("click", () => {
  event.preventDefault();

  thenumber = document.getElementById("number").value;
  total = thenumber * productPrice;
  let userid = localStorage.getItem("userid");
  let formData = new FormData();
  let productId1 = productId;
  let productName1 = productName;
  let productPrice1 = productPrice;
  let seller_id1 = seller_id;

  console.log("Product ID: " + productId1);
  console.log("seller_id1: " + seller_id1);

  console.log("productName: " + productName1);
  console.log("productPrice: " + productPrice1);
  console.log("productimage: " + theImage);
  console.log("thytype: " + thetype);
  console.log("thenumber: " + thenumber);
  console.log("total: " + total);
  console.log("userid: " + userid);

  formData.append("productId", productId1);
  formData.append("seller_id1", seller_id1);

  formData.append("productName", productName1);
  formData.append("productPrice", productPrice1);
  formData.append("theImage", theImage);
  formData.append("thetype", thetype);
  formData.append("thenumber", thenumber);
  formData.append("total", total);
  formData.append("userid", userid);
  console.log(formData);
  const formObject = {};
  formData.forEach((value, key) => {
    formObject[key] = value;
  });

  if (userid) {
    console.log(formObject);
    axios
      .post("http://localhost:3050/orders/orders", formObject)
      .then(function (response) {
        (response) => console.log(res);
      })
      .catch(function (error) {
        console.log("Error uploading images:", error);
        (error) => console.log(error);
      });
    Swal.fire({
      title: "الف مبروك",
      text: "تمت عملية الشراء بنجاح",
      icon: "success",
      timer: 99999,
    });
  } else {
    Swal.fire({
      title: "لا يمكنك الاضافة",
      text: "لا يمكنك الاضافة ب حساب المتجر",
      timer: 99999,
    });
  }
});

/*

  let user={
    "thenumber":thenumber,
    "thetype":thetype,
    "theImage":theImage,

  }
  fetch("pr.php",{
    "method":"post",
    "headers":{"content-type":"application/json; charset=utf-8"},
    "body":json.stringify(user)
  }).then((res)=>{
    return res.text();


  }).then((data)=>{
    console.log(data);
  })
  function sendValuesToPHP() {

    //let userid = localStorage.getItem("userid");
    //let thenumber = localStorage.getItem("thenumber");

    $.ajax({
      url: "pr.php",
      type: "POST",
      data: {
        userid: userid,
        thenumber: thenumber ,
        theImage:theImage,
        thetype:thetype
      },
      success: function(response) {
        // تنفيذ رد الفعل عند النجاح  
      }
    });
  }*/
