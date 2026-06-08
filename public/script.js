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
  #markers = new Map();
  constructor() {
    this._getPosition();
    this._getLocaleStorage();
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
    // render Workouts marker from local storage
    this.#Workouts.forEach((workout) => {
      this._renderWorkoutMarker(workout);
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
      if (optionsElement.value == "running") {
        workout = new Running(
          distanceElement.value,
          durationElement.value,
          [this.#latlng.lat, this.#latlng.lng],
          cadenceElement.value,
        );
      } else if (optionsElement.value == "cycling") {
        workout = new Cycling(
          distanceElement.value,
          durationElement.value,
          [this.#latlng.lat, this.#latlng.lng],
          elevationElement.value,
        );
      }
      formElement.classList.remove("transition-all");
      formElement.classList.remove("duration-[0.5s]");
      formElement.classList.add("hidden_form");
      this._renderWorkoutMarker(workout);
      this._renderWorkout(workout);
      this.#Workouts.push(workout);
      this._setLocaleStorage();
      distanceElement.value = null;
      durationElement.value = null;
      cadenceElement.value = null;
      elevationElement.value = null;
      runningElement.selected = true;
    } else alert("inputs have to be positive numbers!");
  }
  _runningWorkout(workout) {
    const htmlWorkout = `<li
          class="workout bg-[#42484D] rounded-[5px] px-9 py-6 mb-7 cursor-pointer grid grid-cols-[1fr_1fr_1fr_1fr] gap-x-6 gap-y-3 border-l-5 border-[#00c46a] relative"
          data-id=${workout.id}
        >
          <button
            class="workout__delete absolute h-10 w-10 top-4 right-5 text-[#ececec] hover:text-[#fffeff] hover:bg-[#606367] text-5xl flex items-center justify-center transition-colors duration-300 cursor-pointer border-0 rounded-xl"
          >
            &times;
          </button>
          <h2
            class="text-[#ececec] workout__title text-[1.7rem] font-semibold col-span-full pr-8"
          >
            Running on ${new Date(workout.date).toLocaleDateString("en-US", {
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
  _cyclingWorkout(workout) {
    const htmlWorkout = `<li
          class="workout bg-[#42484D] rounded-[5px] px-9 py-6 mb-7 cursor-pointer grid grid-cols-[1fr_1fr_1fr_1fr] gap-x-6 gap-y-3 border-l-5 border-[#FFB545] relative"
          data-id=${workout.id}
        >
        <button
            class="workout__delete absolute h-10 w-10 top-4 right-5 text-[#ececec] hover:text-[#fffeff] hover:bg-[#606367] text-5xl flex items-center justify-center transition-colors duration-300 cursor-pointer border-0 rounded-xl"
          >
            &times;
          </button>
          <h2
            class="text-[#ececec] workout__title text-[1.7rem] font-semibold col-span-full"
          >
            Cycling on ${new Date(workout.date).toLocaleDateString("en-US", {
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
  _renderWorkoutMarker(workout) {
    const marker = L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        }),
      )
      .setPopupContent(
        `${
          workout.type == "running"
            ? `🏃‍♂️ Running on ${new Date(workout.date).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                },
              )}`
            : `🚴‍♀️ Cycling on ${new Date(workout.date).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                },
              )}`
        } `,
      )
      .openPopup();
    this.#markers.set(workout.id, marker);
  }
  _renderWorkout(workout) {
    if (workout.type == "running") {
      this._runningWorkout(workout);
    } else if (workout.type == "cycling") {
      this._cyclingWorkout(workout);
    }
  }
  _moveToPopup(e) {
    const target = e.target.closest(".workout");
    // prettier-ignore
    if (e.target.closest(".workout")?.tagName === "LI" && !(e.target?.tagName === "BUTTON")) {
      const elem = this.#Workouts.find(
        (workout) => workout.id == target.dataset.id,
      );
      this.#map.setView(elem.coords, 13, {
        animate: true,
        pan: { duration: 1 },
      });
    }
    this._workoutDeletion(e);
  }
  _setLocaleStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#Workouts));
  }
  _getLocaleStorage() {
    const storedWorkouts = JSON.parse(localStorage.getItem("workouts"));
    if (!storedWorkouts) return;
    this.#Workouts = storedWorkouts.map((workout) => {
      workout.date = new Date(workout.date);
      if (workout.type === "running")
        Object.setPrototypeOf(workout, Running.prototype);
      if (workout.type === "cycling")
        Object.setPrototypeOf(workout, Cycling.prototype);
      return workout;
    });
    this.#Workouts.forEach((workout) => {
      this._renderWorkout(workout);
    });
  }
  reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
  _workoutDeletion(e) {
    const target = e.target.closest(".workout");
    // prettier-ignore
    if (e.target.closest(".workout")?.tagName === "LI" && (e.target?.tagName === "BUTTON")) {
      this.#Workouts = this.#Workouts.filter((workout) => workout.id != target.dataset.id);
      localStorage.setItem('workouts', JSON.stringify(this.#Workouts));
      target.remove();
      this.#markers.get(target.dataset.id).remove();
      this.#markers.delete(target.dataset.id);
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
  type = "running";
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
  type = "cycling";
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
