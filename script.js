// Weather App JavaScript
class WeatherApp {
    constructor() {
        this.apiKey = '9d3c95cae1cca281b9aee23020ffbaf0'; // You'll need to get this from OpenWeatherMap
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.weatherCard = document.getElementById('weatherCard');
        
        this.init();
    }
    
    init() {
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.locationBtn.addEventListener('click', () => this.getLocationWeather());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        
        // Load weather for default city
        this.searchWeather('London');
    }
    
    async searchWeather(city = null) {
        const cityName = city || this.cityInput.value.trim();
        
        if (!cityName) {
            this.showError('Please enter a city name');
            return;
        }
        
        this.showLoading();
        
        try {
            const weatherData = await this.fetchWeatherData(cityName);
            const forecastData = await this.fetchForecastData(cityName);
            
            this.displayWeather(weatherData);
            this.displayForecast(forecastData);
            this.hideLoading();
            this.showWeatherCard();
            
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError('City not found. Please try again.');
            this.hideLoading();
        }
    }
    
    async getLocationWeather() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }
        
        this.showLoading();
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const weatherData = await this.fetchWeatherByCoords(latitude, longitude);
                    const forecastData = await this.fetchForecastByCoords(latitude, longitude);
                    
                    this.displayWeather(weatherData);
                    this.displayForecast(forecastData);
                    this.hideLoading();
                    this.showWeatherCard();
                    
                } catch (error) {
                    console.error('Error fetching location weather:', error);
                    this.showError('Unable to get weather for your location');
                    this.hideLoading();
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                this.showError('Unable to access your location');
                this.hideLoading();
            }
        );
    }
    
    async fetchWeatherData(city) {
        const url = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        return response.json();
    }
    
    async fetchForecastData(city) {
        const url = `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Forecast not available');
        }
        
        return response.json();
    }
    
    async fetchWeatherByCoords(lat, lon) {
        const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Weather data not available');
        }
        
        return response.json();
    }
    
    async fetchForecastByCoords(lat, lon) {
        const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Forecast data not available');
        }
        
        return response.json();
    }
    
    displayWeather(data) {
        document.getElementById('cityName').textContent = data.name;
        document.getElementById('countryName').textContent = data.sys.country;
        document.getElementById('weatherDescription').textContent = data.weather[0].description;
        document.getElementById('temperature').textContent = Math.round(data.main.temp);
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
        document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
        
        // Set weather icon
        const weatherIcon = document.getElementById('weatherIcon');
        weatherIcon.className = `wi wi-owm-${data.weather[0].id}`;
        
        // Set sunrise time
        const sunrise = new Date(data.sys.sunrise * 1000);
        document.getElementById('sunrise').textContent = sunrise.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    displayForecast(data) {
        const forecastContainer = document.getElementById('forecast');
        forecastContainer.innerHTML = '';
        
        // Get next 5 days (skip today)
        const dailyForecasts = this.getDailyForecasts(data.list);
        
        dailyForecasts.slice(1, 6).forEach(day => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            const dayName = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
            const iconClass = `wi wi-owm-${day.weather[0].id}`;
            const temp = Math.round(day.main.temp);
            
            forecastItem.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <i class="forecast-icon ${iconClass}"></i>
                <div class="forecast-temp">${temp}°C</div>
            `;
            
            forecastContainer.appendChild(forecastItem);
        });
    }
    
    getDailyForecasts(forecastList) {
        const dailyData = {};
        
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!dailyData[date]) {
                dailyData[date] = [];
            }
            dailyData[date].push(item);
        });
        
        return Object.values(dailyData).map(dayData => {
            // Get the middle forecast of the day (around noon)
            const sortedByTime = dayData.sort((a, b) => a.dt - b.dt);
            return sortedByTime[Math.floor(sortedByTime.length / 2)];
        });
    }
    
    showLoading() {
        this.loading.classList.remove('hidden');
        this.error.classList.add('hidden');
        this.weatherCard.classList.add('hidden');
    }
    
    hideLoading() {
        this.loading.classList.add('hidden');
    }
    
    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        this.error.classList.remove('hidden');
        this.weatherCard.classList.add('hidden');
    }
    
    showWeatherCard() {
        this.weatherCard.classList.remove('hidden');
        this.error.classList.add('hidden');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Add some demo functionality for when API key is not available
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Running in development mode. Please add your OpenWeatherMap API key to make the app work.');
}
