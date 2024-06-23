document.addEventListener("DOMContentLoaded", function () {
    const headerToggle = document.getElementById('header-toggle');
    const sidebar = document.getElementById('sidebar');

    if (headerToggle && sidebar) {
        headerToggle.addEventListener('click', () => {
            if (sidebar.style.right === "0px") {
                sidebar.style.right = "-250px";
            } else {
                sidebar.style.right = "0px";
            }
        });
    }
});

function closeNav() {
    document.getElementById("sidebar").style.right = "-250px";
}
