// Define weekdayNames and month names
const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Get formatted date string
 * @param {number} dateUnix Unix date in seconds
 * @param {number} timezone Timezone shift from UTC in seconds
 * @returns {string} Date String. Format: "weekdayNames Day, Month"
 */
const getDate = function (dateUnix, timezone) {
    const date = new Date((dateUnix + timezone) * 1000);
    const weekDayName = weekdayNames[date.getUTCDay()];
    const monthName = monthNames[date.getUTCMonth()];

    return `${weekDayName}, ${date.getUTCDate()}, ${monthName}`;
}

/**
 * @param {number} timeUnix Unix date in seconds
 * @param {number} timezone Timezone shift from UTC in seconds
 * @returns {string} Time string. Format: "HH:MM"
 */
const getTime = function (timeUnix, timezone) {
    const date = new Date((timeUnix + timezone) * 1000);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}

let lastHoveredDayIndex = -1;
const d = new Date();
d.setHours(0, 0, 0, 0);
const dateArray = [];

const iconMappings = {
    "01d": { icon: "01d.png", description: "Sunny" },
    "01n": { icon: "01n.png", description: "Clear night" },
    "02d": { icon: "02d.png", description: "Partly cloudy" },
    "02n": { icon: "02n.png", description: "Partly cloudy (night)" },
    "03d": { icon: "03d.png", description: "Scattered clouds" },
    "03n": { icon: "03n.png", description: "Scattered clouds (night)" },
    "04d": { icon: "04d.png", description: "Cloudy" },
    "04n": { icon: "04n.png", description: "Cloudy (night)" },
    "09d": { icon: "09d.png", description: "Drizzle" },
    "09n": { icon: "09n.png", description: "Drizzle (night)" },
    "10d": { icon: "10d.png", description: "Rain" },
    "10n": { icon: "10n.png", description: "Rain (night)" },
    "11d": { icon: "11d.png", description: "Thunderstorm" },
    "11n": { icon: "11n.png", description: "Thunderstorm (night)" },
    "13d": { icon: "13d.png", description: "Snow" },
    "13n": { icon: "13n.png", description: "Snow (night)" },
    "50d": { icon: "50d.png", description: "Mist" },
    "50n": { icon: "50n.png", description: "Mist (night)" },
};

let data; // Declare data globally
let timezoneOffset = 0; // Declare the timezone offset globally
let dailyForecasts = {}; // Object to store grouped forecasts by day

function getWeather() {
    var newName = document.getElementById("cityInput");
    var cityName = document.getElementById("cityName");
    cityName.innerHTML = "--- " + newName.value + " ---";

    const city = newName.value;

    if (!city) {
        alert("Please enter a city name");
        return;
    }

    const apiKey = '56a53f4ecbc4ddd0c5b27f6a131d7700';

    const currentWeatherURL = (`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    const forecastWeatherURL = (`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);

    fetch(currentWeatherURL)
        .then(response => response.json())
        .then(currentWeatherData => {
            timezoneOffset = currentWeatherData.timezone; // Store the timezone offset
            displayCurrentWeather(currentWeatherData);
            updateClock(); // Update the clock immediately
        })
        .catch(error => {
            console.error("Error fetching current weather data:", error);
            alert("Something Went Wrong :(");
        });

    fetch(forecastWeatherURL)
        .then(response => response.json())
        .then(forecastWeatherData => {
            data = forecastWeatherData; // Assign forecast data to the global variable
            displayForecastWeather(forecastWeatherData);
        })
        .catch(error => {
            console.error("Error fetching forecast data:", error);
            alert("Something Went Wrong :(");
        });
}

