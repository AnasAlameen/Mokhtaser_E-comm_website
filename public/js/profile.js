//     function editProfile() {
//            Swal.fire({
//     title: 'تعديل البيانات الشخصية',
//     html: `
//         <div class="edit-profile-container">
//             <div class="profile-image-container">
//                 <img id="current-profile-pic" src="<%= getUserInformations[0].ProfileImage %>" alt="صورة الملف الشخصي" class="rounded-circle">
//                 <input type="file" id="new-profile-pic" class="form-control-file" accept="image/*">
//                 <input type="hidden" id="current-profile-image" value="<%= getUserInformations[0].ProfileImage %>">
//             </div>
//             <div class="form-group">
//                 <input id="swal-input1" class="form-control" placeholder="الاسم الأول" value="<%= getUserInformations[0].FirstName %>">
//             </div>
//             <div class="form-group">
//                 <input id="swal-input2" class="form-control" placeholder="الاسم الأخير" value="<%= getUserInformations[0].LastName %>">
//             </div>
//             <div class="form-group">
//                 <input id="swal-input3" class="form-control" placeholder="تاريخ الميلاد" value="<%= getUserInformations[0].birth_date ? getUserInformations[0].birth_date.toISOString().split('T')[0] : '' %>" type="date">
//             </div>
//             <button class="btn btn-primary" onclick="getUserLocation()">تحديد الموقع</button>
//             <div id="location-fields" class="mt-3">
//                 <div class="form-group">
//                     <input id="city" class="form-control" placeholder="المدينة" value="<%= products[0].City %>">
//                 </div>
//                 <div class="form-group">
//                     <input id="area" class="form-control" placeholder="المنطقة" value="<%= products[0].area %>">
//                 </div>
//                 <div id="map" style="height: 200px;"></div>
//                 <input id="latitude" type="hidden" value="<%= products[0].lasttiud %>">
//                 <input id="longitude" type="hidden" value="<%= products[0].longtiud %>">
//             </div>
//         </div>
//     `,
//     focusConfirm: false,
//     showCancelButton: true,
//     confirmButtonText: 'تحديث',
//     cancelButtonText: 'إلغاء',
//     customClass: {
//         container: 'edit-profile-swal-container',
//         popup: 'edit-profile-swal-popup',
//         header: 'edit-profile-swal-header',
//         title: 'edit-profile-swal-title',
//         closeButton: 'edit-profile-swal-close',
//         content: 'edit-profile-swal-content',
//         confirmButton: 'edit-profile-swal-confirm',
//         cancelButton: 'edit-profile-swal-cancel'
//     },
//     didOpen: () => {
//         initMap();
//     },
//     preConfirm: () => {
//     return {
//         firstName: document.getElementById('swal-input1').value,
//         lastName: document.getElementById('swal-input2').value,
//         birthDate: document.getElementById('swal-input3').value,
//         profileImage: document.getElementById('new-profile-pic').files.length > 0 ? document.getElementById('new-profile-pic').files[0] : null,
//         currentProfileImage: document.getElementById('current-profile-image').value,
//         city: document.getElementById('city').value,
//         area: document.getElementById('area').value,
//         latitude: document.getElementById('latitude').value,
//         longitude: document.getElementById('longitude').value
//     };
// },
// }).then((result) => {
//     if (result.isConfirmed) {
//         const formData = new FormData();
//         formData.append('firstName', result.value.firstName);
//         formData.append('lastName', result.value.lastName);
//         formData.append('birthDate', result.value.birthDate);
//         if (result.value.profileImage) {
//             formData.append('profileImage', result.value.profileImage);
//         } else {
//             formData.append('currentProfileImage', result.value.currentProfileImage);
//         }
//         formData.append('city', result.value.city);
//         formData.append('area', result.value.area);
//         formData.append('latitude', result.value.latitude);
//         formData.append('longitude', result.value.longitude);
//         const csrfToken = document.querySelector('input[name="_csrf"]').value;

//         axios.post('/user/profile/update', formData, {
//             headers: {
//                 "CSRF-Token": csrfToken
//             }
//         })
//         .then(response => {
//             if (response.data.success) {
//                 Swal.fire({
//                     icon: 'success',
//                     title: 'تم التحديث!',
//                     text: 'تم تحديث البيانات الشخصية بنجاح.',
//                     confirmButtonText: 'حسناً'
//                 }).then(() => {
//                     location.reload();
//                 });
//             } else {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'خطأ',
//                     text: 'حدث خطأ أثناء التحديث.',
//                     confirmButtonText: 'حسناً'
//                 });
//             }
//         })
//         .catch(error => {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'خطأ',
//                 text: 'حدث خطأ أثناء التحديث.',
//                 confirmButtonText: 'حسناً'
//             });
//         });
//     }
// });
//         }
//         function initMap() {
//             const lat = parseFloat(document.getElementById('latitude').value) || 32.281433;
//             const lng = parseFloat(document.getElementById('longitude').value) || 14.517987;
//             const mapOptions = {
//                 center: { lat, lng },
//                 zoom: 12,
//                 mapTypeId: "satellite",
//             };
            
//             const map = new google.maps.Map(document.getElementById("map"), mapOptions);
            
//             let marker = new google.maps.Marker({
//                 position: { lat, lng },
//                 map: map,
//                 draggable: true
//             });

//             google.maps.event.addListener(marker, 'dragend', function(event) {
//                 document.getElementById('latitude').value = event.latLng.lat();
//                 document.getElementById('longitude').value = event.latLng.lng();
//             });

//             map.addListener("click", (e) => {
//                 marker.setPosition(e.latLng);
//                 document.getElementById('latitude').value = e.latLng.lat();
//                 document.getElementById('longitude').value = e.latLng.lng();
//             });
//         }

//         function getUserLocation() {
//             if (navigator.geolocation) {
//                 navigator.geolocation.getCurrentPosition(
//                     (position) => {
//                         const userLocation = {
//                             lat: position.coords.latitude,
//                             lng: position.coords.longitude,
//                         };
//                         document.getElementById('latitude').value = userLocation.lat;
//                         document.getElementById('longitude').value = userLocation.lng;
//                         initMap();
//                     },
//                     () => {
//                         alert("تعذر الوصول إلى موقعك الحالي.");
//                     }
//                 );
//             } else {
//                 alert("المتصفح لا يدعم الحصول على الموقع الحالي.");
//             }
//         }