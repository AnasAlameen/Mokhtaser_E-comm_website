document.addEventListener("DOMContentLoaded", () => {
    const resultsContainer = document.getElementById("resultsContainer");
    const searchButton = document.getElementById("searchButton");
    const searchQuery = document.getElementById("searchQuery");
    
    const availableRoles = [
        { id: 1, name: "ادمن" },
        { id: 2, name: "مدير" },
        { id: 4, name: "محرر" },
    ];

    // حدث البحث عن المستخدمين
    searchButton.addEventListener("click", () => {
        console.log(searchQuery.value+"mmmmmmmmmm")

        searchUsers(searchQuery.value);
    });
    async function searchUsers(query) {
        try {
            const response = await axios.get(`/search?q=${encodeURIComponent(query)}`);
            displayResults(response.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                resultsContainer.innerHTML = "<p>لا توجد نتائج</p>";
            } else {
                console.error("Error fetching search results:", error);
            }
        }
    }

    // عرض النتائج
    function displayResults(results) {
        resultsContainer.innerHTML = "";

        if (results.length === 0) {
            Swal.fire({
                icon: "error",
                title: "لا توجد نتائج",
                text: "لم يتم العثور على أي نتائج للبحث المحدد.",
            });
            return;
        }

        results.forEach((result) => {
            const resultCard = createResultCard(result);
            resultsContainer.appendChild(resultCard);
        });

        addCheckboxEventListeners();
        addAddButtonEventListeners();
    }

    // إنشاء بطاقة النتائج
    function createResultCard(result) {
        const resultCard = document.createElement("div");
        resultCard.className = "result-card";

        const rolesCheckboxes = availableRoles.map(role => createRoleCheckbox(result, role)).join("");

        resultCard.innerHTML = `
            <div class="user-info">
                <img src="../images/${result.imageUrl.split("\\").pop()}" alt="${result.name}" class="user-image">
                <h4 class="name">${result.name}</h4>
            </div>
            <div class="role-checkboxes">
                ${rolesCheckboxes}
            </div>
            <button class="btn btn-success add-button" data-user-id="${result.id}" ${result.roleid && result.roleid.includes(1) ? 'disabled' : ''}>إضافة</button>
        `;

        return resultCard;
    }

    // إنشاء مربعات اختيار الأدوار
    function createRoleCheckbox(result, role) {
        let checkboxHTML = `
            <div class="role-checkbox">
                <input type="checkbox" id="role-${result.id}-${role.id}" name="roles-${result.id}" value="${role.id}" class="role-checkbox-input" ${result.roleid && result.roleid.includes(1) ? 'disabled' : ''}>
                <label for="role-${role.id}-${result.id}">${role.name}</label>
            </div>
        `;

        if (result.roleid && result.roleid.includes(role.id)) {
            checkboxHTML = `
                <div class="role-checkbox">
                    <input type="checkbox" id="role-${result.id}-${role.id}" name="roles-${result.id}" value="${role.id}" class="role-checkbox-input" checked ${result.roleid.includes(1) ? 'disabled' : ''}>
                    <label for="role-${role.id}-${result.id}">${role.name}</label>
                </div>
            `;
        }

        return checkboxHTML;
    }

    // إضافة مستمعين لمربعات الاختيار
    function addCheckboxEventListeners() {
        document.querySelectorAll(".role-checkbox-input").forEach(checkbox => {
            checkbox.addEventListener("change", (event) => {
                const userId = event.target.getAttribute("name").split("-")[1];
                document.querySelectorAll(`input[name="roles-${userId}"]`).forEach(cb => {
                    if (cb !== event.target) {
                        cb.checked = false;
                    }
                });
            });
        });
    }

    // إضافة مستمعين لأزرار الإضافة
    function addAddButtonEventListeners() {
        document.querySelectorAll(".add-button").forEach(button => {
            button.addEventListener("click", async (event) => {
                const userId = event.target.getAttribute("data-user-id");
                await addUser(userId);
            });
        });
    }

    // إضافة دور للمستخدم مع تحذير عند اختيار دور الادمن
    async function addUser(userId) {
        const selectedRoleCheckbox = document.querySelector(`input[name="roles-${userId}"]:checked`);
        if (selectedRoleCheckbox && !selectedRoleCheckbox.disabled) {
            const roleId = selectedRoleCheckbox.value;
            
            if (roleId == 1) { // إذا كان الدور المحدد هو الادمن
                const confirmation = await Swal.fire({
                    icon: "warning",
                    title: "تحذير",
                    text: "تعيين دور 'ادمن' غير قابل للتعديل. هل أنت متأكد أنك تريد الاستمرار؟",
                    showCancelButton: true,
                    confirmButtonText: "نعم، أضف الدور",
                    cancelButtonText: "إلغاء"
                });

                if (!confirmation.isConfirmed) {
                    return; // إلغاء العملية إذا لم يتم التأكيد
                }
            }

            try {
                const response = await axios.post("/addrole", { userId, roleId }, {
                    headers: { "CSRF-Token": document.querySelector('input[name="_csrf"]').value }
                });
                Swal.fire({
                    icon: "success",
                    title: "تمت الإضافة",
                    text: "تمت إضافة الدور للمستخدم بنجاح.",
                });
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "خطأ",
                    text: "حدث خطأ أثناء إضافة الدور للمستخدم.",
                });
            }
        } else {
            Swal.fire({
                icon: "warning",
                title: "لم يتم اختيار أي دور",
                text: "يرجى اختيار دور لإضافته للمستخدم او المستخدم يملط هذا الدور من قبل.",
            });
        }
    }
});
