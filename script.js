// ==============================================
// CONFIGURAZIONE
// ==============================================
const OPENWEATHER_API_KEY = '1adcc17762d90a92e8c96a9ccd78c101';
const GIPHY_API_KEY = '6EQaVK9bO06CwrkytOem88B5e6BvEv9J'; // Sostituisci con la tua chiave
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const GIPHY_API_URL = 'https://api.giphy.com/v1/gifs/search';

// Mappatura condizioni meteo -> query GIPHY
const WEATHER_TO_GIPHY = {
    '01d': 'sunny+weather', '01n': 'starry+night',
    '02d': 'partly+cloudy', '02n': 'night+clouds',
    '03d': 'cloudy+sky', '03n': 'dark+clouds',
    '04d': 'overcast+sky', '04n': 'foggy+night',
    '09d': 'light+rain', '09n': 'rainy+night',
    '10d': 'heavy+rain', '10n': 'stormy+night',
    '11d': 'thunderstorm', '11n': 'lightning+night',
    '13d': 'snowing', '13n': 'snow+night',
    '50d': 'fog+weather', '50n': 'mist+night'
};

// GIF di fallback
const DEFAULT_GIFS = {
    '01d': 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    '01n': 'https://media.giphy.com/media/l3vR16pONsV8cKkWk/giphy.gif',
    '02d': 'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif',
    '11d': 'https://media.giphy.com/media/3o6Zt6ML8s0xaLFpAI/giphy.gif',
    '13d': 'https://media.giphy.com/media/l0HU7JIWtZClXOKrG/giphy.gif',
    '50d': 'https://media.giphy.com/media/3o7TKr2VGvhgYhQ5U4/giphy.gif'
};

// ==============================================
// ELEMENTI DOM
// ==============================================
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const tempValue = document.getElementById('temp-value');
const tempUnit = document.getElementById('temp-unit');
const weatherIcon = document.getElementById('weather-icon');
const weatherDescription = document.getElementById('weather-description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');
const favoritesList = document.getElementById('favorites-list');
const themeToggle = document.getElementById('theme-toggle');

// ==============================================
// STATO APPLICAZIONE
// ==============================================
let currentCity = '';
let isCelsius = true;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
const gifCache = {};
let apiCalls = 0;

// ==============================================
// FUNZIONI GIPHY
// ==============================================
async function fetchGiphyGif(weatherCode) {
    apiCalls++;
    updateApiCounter(); // Aggiungi questa linea
    
    if (apiCalls > 95) {
        showAlert('Attenzione: stai per raggiungere il limite di chiamate GIPHY (100/giorno)');
    }

    if (gifCache[weatherCode]) return gifCache[weatherCode];
    
    try {
        const response = await fetch(
            `${GIPHY_API_URL}?q=${WEATHER_TO_GIPHY[weatherCode]}` +
            `&api_key=${GIPHY_API_KEY}&limit=1&rating=g`
        );
        
        const { data } = await response.json();
        const gifUrl = data[0]?.images?.original?.url || DEFAULT_GIFS[weatherCode];
        
        gifCache[weatherCode] = gifUrl;
        return gifUrl;
    } catch (error) {
        console.error('Errore GIPHY:', error);
        return DEFAULT_GIFS[weatherCode];
    }
}

// Aggiungi queste nuove funzioni
function updateApiCounter() {
    const counterElement = document.getElementById('api-counter');
    const progressFill = document.querySelector('.progress-fill');
    
    counterElement.textContent = apiCalls;
    progressFill.style.width = `${Math.min(apiCalls, 100)}%`;
    
    if (apiCalls > 80) {
        progressFill.style.background = 'linear-gradient(90deg, #ff9a00, #ff0000)';
    }
}

function showAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'api-alert';
    alert.innerHTML = `
        <span>⚠️ ${message}</span>
        <button class="close-alert">&times;</button>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('show');
    }, 100);
    
    alert.querySelector('.close-alert').addEventListener('click', () => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    });
}

function warmupGifCache() {
    Object.keys(WEATHER_TO_GIPHY).forEach(code => {
        fetchGiphyGif(code).then(gif => new Image().src = gif);
    });
}

// ==============================================
// FUNZIONI METEO
// ==============================================
async function getWeatherData(city) {
    try {
        const response = await fetch(
            `${WEATHER_API_URL}?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=it`
        );
        const data = await response.json();
        
        if (data.cod === 200) {
            currentCity = data.name;
            displayWeatherData(data);
            document.body.classList.toggle('night-mode', !data.weather[0].icon.includes('d'));
        } else {
            alert('Città non trovata. Prova con un altro nome.');
        }
    } catch (error) {
        console.error('Errore API meteo:', error);
        alert('Errore nel recupero dati. Riprova più tardi.');
    }
}

async function displayWeatherData(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    const temp = Math.round(data.main.temp);
    tempValue.textContent = isCelsius ? temp : Math.round((temp * 9/5) + 32);
    tempUnit.textContent = isCelsius ? '°C' : '°F';

    weatherIcon.classList.add('weather-icon-transition');
    setTimeout(() => weatherIcon.classList.remove('weather-icon-transition'), 500);
    
    const weatherCode = data.weather[0].icon;
    weatherIcon.src = await fetchGiphyGif(weatherCode);
    weatherDescription.textContent = data.weather[0].description;

    document.body.classList.remove('thunder', 'rain', 'snow');
    if (weatherCode.startsWith('11')) document.body.classList.add('thunder');
    else if (weatherCode.startsWith('09') || weatherCode.startsWith('10')) document.body.classList.add('rain');
    else if (weatherCode.startsWith('13')) document.body.classList.add('snow');

    updateWeatherDetails(data);
    updateFavoriteButton(data);
}

function updateWeatherDetails(data) {
    const feelsLikeTemp = Math.round(data.main.feels_like);
    feelsLike.textContent = isCelsius ? `${feelsLikeTemp}°C` : `${Math.round((feelsLikeTemp * 9/5) + 32)}°F`;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;
}

function updateFavoriteButton(data) {
    const cityId = `${data.name},${data.sys.country}`;
    if (!favorites.some(fav => fav.id === cityId)) {
        const existingActions = cityName.querySelector('.actions');
        if (existingActions) cityName.removeChild(existingActions);

        const addBtn = document.createElement('button');
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Aggiungi';
        addBtn.addEventListener('click', () => addToFavorites(data));

        const actions = document.createElement('div');
        actions.className = 'actions';
        actions.appendChild(addBtn);
        cityName.appendChild(actions);
    }
}

// ==============================================
// GEOLOCALIZZAZIONE
// ==============================================
function getLocation() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude: lat, longitude: lon } = position.coords;
            getWeatherByCoords(lat, lon);
        },
        (error) => {
            console.error('Errore geolocalizzazione:', error);
            alert('Impossibile ottenere la posizione. Usa la ricerca manuale.');
            getWeatherData('Rome');
        }
    );
}

async function getWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=it`
        );
        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        console.error('Errore coordinate meteo:', error);
    }
}

// ==============================================
// GESTIONE PREFERITI
// ==============================================
function addToFavorites(data) {
    const cityId = `${data.name},${data.sys.country}`;
    if (!favorites.some(fav => fav.id === cityId)) {
        favorites.push({ id: cityId, name: data.name, country: data.sys.country });
        saveFavorites();
        loadFavorites();
    }
}

function removeFromFavorites(cityId) {
    favorites = favorites.filter(fav => fav.id !== cityId);
    saveFavorites();
    loadFavorites();
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadFavorites() {
    favoritesList.innerHTML = favorites.length === 0 
        ? '<li>Nessuna città preferita</li>'
        : favorites.map(city => `
            <li>
                <span>${city.name}, ${city.country}</span>
                <div>
                    <button class="load-btn" data-id="${city.id}">
                        <i class="fas fa-cloud-sun"></i>
                    </button>
                    <button class="remove-btn" data-id="${city.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');

    document.querySelectorAll('.load-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            getWeatherData(e.target.closest('button').dataset.id.split(',')[0]);
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            removeFromFavorites(e.target.closest('button').dataset.id);
        });
    });
}

// ==============================================
// GESTIONE TEMA
// ==============================================
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? 'Tema Chiaro' : 'Tema Scuro';
    localStorage.setItem('darkMode', isDark);
}

// ==============================================
// UTILITY
// ==============================================
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = now.toLocaleDateString('it-IT', options);
}

// ==============================================
// EVENT LISTENERS
// ==============================================
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) getWeatherData(city);
    cityInput.value = '';
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityInput.value.trim()) {
        getWeatherData(cityInput.value.trim());
        cityInput.value = '';
    }
});

locationBtn.addEventListener('click', getLocation);
themeToggle.addEventListener('click', toggleTheme);

// ==============================================
// INIZIALIZZAZIONE
// ==============================================
updateDate();
loadFavorites();
warmupGifCache();

if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = 'Tema Chiaro';
}

if (navigator.geolocation) {
    getLocation();
} else {
    getWeatherData('Rome');
}