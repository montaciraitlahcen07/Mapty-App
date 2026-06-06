"use strict";
const formElement = document.querySelector(".form");
const containerWorkoutsElement = document.querySelector(".workouts");
const optionsElement = document.querySelector(".options");
const distanceElement = document.querySelector(".distance");
const durationElement = document.querySelector(".duration");
const cadenceElement = document.querySelector(".cadence");
const elevationElement = document.querySelector(".elevation");
const runningElement = document.querySelector(".running");
const cyclingElement = document.querySelector(".cycling");
let workout;
class App {
  #map;
  #latlng;
  #Workouts = [];
  constructor() {
    this._getPosition();
    formElement.addEventListener("submit", this._newWorkout.bind(this));
    optionsElement.addEventListener("change", this._toggleElevationField);
    containerWorkoutsElement.addEventListener(
      "click",
      this._moveToPopup.bind(this),
    );
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          console.log("couldn't get your coordinates");
        },
      );
    }
  }
  _loadMap(Position) {
    this.#map = L.map("map").setView(
      [Position.coords.latitude, Position.coords.longitude],
      13,
    );

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on("click", this._showForm.bind(this), function () {
      console.log("couldn't get your coordinates");
    });
  }
  _showForm(mapEvent) {
    this.#latlng = mapEvent.latlng;
    formElement.classList.add("transition-all");
    formElement.classList.add("duration-[0.5s]");
    formElement.classList.remove("hidden_form");
    distanceElement.focus();
  }
  _toggleElevationField() {
    cadenceElement.closest(".form_row").classList.toggle("hidden");
    elevationElement.closest(".form_row").classList.toggle("hidden");
    elevationElement.value = null;
    cadenceElement.value = null;
  }
  _newWorkout() {
    if (
      +distanceElement.value > 0 &&
      +durationElement.value > 0 &&
      (+cadenceElement.value > 0 ||
        Number.isFinite(parseFloat(elevationElement.value)))
    ) {
      formElement.classList.remove("transition-all");
      formElement.classList.remove("duration-[0.5s]");
      formElement.classList.add("hidden_form");
      L.marker([this.#latlng.lat, this.#latlng.lng])
        .addTo(this.#map)
        .bindPopup(
          L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${optionsElement.value}-popup`,
          }),
        )
        .setPopupContent(
          `${
            optionsElement.value == "running"
              ? `🏃‍♂️ Running on ${new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`
              : `🚴‍♀️ Cycling on ${new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`
          } `,
        )
        .openPopup();
      if (optionsElement.value == "running") {
        this._runningWorkout();
      } else if (optionsElement.value == "cycling") {
        this._cyclingWorkout();
      }
      this.#Workouts.push(workout);
      distanceElement.value = null;
      durationElement.value = null;
      cadenceElement.value = null;
      elevationElement.value = null;
      runningElement.selected = true;
    } else alert("inputs have to be positive numbers!");
  }
  _runningWorkout() {
    workout = new Running(
      distanceElement.value,
      durationElement.value,
      [this.#latlng.lat, this.#latlng.lng],
      cadenceElement.value,
    );
    const htmlWorkout = `<li
          class="workout bg-[#42484D] rounded-[5px] px-9 py-6 mb-7 cursor-pointer grid grid-cols-[1fr_1fr_1fr_1fr] gap-x-6 gap-y-3 border-l-5 border-[#00c46a]"
          data-id=${workout.id}
        >
          <h2
            class="text-[#ececec] workout__title text-[1.7rem] font-semibold col-span-full"
          >
            Running on ${workout.date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </h2>
          <div class="workout__details">
            <span class="workout__icon">🏃&zwj;</span>
            <span class="workout__value text-[#ececec]">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon text-[#ececec]">⏱</span>
            <span class="workout__value text-[#ececec]">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value text-[#ececec]">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value text-[#ececec]">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    formElement.insertAdjacentHTML("afterend", htmlWorkout);
  }
  _cyclingWorkout() {
    workout = new Cycling(
      distanceElement.value,
      durationElement.value,
      [this.#latlng.lat, this.#latlng.lng],
      elevationElement.value,
    );
    const htmlWorkout = `<li
          class="workout bg-[#42484D] rounded-[5px] px-9 py-6 mb-7 cursor-pointer grid grid-cols-[1fr_1fr_1fr_1fr] gap-x-6 gap-y-3 border-l-5 border-[#FFB545]"
          data-id=${workout.id}
        >
          <h2
            class="text-[#ececec] workout__title text-[1.7rem] font-semibold col-span-full"
          >
            Cycling on ${workout.date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </h2>
          <div class="workout__details">
            <span class="workout__icon">🚴‍♀️&zwj;</span>
            <span class="workout__value text-[#ececec]">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon text-[#ececec]">⏱</span>
            <span class="workout__value text-[#ececec]">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value text-[#ececec]">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon text-[#ececec]">⛰</span>
            <span class="workout__value text-[#ececec]">${workout.elevationGain}</span>
            <span class="workout__unit">M</span>
          </div>
        </li>`;
    formElement.insertAdjacentHTML("afterend", htmlWorkout);
  }
  _moveToPopup(e) {
    const target = e.target.closest(".workout");
    if (target?.closest("li")) {
      const elem = this.#Workouts.find(
        (workout) => workout.id == target.dataset.id,
      );
      this.#map.setView(elem.coords, 13, {
        animate: true,
        pan: { duration: 1 },
      });
    }
  }
}
class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }
}
class Running extends Workout {
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(distance, duration, coords, elevationGain) {
    super(distance, duration, coords);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
const app = new App();