function displayCurrentWeather(data) {
    if (!data || !data.weather) {
        console.error("No current weather data available");
        return;
    }
    const currentTemperature = data.main.temp.toFixed(1);
    const weatherIconCode = data.weather[0].icon;
                const iconMapping = iconMappings[weatherIconCode];
                const weatherIconSrc = "weatherimages/" + (iconMapping ? iconMapping.icon : "default.png");

    const temperatureElement = document.getElementById('temperature');
    temperatureElement.textContent = `${currentTemperature} °C`;

    const weatherIconElement = document.getElementById('weatherIcon');
            weatherIconElement.src = weatherIconSrc;
            weatherIconElement.alt = iconMapping ? iconMapping.description : 'Unknown';
            weatherIconElement.style.display = 'inline';

    const humidity = data.main.humidity;
    const feels_like = data.main.feels_like;
    const pressure = data.main.pressure;
    const sunriseTimestamp = data.sys.sunrise;
    const sunsetTimestamp = data.sys.sunset; 

    const timezoneOffset = data.timezone;

    const sunriseTime = getTime(sunriseTimestamp, timezoneOffset);
    const sunsetTime = getTime(sunsetTimestamp, timezoneOffset);
    const wind_speed = data.wind.speed;

    console.log(`Sunrise: ${sunriseTime}`);
    console.log(`Sunset: ${sunsetTime}`);

    document.getElementById("humidity").innerHTML = "Humidity:  " + humidity + "%";
    document.getElementById("pressure").innerHTML = "Pressure:  " + pressure + " hPa";
    document.getElementById("feels_like").innerHTML = "Feels like:  " + feels_like + " °C";
    document.getElementById("windVelocity").innerHTML = "Wind Speed:  " + wind_speed + " m/s";
    document.getElementById("sunrise").innerHTML = "Sunrise:  " + sunriseTime;
    document.getElementById("sunset").innerHTML = "Sunset:  " + sunsetTime;
}

function displayForecastWeather(data) {
    if (!data || !data.list || data.list.length === 0) {
        console.error("No weather data available");
        return;
    }

    // Reset dailyForecasts
    dailyForecasts = {};

    // Group forecast data by day
    for (let i = 0; i < data.list.length; i++) {
        let forecastItem = data.list[i];
        let forecastDate = new Date((forecastItem.dt + timezoneOffset) * 1000); // Adjust forecast time
        let dayKey = forecastDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format

        if (!dailyForecasts[dayKey]) {
            dailyForecasts[dayKey] = [];
        }

        dailyForecasts[dayKey].push(forecastItem);
    }

    // Getting the min and max values for each day
    let minTemps = Array(5).fill(Number.MAX_VALUE);
    let maxTemps = Array(5).fill(Number.MIN_VALUE);
    let days = Object.keys(dailyForecasts).slice(0, 5);

    for (let i = 0; i < days.length; i++) {
        let day = days[i];
        let dayData = dailyForecasts[day];

        for (let j = 0; j < dayData.length; j++) {
            let temperature = dayData[j].main.temp;
            minTemps[i] = Math.min(minTemps[i], temperature);
            maxTemps[i] = Math.max(maxTemps[i], temperature);
        }
    }

    for (let i = 0; i < 5; i++) {
        document.getElementById("the" + (i + 1) + "Maximum").innerHTML = "Max: " + maxTemps[i].toFixed(1) + "°";
        document.getElementById("the" + (i + 1) + "Minimum").innerHTML = "Min: " + minTemps[i].toFixed(1) + "°";
    }

    // Update weather icons for the forecast
    for (let i = 0; i < 5; i++) {
        let day = days[i];
        let weatherIcon = document.getElementById("img" + (i + 1));

        if (dailyForecasts[day] && dailyForecasts[day][0]) {
            let weatherIconCode = dailyForecasts[day][0].weather[0].icon;
            let iconMapping = iconMappings[weatherIconCode];
            let weatherIconSrc = "weatherimages/" + (iconMapping ? iconMapping.icon : "default.png");

            if (weatherIcon) {
                weatherIcon.src = weatherIconSrc;
            }
        }
    }
}

function DefaultScreen() {
    document.getElementById("cityInput").defaultValue = "tokyo";
    getWeather();

    const weatherWrapperDivs = document.getElementsByClassName('weather-wrapper');
    for (let i = 0; i < weatherWrapperDivs.length; i++) {
        const wrapperDiv = weatherWrapperDivs[i];
        wrapperDiv.addEventListener('mouseover', () => showWeatherDetails(i));
        wrapperDiv.addEventListener('mouseout', hideWeatherDetails);
    }

    setInterval(updateClock, 1000);
}

