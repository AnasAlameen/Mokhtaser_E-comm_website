document.addEventListener('DOMContentLoaded', function () {
   
  
    document.getElementById("addMainCategori").addEventListener('click', function (e) {
      e.preventDefault();
      const name = document.getElementById("MainCategoriName").value;
      const imageFile = document.getElementById("MainCategoriNameImage").files[0];
      const formData = new FormData();
      formData.append('name', name);
      formData.append('image', imageFile);
      const csrfToken = document.querySelector('input[name="_csrf"]').value;
  
      axios.post('/admin/categories', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
              "CSRF-Token": csrfToken,
          }
      })
      .then(function (response) {
          console.log(response.data);
          loadCategories(); // إعادة تحميل الفئات بعد الإضافة
          document.querySelector('#addCategoryModal form').reset();
          document.querySelector('#addCategoryModal .btn-close').click();
      })
      .catch(function (error) {
          console.error('Error adding category:', error);
      });
    });
  
    document.querySelectorAll(".add-subcategory-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const categoryId = button.dataset.categoryId;
            document.querySelector("#addSubcategoryModal .btn-primary").dataset.categoryId = categoryId;
        });
    });

    document.querySelector("#addSubcategoryModal .btn-primary").addEventListener("click", (event) => {
        event.preventDefault();
        const categoryId = event.target.dataset.categoryId;
        const subcategoryName = document.getElementById("subcategoryName").value;
        const subcategoryImageFile = document.getElementById("subcategoryImage").files[0];
        console.log("data",{
            categoryId:categoryId,
            subcategoryName:subcategoryName,
            subcategoryImageFile:subcategoryImageFile
        })
        const formData = new FormData();
        formData.append('MainId', categoryId);
        formData.append('name', subcategoryName);
        formData.append('image', subcategoryImageFile);
        const csrfToken = document.querySelector('input[name="_csrf"]').value;

        axios.post(`/admin/subCategories`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                "CSRF-Token": csrfToken,
            }
        })
        .then(function (response) {
            console.log(response.data);
            loadCategories(); // إعادة تحميل الفئات بعد الإضافة
            document.querySelector(`#addSubcategoryModal-${categoryId} form`).reset();
            document.querySelector(`#addSubcategoryModal-${categoryId} .btn-close`).click();
        })
        .catch(function (error) {
            console.error('Error adding subcategory:', error);
        });
    });
    document.querySelectorAll('.category-item .btn-danger').forEach(button => {
        button.addEventListener('click', function (e) {
          const categoryId = e.target.value;
          const csrfToken = document.querySelector('input[name="_csrf"]').value;
    
          axios.delete(`/admin/categories/${categoryId}`, {
            headers: {
              "CSRF-Token": csrfToken
            }
          })
          .then(response => {
            console.log('Category deleted:', response.data);
            loadCategories(); // إعادة تحميل الفئات بعد الحذف
          })
          .catch(error => {
            console.error('Error deleting category:', error);
          });
        });
      });
    
      // دالة لحذف الفئة الفرعية
      document.querySelectorAll('.list-group-item .btn-danger').forEach(button => {
        button.addEventListener('click', function (e) {
          const subcategoryId = e.target.value;
          const csrfToken = document.querySelector('input[name="_csrf"]').value;
    
          axios.delete(`/admin/subCategories/${subcategoryId}`, {
            headers: {
              "CSRF-Token": csrfToken
            }
          })
          .then(response => {
            console.log('Subcategory deleted:', response.data);
            loadCategories(); // إعادة تحميل الفئات بعد الحذف
          })
          .catch(error => {
            console.error('Error deleting subcategory:', error);
          });
        });
      });
    
    
    
  });
  