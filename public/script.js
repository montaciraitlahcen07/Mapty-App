"use strict";
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (Position) {
      const map = L.map("map").setView(
        [Position.coords.latitude, Position.coords.longitude],
        13,
      );

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker([Position.coords.latitude, Position.coords.longitude])
        .addTo(map)
        .bindPopup(
          L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: "running-popup",
          }),
        )
        .setPopupContent("Workout")
        .openPopup();
      map.on(
        "click",
        function (mapEvent) {
          const { lat, lng } = mapEvent.latlng;
          L.marker([lat, lng])
            .addTo(map)
            .bindPopup(
              L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: "running-popup",
              }),
            )
            .setPopupContent("Workout")
            .openPopup();
        },
        function () {
          console.log("couldn't get your cordinates'");
        },
      );
    },
    function () {
      console.log("couldn't get your cordinates");
    },
  );
}
