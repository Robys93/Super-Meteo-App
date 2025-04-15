// Configurazione
const API_KEY = "1adcc17762d90a92e8c96a9ccd78c101"; // Sostituisci con la tua API key da OpenWeather
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Mappa delle condizioni meteo con GIF corrispondenti
const WEATHER_GIFS = {
  "01d":
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2Z1ZmFvNndnaDZlZHd2YXYwYmtxbGpqaTl0OGFpYXJjNzRicG83OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tHIRLHtNwxpjIFqPdV/giphy.gif", // Sole
  "01n": "https://media.giphy.com/media/l3vR16pONsV8cKkWk/giphy.gif", // Notte serena
  "02d": "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif", // Poco nuvoloso giorno
  "02n": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2o0bnFmMXFsZ3RzajY3Z29hZzN2dHdrZW5ocjEyazFkbTRpMHF5dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ldC94BvZwmiIw/giphy.gif", // Poco nuvoloso notte
  "03d": "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3J0Ym14emN4ZHVoOTlxazcxOWVtb2M0NTV6OWtjYTZhZDJiMDdndyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/k61nOBRRBMxva/giphy.gif", // Nuvoloso
  "03n": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2o0bnFmMXFsZ3RzajY3Z29hZzN2dHdrZW5ocjEyazFkbTRpMHF5dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ldC94BvZwmiIw/giphy.gif", // Nuvoloso notte
  "04d": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2o0bnFmMXFsZ3RzajY3Z29hZzN2dHdrZW5ocjEyazFkbTRpMHF5dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ldC94BvZwmiIw/giphy.gif", // Molto nuvoloso
  "04n": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2o0bnFmMXFsZ3RzajY3Z29hZzN2dHdrZW5ocjEyazFkbTRpMHF5dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ldC94BvZwmiIw/giphy.gif", // Molto nuvoloso notte
  "09d": "https://media.giphy.com/media/xT5LMGupUKH3OQYhEQ/giphy.gif", // Pioggia leggera
  "09n": "https://media.giphy.com/media/xT5LMGupUKH3OQYhEQ/giphy.gif", // Pioggia leggera notte
  "10d": "https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif", // Pioggia
  "10n": "https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif", // Pioggia notte
  "11d": "https://media.giphy.com/media/3o6Zt6ML8s0xaLFpAI/giphy.gif", // Temporale
  "11n": "https://media.giphy.com/media/3o6Zt6ML8s0xaLFpAI/giphy.gif", // Temporale notte
  "13d": "https://media.giphy.com/media/l0HU7JIWtZClXOKrG/giphy.gif", // Neve
  "13n": "https://media.giphy.com/media/l0HU7JIWtZClXOKrG/giphy.gif", // Neve notte
  "50d": "https://media.giphy.com/media/3o7TKr2VGvhgYhQ5U4/giphy.gif", // Nebbia
  "50n": "https://media.giphy.com/media/3o7TKr2VGvhgYhQ5U4/giphy.gif", // Nebbia notte
};

// Elementi DOM
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const cityName = document.getElementById("city-name");
const currentDate = document.getElementById("current-date");
const tempValue = document.getElementById("temp-value");
const tempUnit = document.getElementById("temp-unit");
const weatherIcon = document.getElementById("weather-icon");
const weatherDescription = document.getElementById("weather-description");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const favoritesList = document.getElementById("favorites-list");
const themeToggle = document.getElementById("theme-toggle");

// Variabili globali
let currentCity = "";
let isCelsius = true;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
  updateDate();
  loadFavorites();

  // Prova a ottenere la posizione dell'utente all'avvio
  if (navigator.geolocation) {
    getLocation();
  } else {
    getWeatherData("Rome"); // Città di default
  }
});

// Event Listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeatherData(city);
    cityInput.value = "";
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) {
      getWeatherData(city);
      cityInput.value = "";
    }
  }
});

locationBtn.addEventListener("click", getLocation);

themeToggle.addEventListener("click", toggleTheme);

// Funzioni
function updateDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  currentDate.textContent = now.toLocaleDateString("it-IT", options);
}

async function getWeatherData(city) {
  try {
    const response = await fetch(
      `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=it`
    );
    const data = await response.json();

    if (data.cod === 200) {
      currentCity = data.name;
      displayWeatherData(data);

      // Controlla se è giorno o notte per il tema
      const isDayTime = data.weather[0].icon.includes("d");
      document.body.classList.toggle("night-mode", !isDayTime);
    } else {
      alert("Città non trovata. Prova con un altro nome.");
    }
  } catch (error) {
    console.error("Errore nel recupero dei dati meteo:", error);
    alert("Errore nel recupero dei dati meteo. Riprova più tardi.");
  }
}

