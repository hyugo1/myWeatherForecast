let lastHoveredDayIndex = -1;

const iconMappings = {
    "01d": { icon: "01d.png", description: "clear sky" },
    "01n": { icon: "01n.png", description: "clear night" },
    "02d": { icon: "02d.png", description: "few clouds" },
    "02n": { icon: "02n.png", description: "few clouds at night" },
    "03d": { icon: "03d.png", description: "scattered clouds" },
    "03n": { icon: "03n.png", description: "scattered clouds at night" },
    "04d": { icon: "04d.png", description: "very cloudy" },
    "04n": { icon: "04n.png", description: "very cloudy at night" },
    "09d": { icon: "09d.png", description: "shower rain" },
    "09n": { icon: "09n.png", description: "shower rain at night" },
    "10d": { icon: "10d.png", description: "rain" },
    "10n": { icon: "10n.png", description: "rain at night" },
    "11d": { icon: "11d.png", description: "thunderstorm" },
    "11n": { icon: "11n.png", description: "thunderstorm at night" },
    "13d": { icon: "13d.png", description: "snow" },
    "13n": { icon: "13n.png", description: "snow at night" },
    "50d": { icon: "50d.png", description: "mist" },
    "50n": { icon: "50n.png", description: "mist at night" },
};

let data;