function CheckDay(day) {
    if (day + d.getDay() > 6) {
        return day + d.getDay() - 7;
    } else {
        return day + d.getDay();
    }
}

for (let i = 0; i < 5; i++) {
    const dayIndex = CheckDay(i);
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + i);
const date = currentDate.getDate();
const month = currentDate.getMonth() + 1;
const year = currentDate.getFullYear();
const dateString = `${weekdayNames[dayIndex]}, ${month}/${date}/${year}`;
dateArray.push(dateString);
document.getElementById("day" + (i + 1)).innerHTML = weekdayNames[dayIndex] + ", " + date;}

function showWeatherDetails(dayIndex) {
    const detailsElement = document.getElementById('details');
    const detailsContainer = document.getElementById("weatherDetailsContainer");

    if (data && data.list) {
        if (detailsElement && detailsContainer) {
            // Update the last hovered day index
            lastHoveredDayIndex = dayIndex;
            // Get the specific date for the hovered day
            const specificDate = new Date();
            specificDate.setDate(specificDate.getDate() + dayIndex);
            const dayKey = specificDate.toISOString().split('T')[0];

            const dayDetails = dailyForecasts[dayKey] || [];

            let threeHourForecastHTML = '<ul class="sideways-list">';

            dayDetails.forEach((item) => {
                const dateTimeUTC = item.dt;
                const temp = item.main.temp.toFixed(1);
                const weatherIconCode = item.weather[0].icon;
                const iconMapping = iconMappings[weatherIconCode];
                const weatherIconSrc = "weatherimages/" + (iconMapping ? iconMapping.icon : "default.png");
                const weatherIconDescription = iconMapping ? iconMapping.description : "Unknown";
                
                // Get local time using your function
                const localTime = getTime(dateTimeUTC, timezoneOffset);
                
                threeHourForecastHTML += `
                    <li>
                        <span class="time">${localTime}</span>
                        <span class="temperature">${temp}°C</span>
                        <img src="${weatherIconSrc}" alt="${weatherIconDescription}" class="smallIcon">
                        <span>${weatherIconDescription}</span>
                    </li>
                `;
            });
            threeHourForecastHTML += '</ul>';

            detailsElement.innerHTML = threeHourForecastHTML;
            detailsContainer.classList.remove('hide');

            const smallIcons = document.querySelectorAll('#weatherDetails .smallIcon');
            smallIcons.forEach(icon => {
                icon.style.width = '50px';
                icon.style.height = '50px';
            });

            const timeElements = document.querySelectorAll('#weatherDetails .time');
            const temperatureElements = document.querySelectorAll('#weatherDetails .temperature');

            timeElements.forEach(timeElement => {
                timeElement.style.fontSize = '19px';
            });

            temperatureElements.forEach(temperatureElement => {
                temperatureElement.style.fontSize = '19px';
            });
        }
    }
}

function hideWeatherDetails() {
const detailsDiv = document.getElementById("weatherDetailsContainer");
if (lastHoveredDayIndex >= 0) {
    showWeatherDetails(lastHoveredDayIndex); // Show the last hovered day's details
} else {
detailsDiv.classList.add('hide');
}
}

function updateClock() {
    const currentTime = new Date();
    const localTime = currentTime.getTime();
    const localOffset = currentTime.getTimezoneOffset() * 60000;
    const utc = localTime + localOffset;
    const cityTime = new Date(utc + (1000 * timezoneOffset));

    const clockElement = document.getElementById("currentTime");
    const hours = cityTime.getHours().toString().padStart(2, "0");
    const minutes = cityTime.getMinutes().toString().padStart(2, "0");
    const seconds = cityTime.getSeconds().toString().padStart(2, "0");
    clockElement.textContent = `Time: ${hours}:${minutes}:${seconds}`;
}
const searchInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

searchInput.addEventListener("keypress", function (event) {
if (event.key === "Enter") {
searchButton.click();
}
});

document.addEventListener("DOMContentLoaded", function () {
DefaultScreen();
});