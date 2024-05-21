let map;
let marker;

async function initMap() {
  map = await new google.maps.Map(document.getElementById("map"), {
    center: { lat: 32.281433, lng: 14.517987 },
    zoom: 12,
    mapTypeId: "satellite",
  });
  map.addListener("click", (e) => {
    placeMarker(e.latLng);
    updateCoordinates(e.latLng.lat(), e.latLng.lng());
  });

}

function placeMarker(location) {
  if (marker && marker.setMap) {
    marker.setMap(null);
  }

  marker = new google.maps.Marker({
    position: location,
    map: map,
  });

  map.panTo(location);
}

function updateCoordinates(latitude, longitude) {
  document.getElementById('latitude').value = latitude;
  document.getElementById('longitude').value = longitude;
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        placeMarker(userLocation);
        updateCoordinates(userLocation.lat, userLocation.lng);
      },
      () => {
        alert("تعذر الوصول إلى موقعك الحالي.");
      }
    );
  } else {
    alert("المتصفح لا يدعم الحصول على الموقع الحالي.");
  }
}
function showalert(){
  Swal.fire({
title: "اضافة المتجر!",
text: "تم اضافة المتجر بنجاح",
icon: "success",
timer: 99999,

});
location.reload();




 }
 


