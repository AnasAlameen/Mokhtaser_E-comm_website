document.addEventListener('DOMContentLoaded', function () {
    let deletedCategories = [];
    let deletedSubcategories = [];

    function loadCategories() {
        axios.get('/categories')
            .then(function (response) {
                const categories = response.data;
                const container = document.querySelector('.container');
                container.innerHTML = ''; // مسح المحتوى الحالي
                const categoryContainer = document.createElement('div');

                categories.forEach((category) => {
                    const categoryItem = document.createElement('div');
                    categoryItem.classList.add('category-item', 'mb-4');

                    // الفئة الرئيسية
                    const mainCategoryHtml = `
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <img src="${category.url}" alt="${category.name}" class="img-thumbnail" width="50" height="50">
                                <strong>${category.name}</strong>
                            </div>
                            <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.id})">X</button>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-secondary btn-sm" data-category-id="${category.id}" data-bs-toggle="modal" data-bs-target="#addSubcategoryModal">إضافة فئة فرعية جديدة</button>
                        </div>
                        <ul class="list-group mt-3">
                            ${category.subcategories.map((sub) => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <img src="${sub.image}" alt="${sub.name}" class="img-thumbnail" width="50" height="50">
                                        ${sub.name}
                                    </div>
                                    <button class="btn btn-danger btn-sm" onclick="deleteSubcategory(${category.id}, ${sub.id})">X</button>
                                </li>
                            `).join('')}
                        </ul>
                    `;

                    categoryItem.innerHTML = mainCategoryHtml;
                    categoryContainer.appendChild(categoryItem);
                });

                container.appendChild(categoryContainer);
            })
            .catch(function (error) {
                console.error('Error fetching categories:', error);
            });
    }

    loadCategories();

    // إضافة فئة رئيسية جديدة
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

    // إضافة فئة فرعية جديدة
    document.getElementById("addSubcategoryModal").addEventListener('show.bs.modal', function (e) {
        const button = e.relatedTarget;
        const categoryId = button.getAttribute('data-category-id');
        const modal = e.target;
        modal.querySelector('form').dataset.categoryId = categoryId;
    });

    document.getElementById("addSubcategoryModal").querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        const categoryId = e.target.dataset.categoryId;
        const name = document.getElementById(`subcategoryName`).value;
        const imageFile = document.getElementById(`subcategoryImage`).files[0];
        const formData = new FormData();
        formData.append('name', name);
        formData.append('image', imageFile);
        formData.append('parentId', categoryId);
        const csrfToken = document.querySelector('input[name="_csrf"]').value;

        axios.post('/admin/subCategories', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                "CSRF-Token": csrfToken,
            }
        })
            .then(function (response) {
                console.log(response.data);
                loadCategories(); // إعادة تحميل الفئات بعد الإضافة
                document.querySelector(`#addSubcategoryModal form`).reset();
                document.querySelector(`#addSubcategoryModal .btn-close`).click();
            })
            .catch(function (error) {
                console.error('Error adding subcategory:', error);
            });
    });

    // حذف فئة رئيسية
    window.deleteCategory = function (categoryId) {
        deletedCategories.push(categoryId);
        loadCategories();
    };

    // حذف فئة فرعية
    window.deleteSubcategory = function (categoryId, subcategoryId) {
        deletedSubcategories.push(subcategoryId);
        loadCategories();
    };

    // زر حفظ كافة التعديلات
    document.getElementById("saveChanges").addEventListener('click', function () {
        const csrfToken = document.querySelector('input[name="_csrf"]').value;

        axios.post('/admin/saveChanges', {
            deletedCategories: deletedCategories,
            deletedSubcategories: deletedSubcategories
        }, {
            headers: {
                "CSRF-Token": csrfToken,
            }
        })
            .then(function (response) {
                console.log('Changes saved successfully:', response.data);
                loadCategories();
                deletedCategories = [];
                deletedSubcategories = [];
            })
            .catch(function (error) {
                console.error('Error saving changes:', error);
            });
    });
});
