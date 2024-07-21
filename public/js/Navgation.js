document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('header-toggle').addEventListener('click', function() {
      document.getElementById('sidebar').classList.toggle('show-sidebar');
  });

  function closeNav() {
      document.getElementById('sidebar').classList.remove('show-sidebar');
  }

  function toggleStoreList() {
      const storeList = document.getElementById('storeList');
      storeList.classList.toggle('active');
      const arrow = document.getElementById('toggleArrow');
      arrow.classList.toggle('ri-arrow-down-s-line');
      arrow.classList.toggle('ri-arrow-right-s-line');
  }

  // يمكنك إضافة هذا السطر لتحديد الزر الذي يستدعي الدالة `toggleStoreList`
  document.getElementById('toggleStoreButton').addEventListener('click', toggleStoreList);
});
