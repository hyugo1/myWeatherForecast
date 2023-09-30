// broken clouds mean they are very cloudy

const iconMappings = {
    "01d": { icon: "01d.png", description: "clear sky" },
    "01n": { icon: "01n.png", description: "clear night" },
    "02d": { icon: "02d.png", description: "few clouds" },
    "02n": { icon: "02n.png", description: "few clouds at night" },
    "03d": { icon: "03d.png", description: "scattered clouds" },
    "03n": { icon: "03n.png", description: "scattered clouds at night" },
    "04d": { icon: "04d.png", description: "broken clouds" },
    "04n": { icon: "04n.png", description: "broken clouds at night" },
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

    // Add more mappings for other conditions if needed
};


let data;


function GetInfo() {
    var newName = document.getElementById("cityInput");
    var cityName = document.getElementById("cityName");
    cityName.innerHTML = "--- " + newName.value + " ---";

    // fetch('https://api.openweathermap.org/data/2.5/forecast?q=' + newName.value + '&units=metric&appid=c97036ce88e3c7f79df626f593de5e9e')
    fetch('https://api.openweathermap.org/data/2.5/forecast?q=' + newName.value + '&units=metric&appid=56a53f4ecbc4ddd0c5b27f6a131d7700')
    .then(response => response.json())
    .then(apiData => {
        data = apiData;

        // Getting the min and max values for each day
        let minTemps = Array(5).fill(Number.MAX_VALUE);
        let maxTemps = Array(5).fill(Number.MIN_VALUE);

        for (let i = 0; i < data.list.length; i++) {
            let forecastDate = new Date(data.list[i].dt * 1000);
            let dayIndex = Math.floor((forecastDate - d) / (24 * 60 * 60 * 1000));
            
            if (dayIndex >= 0 && dayIndex < 5) {
                let temperature = data.list[i].main.temp;
                minTemps[dayIndex] = Math.min(minTemps[dayIndex], temperature);
                maxTemps[dayIndex] = Math.max(maxTemps[dayIndex], temperature);
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
        document.getElementById("feels_like").innerHTML = "Feels like: " + feels_like + " °C"
        document.getElementById("windVelocity").innerHTML = "Wind Speed: " + wind_speed + " m/s";
        document.getElementById("sunrise").innerHTML = "Sunrise: " + sunriseTime;
        document.getElementById("sunset").innerHTML = "Sunset: " + sunsetTime;

        updateTemperature();

        // Inside the loop where you're getting weather data
        for (let i = 0; i < Math.min(data.list.length, 5); i++) {
            let weatherIcon = document.getElementById("img" + (i + 1));
            let weatherIconCode = data.list[i].weather[0].icon;

            let iconMapping = iconMappings[weatherIconCode];
            let weatherIconSrc = "weatherimages/" + (iconMapping ? iconMapping.icon : "default.png");

            if (weatherIcon) {
                weatherIcon.src = weatherIconSrc;
            }

            // Update weather details for the day
            let dayDetails = data.list.filter(item => {
                let forecastDate = new Date(item.dt * 1000);
                let forecastDayIndex = forecastDate.getDay();
                return forecastDayIndex === i; 
            });

            // Update temperature values for the day only if there are data points available
            if (dayDetails.length > 0) {
                let minTemp = Number.MAX_VALUE;
                let maxTemp = Number.MIN_VALUE;

                dayDetails.forEach(item => {
                    let temperature = item.main.temp;
                    minTemp = Math.min(minTemp, temperature);
                    maxTemp = Math.max(maxTemp, temperature);
                });

                document.getElementById("the" + (i + 1) + "Maximum").innerHTML = "Maximum: " + maxTemp.toFixed(1) + "°";
                document.getElementById("the" + (i + 1) + "Minimum").innerHTML = "Minimum: " + minTemp.toFixed(1) + "°";
            }
        }
    });
}


                // .catch(err => {
                //     console.error("Error fetching weather data:", err);
                //     alert("Something Went Wrong :( ");
                // });

    


function DefaultScreen() {
    document.getElementById("cityInput").defaultValue = "Sapporo";
    updateTemperature();
    GetInfo();
    updateClock();

    const weatherWrapperDivs = document.getElementsByClassName('weather-wrapper');
    for (let i = 0; i < weatherWrapperDivs.length; i++) {
        const dayIndex = CheckDay(i);
        const wrapperDiv = weatherWrapperDivs[i];
        // wrapperDiv.addEventListener('mouseover', () => showWeatherDetails(dayIndex));
        wrapperDiv.addEventListener('mouseover', () => showWeatherDetails(dayIndex));
        wrapperDiv.addEventListener('mouseout', () => hideWeatherDetails());
    }
    setInterval(updateClock, 1000);
}
// }


var d = new Date();
d.setHours(0, 0, 0, 0);
var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",];


function CheckDay(day) {
    if (day + d.getDay() > 6) {
        return day + d.getDay() - 7;
    } else {
        return day + d.getDay();
    }
}

for (i = 0; i < 5; i++) {
    document.getElementById("day" + (i + 1)).innerHTML = weekday[CheckDay(i)];
}







function showWeatherDetails(dayIndex) {
    const detailsElement = document.getElementById('details');
    const detailsContainer = document.getElementById('weatherDetailsContainer');

    if (data && data.list) {
        if (detailsElement && detailsContainer) {
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
    }
}


function hideWeatherDetails() {
    const detailsDiv = document.getElementById('weatherDetailsContainer');
    if (detailsDiv) {
        detailsDiv.classList.add('hide');
    }
}


async function updateTemperature() {
    const apiKey = '56a53f4ecbc4ddd0c5b27f6a131d7700'; 
    const city = document.getElementById("cityInput").value;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("Weather data:", data);

        const currentTemperature = data.main.temp.toFixed(1);
        const temperatureElement = document.getElementById('currentTemperature');
        temperatureElement.textContent = `Current Temperature: ${currentTemperature} °C`;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        const temperatureElement = document.getElementById('currentTemperature');
        temperatureElement.textContent = 'Current Temperature: Error: could not fetching data';
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