function displayWeatherData(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;

  const tempCelsius = Math.round(data.main.temp);
  const tempFahrenheit = Math.round((tempCelsius * 9) / 5 + 32);

  tempValue.textContent = isCelsius ? tempCelsius : tempFahrenheit;
  tempUnit.textContent = isCelsius ? "°C" : "°F";

  // Animazione al cambio meteo
  weatherIcon.classList.add("weather-icon-transition");
  setTimeout(() => {
    weatherIcon.classList.remove("weather-icon-transition");
  }, 500);

  // Imposta la GIF corretta
  const weatherCode = data.weather[0].icon;
  weatherIcon.src = WEATHER_GIFS[weatherCode] || WEATHER_GIFS["01d"];
  weatherIcon.alt = data.weather[0].description;

  // Aggiungi classe per condizioni particolari
  document.body.classList.remove("thunder", "rain", "snow");
  if (weatherCode.startsWith("11")) {
    document.body.classList.add("thunder");
  } else if (weatherCode.startsWith("09") || weatherCode.startsWith("10")) {
    document.body.classList.add("rain");
  } else if (weatherCode.startsWith("13")) {
    document.body.classList.add("snow");
  }

  weatherDescription.textContent = data.weather[0].description;

  const feelsLikeC = Math.round(data.main.feels_like);
  const feelsLikeF = Math.round((feelsLikeC * 9) / 5 + 32);
  feelsLike.textContent = isCelsius ? `${feelsLikeC}°C` : `${feelsLikeF}°F`;

  humidity.textContent = `${data.main.humidity}%`;
  wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  pressure.textContent = `${data.main.pressure} hPa`;

  // Aggiungi al preferiti se non è già presente
  const cityId = `${data.name},${data.sys.country}`;
  if (!favorites.some((fav) => fav.id === cityId)) {
    const addBtn = document.createElement("button");
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Aggiungi';
    addBtn.addEventListener("click", () => addToFavorites(data));

    const existingActions = cityName.querySelector(".actions");
    if (existingActions) {
      cityName.removeChild(existingActions);
    }

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.appendChild(addBtn);
    cityName.appendChild(actions);
  }
}

function getLocation() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeatherByCoords(lat, lon);
    },
    (error) => {
      console.error("Errore geolocalizzazione:", error);
      alert("Impossibile ottenere la posizione. Usa la ricerca manuale.");
      getWeatherData("Rome"); // Fallback
    }
  );
}

async function getWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(
      `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=it`
    );
    const data = await response.json();
    displayWeatherData(data);
  } catch (error) {
    console.error("Errore nel recupero dati meteo:", error);
  }
}

function addToFavorites(data) {
  const cityId = `${data.name},${data.sys.country}`;

  if (!favorites.some((fav) => fav.id === cityId)) {
    favorites.push({
      id: cityId,
      name: data.name,
      country: data.sys.country,
    });

    saveFavorites();
    loadFavorites();
  }
}

function removeFromFavorites(cityId) {
  favorites = favorites.filter((fav) => fav.id !== cityId);
  saveFavorites();
  loadFavorites();
}

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function loadFavorites() {
  favoritesList.innerHTML = "";

  if (favorites.length === 0) {
    favoritesList.innerHTML = "<li>Nessuna città preferita</li>";
    return;
  }

  favorites.forEach((city) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <span>${city.name}, ${city.country}</span>
            <div>
                <button class="load-btn" data-id="${city.id}"><i class="fas fa-cloud-sun"></i></button>
                <button class="remove-btn" data-id="${city.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;

    favoritesList.appendChild(li);
  });

  // Aggiungi event listeners ai pulsanti
  document.querySelectorAll(".load-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const cityName = e.target.closest("button").dataset.id.split(",")[0];
      getWeatherData(cityName);
    });
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const cityId = e.target.closest("button").dataset.id;
      removeFromFavorites(cityId);
    });
  });
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.textContent = isDark ? "Tema Chiaro" : "Tema Scuro";

  // Salva preferenza tema
  localStorage.setItem("darkMode", isDark);
}

// Carica preferenza tema
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
  themeToggle.textContent = "Tema Chiaro";
}
