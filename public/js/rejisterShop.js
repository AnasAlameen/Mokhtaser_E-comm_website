function showalert() {
    Swal.fire({
        title: "اضافة المتجر!",
        text: "تم اضافة المتجر بنجاح",
        icon: "success",
        timer: 99999,
    });
}

document.getElementById("all").addEventListener("submit", function (event) {
    event.preventDefault(); // لمنع الإرسال التقليدي للنموذج

    const formData = new FormData(this); // Create FormData from the form element

    console.log("Form Data:", Object.fromEntries(formData.entries()));

    // إرسال البيانات إلى الـ API
    axios.post("http://localhost:3000/Rejister/Check", formData)
        .then((response) => {
            console.log("Response:", response.data);
            showalert();
            if (response.status === 201) {
                window.location.href = response.data.redirectUrl; // إعادة التوجيه باستخدام URL من الرد
            }
        })
        .catch((error) => {
            console.error("Error:", error.response ? error.response.data : error.message);
        });
});
