document.addEventListener("DOMContentLoaded", () => {
    const resultsContainer = document.getElementById("resultsContainer");
    let availableRoles = [
        { id: 1, name: "ادمن" },
        { id: 2, name: "مدير" },
        { id: 4, name: "محرر" },
    ];

    document.getElementById("searchButton").addEventListener("click", function () {
        const query = document.getElementById("searchQuery").value;
        searchUsers(query);
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
            const resultCard = document.createElement("div");
            resultCard.className = "result-card";

            const rolesCheckboxes = availableRoles
                .map((role) => {
                    let checkboxHTML = `
                        <div class="role-checkbox">
                            <input type="checkbox" id="role-${result.id}-${role.id}" name="roles-${result.id}" value="${role.id}" class="role-checkbox-input">
                            <label for="role-${role.id}-${result.id}">${role.name}</label>
                        </div>
                    `;

                    if (result.roleid && result.roleid.includes(role.id)) {
                        checkboxHTML = `
                            <div class="role-checkbox">
                                <input type="checkbox" id="role-${result.id}-${role.id}" name="roles-${result.id}" value="${role.id}" class="role-checkbox-input" checked disabled>
                                <label for="role-${role.id}-${result.id}">${role.name}</label>
                            </div>
                        `;
                    }

                    return checkboxHTML;
                })
                .join("");

            resultCard.innerHTML = `
                <div class="user-info">
                    <img src="../images/${result.imageUrl.split("\\").pop()}" alt="${result.name}" class="user-image">
                    <h4 class="name">${result.name}</h4>
                </div>
                <div class="role-checkboxes">
                    ${rolesCheckboxes}
                </div>
                <button class="btn btn-success add-button" data-user-id="${result.id}">إضافة</button>
            `;

            resultsContainer.appendChild(resultCard);
        });

        addCheckboxEventListeners();
        addAddButtonEventListeners();
    }

    function addCheckboxEventListeners() {
        document.querySelectorAll(".role-checkbox-input").forEach((checkbox) => {
            checkbox.addEventListener("change", (event) => {
                const userId = event.target.getAttribute("name").split("-")[1];
                const checkboxes = document.querySelectorAll(`input[name="roles-${userId}"]`);
                checkboxes.forEach((cb) => {
                    if (cb !== event.target) {
                        cb.checked = false;
                    }
                });
            });
        });
    }

    function addAddButtonEventListeners() {
        document.querySelectorAll(".add-button").forEach((button) => {
            button.addEventListener("click", async (event) => {
                const userId = event.target.getAttribute("data-user-id");
                await addUser(userId);
            });
        });
    }

    async function addUser(userId) {
        const selectedRoleCheckbox = document.querySelector(`input[name="roles-${userId}"]:checked`);
        if (selectedRoleCheckbox && !selectedRoleCheckbox.disabled) {
            const roleId = selectedRoleCheckbox.value;
            try {
                console.log("data", {
                    userId: userId,
                    roleId: roleId,
                });
                const response = await axios.post("/addrole", {
                    userId,
                    roleId
                }, {
                    headers: {
                        "CSRF-Token": document.querySelector('input[name="_csrf"]').value,
                    },
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