function GetInfo() {
    var newName = document.getElementById("cityInput");
    var cityName = document.getElementById("cityName");
    cityName.innerHTML = "--- " + newName.value + " ---";

    const city = newName.value;
    const apiKey = '56a53f4ecbc4ddd0c5b27f6a131d7700';

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(currentData => {
            const currentTemperature = currentData.main.temp.toFixed(1);
            const weatherIconCode = currentData.weather[0].icon;
            const iconMapping = iconMappings[weatherIconCode];
            const weatherIconSrc = "weatherimages/" + (iconMapping ? iconMapping.icon : "default.png");

            const temperatureElement = document.getElementById('temperature');
            temperatureElement.textContent = `${currentTemperature} °C`;

            const weatherIconElement = document.getElementById('weatherIcon');
            weatherIconElement.src = weatherIconSrc;
            weatherIconElement.alt = iconMapping ? iconMapping.description : 'Unknown';
            weatherIconElement.style.display = 'inline';

            // Now fetch the forecast data
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
        })
        .then(response => response.json())
        .then(apiData => {
            data = apiData;

            // Getting the min and max values for each day
            let minTemps = Array(5).fill(Number.MAX_VALUE);
            let maxTemps = Array(5).fill(Number.MIN_VALUE);
            let dailyData = Array(5).fill(null).map(() => []);

            for (let i = 0; i < data.list.length; i++) {
                let forecastDate = new Date(data.list[i].dt * 1000);
                let dayIndex = (forecastDate.getDay() - d.getDay() + 5) % 5;

                if (dayIndex >= 0 && dayIndex < 5) {
                    let temperature = data.list[i].main.temp;
                    minTemps[dayIndex] = Math.min(minTemps[dayIndex], temperature);
                    maxTemps[dayIndex] = Math.max(maxTemps[dayIndex], temperature);
                    dailyData[dayIndex].push(data.list[i]);
                }
            }

            for (i = 0; i < 5; i++) {
                document.getElementById("the" + (i + 1) + "Maximum").innerHTML = "Maximum: " + maxTemps[i].toFixed(1) + "°";
                document.getElementById("the" + (i + 1) + "Minimum").innerHTML = "Minimum: " + minTemps[i].toFixed(1) + "°";
            }

            // Display additional weather data
            const humidity = data.list[0].main.humidity;
            const feels_like = data.list[0].main.feels_like;
            const pressure = data.list[0].main.pressure;
            const sunriseTimestamp = data.city.sunrise * 1000;
            const sunsetTimestamp = data.city.sunset * 1000;
            const sunriseTime = new Date(sunriseTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const sunsetTime = new Date(sunsetTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const wind_speed = data.list[0].wind.speed;

            document.getElementById("humidity").innerHTML = "Humidity: " + humidity + "%";
            document.getElementById("pressure").innerHTML = "Pressure: " + pressure + " hPa";
            document.getElementById("feels_like").innerHTML = "Feels like: " + feels_like + " °C";
            document.getElementById("windVelocity").innerHTML = "Wind Speed: " + wind_speed + " m/s";
            document.getElementById("sunrise").innerHTML = "Sunrise: " + sunriseTime;
            document.getElementById("sunset").innerHTML = "Sunset: " + sunsetTime;

            // Update weather icons for the forecast
            for (let i = 0; i < Math.min(data.list.length, 5); i++) {
                let weatherIcon = document.getElementById("img" + (i + 1));
                let weatherIconCode = data.list[i].weather[0].icon;

                let iconMapping = iconMappings[weatherIconCode];
                let weatherIconSrc = "weatherimages/" + (iconMapping ? iconMapping.icon : "default.png");

                if (weatherIcon) {
                    weatherIcon.src = weatherIconSrc;
                }

                // Update weather details for the day only if there are data points available
                if (dailyData[i].length > 0) {
                    let minTemp = Number.MAX_VALUE;
                    let maxTemp = Number.MIN_VALUE;

                    dailyData[i].forEach(item => {
                        let temperature = item.main.temp;
                        minTemp = Math.min(minTemp, temperature);
                        maxTemp = Math.max(maxTemp, temperature);
                    });

                    document.getElementById("the" + (i + 1) + "Maximum").innerHTML = "Maximum: " + maxTemp.toFixed(1) + "°";
                    document.getElementById("the" + (i + 1) + "Minimum").innerHTML = "Minimum: " + minTemp.toFixed(1) + "°";
                }
            }
        })
        .catch(err => {
            console.error("Error fetching weather data:", err);
            alert("Something Went Wrong :(");
        });
}

function DefaultScreen() {
    document.getElementById("cityInput").defaultValue = "Tokyo";
    GetInfo();
    updateClock();

    const weatherWrapperDivs = document.getElementsByClassName('weather-wrapper');
    for (let i = 0; i < weatherWrapperDivs.length; i++) {
        const dayIndex = CheckDay(i);
        const wrapperDiv = weatherWrapperDivs[i];
        wrapperDiv.addEventListener('mouseover', () => showWeatherDetails(dayIndex));
        wrapperDiv.addEventListener('mouseout', hideWeatherDetails);
    }
    setInterval(updateClock, 1000);
}

const d = new Date();
d.setHours(0, 0, 0, 0);
const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dateArray = [];

function CheckDay(day) {
    if (day + d.getDay() > 6) {
        return day + d.getDay() - 7;
    } else {
        return day + d.getDay();
    }
}

// for (i = 0; i < 5; i++) {
//     document.getElementById("day" + (i + 1)).innerHTML = weekday[CheckDay(i)];
// }
for (let i = 0; i < 5; i++) {
        const dayIndex = CheckDay(i);
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + i);
        const date = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const dateString = `${weekday[dayIndex]}, ${month}/${date}/${year}`;
        dateArray.push(dateString);
        document.getElementById("day" + (i + 1)).innerHTML = weekday[dayIndex] + "<br>" + date;
    }


function showWeatherDetails(dayIndex) {
const detailsElement = document.getElementById('details');
const detailsContainer = document.getElementById('weatherDetailsContainer');
if (data && data.list) {
    if (detailsElement && detailsContainer) {
        // Update the last hovered day index
        lastHoveredDayIndex = dayIndex;
        const dayDetails = data.list.filter((item) => {
            const forecastDate = new Date(item.dt * 1000);
            const forecastDayIndex = forecastDate.getDay();
            return dayIndex === forecastDayIndex;
        });
        let detailsHTML = '<ul class="sideways-list">';

        dayDetails.forEach((item) => {
            const forecastDate = new Date(item.dt * 1000);
            const time = forecastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const temp = item.main.temp.toFixed(1);
            const weatherIconCode = item.weather[0].icon;
            const iconMapping = iconMappings[weatherIconCode];
            const weatherIconSrc = "weatherimages/" + (iconMapping ? iconMapping.icon : "default.png");
            const weatherIconDescription = iconMapping ? iconMapping.description : "Unknown";

            detailsHTML += `
                <li>
                    <span class="time">${time}</span>
                    <span class="temperature">${temp}°C</span>
                    <img src="${weatherIconSrc}" alt="${weatherIconDescription}" class="smallIcon">
                    <span>${weatherIconDescription}</span>
                </li>
            `;
        });
        detailsHTML += '</ul>';

        detailsElement.innerHTML = detailsHTML;
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
}if (data && data.list) {
    if (detailsElement && detailsContainer) {
        // Update the last hovered day index
        lastHoveredDayIndex = dayIndex;
        const dayDetails = data.list.filter((item) => {
            const forecastDate = new Date(item.dt * 1000);
            const forecastDayIndex = forecastDate.getDay();
            return dayIndex === forecastDayIndex;
        });
        let detailsHTML = '<ul class="sideways-list">';

        dayDetails.forEach((item) => {
            const forecastDate = new Date(item.dt * 1000);
            const time = forecastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const temp = item.main.temp.toFixed(1);
            const weatherIconCode = item.weather[0].icon;
            const iconMapping = iconMappings[weatherIconCode];
            const weatherIconSrc = "weatherimages/" + (iconMapping ? iconMapping.icon : "default.png");
            const weatherIconDescription = iconMapping ? iconMapping.description : "Unknown";

            detailsHTML += `
                <li>
                    <span class="time">${time}</span>
                    <span class="temperature">${temp}°C</span>
                    <img src="${weatherIconSrc}" alt="${weatherIconDescription}" class="smallIcon">
                    <span>${weatherIconDescription}</span>
                </li>
            `;
        });
        detailsHTML += '</ul>';

        detailsElement.innerHTML = detailsHTML;
        detailsContainer.classList.remove('hide');

        const smallIcons = document.querySelectorAll('#weatherDetails .smallIcon');
        smallIcons.forEach(icon => {
            icon.style.width = '60px';
            icon.style.height = '60px';
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
}}

function hideWeatherDetails() {
    // const detailsContainer = document.getElementById('weatherDetailsContainer');
    // detailsContainer.classList.add('hide');
    const detailsDiv = document.getElementById('weatherDetailsContainer');
    if (lastHoveredDayIndex >= 0) {
        showWeatherDetails(lastHoveredDayIndex); // Show the last hovered day's details
    } else {
    detailsDiv.classList.add('hide');
    }
}

function updateClock() {
    const currentTime = new Date();
    const clockElement = document.getElementById('currentTime');
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    clockElement.textContent = `Time: ${hours}:${minutes}:${seconds}`;
}

const searchInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');

searchInput.addEventListener('keypress', function (event) {
    if (event.key === "Enter") {
        searchButton.click();
    }
    });

    document.addEventListener("DOMContentLoaded", function () {
        DefaultScreen();
});