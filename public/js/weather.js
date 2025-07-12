const btn = document.querySelector("#searchBtn");
const apiKey = "4a48358afcab4fa7b2a4f59955396f58";

btn.addEventListener("click", async () => {
    const city = document.querySelector("#cityInput").value.trim();
    if (!city) return alert("Please enter a city name.");
    await getTemperature(city);
});

async function getTemperature(city) {
    try {
        const query = encodeURIComponent(`${city}, India`);
        const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${apiKey}`;
        const geoRes = await axios.get(geoUrl);

        if (!geoRes.data.results || geoRes.data.results.length === 0) {
            throw new Error("Location not found");
        }

        const { lat, lng } = geoRes.data.results[0].geometry;

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&hourly=relativehumidity_2m`;
        const weatherRes = await axios.get(weatherUrl);

        const weather = weatherRes.data.current_weather;
        const currentTime = weather.time;

        const humidityIndex = weatherRes.data.hourly.time.findIndex(t =>
            t.startsWith(currentTime.slice(0, 13))
        );

        let humidity = "N/A";
        if (
            humidityIndex !== -1 &&
            weatherRes.data.hourly.relativehumidity_2m[humidityIndex] !== undefined
        ) {
            humidity = weatherRes.data.hourly.relativehumidity_2m[humidityIndex];
        }

        const imageMap = {
            0: "clear.png", 1: "clear.png", 2: "clouds.png", 3: "clouds.png",
            45: "mist.png", 48: "mist.png", 51: "drizzle.png", 53: "drizzle.png",
            55: "drizzle.png", 56: "drizzle.png", 57: "drizzle.png",
            61: "rain.png", 63: "rain.png", 65: "rain.png",
            66: "rain.png", 67: "rain.png", 71: "snow.png",
            73: "snow.png", 75: "snow.png", 77: "snow.png",
            80: "rain.png", 81: "rain.png", 82: "rain.png",
            85: "snow.png", 86: "snow.png", 95: "rain.png",
            96: "rain.png", 99: "rain.png"
        };

        const icon = imageMap[weather.weathercode] || "default.png";

        const daily = weatherRes.data.daily;
        const forecastHTML = daily.time.slice(1, 5).map((date, i) => {
            const max = daily.temperature_2m_max[i + 1];
            const min = daily.temperature_2m_min[i + 1];
            const code = daily.weathercode[i + 1];
            const forecastIcon = imageMap[code] || "default.png";

            return `
                <div class="forecast-day">
                    <h4>${new Date(date).toLocaleDateString("en-IN", {
                        weekday: 'short', day: 'numeric', month: 'short'
                    })}</h4>
                    <img src="weather-image/${forecastIcon}" alt="" width="40" height="40" />
                    <p>${min}°C / ${max}°C</p>
                </div>`;
        }).join("");

        city = city.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

        document.getElementById("weather-output").innerHTML = `
            <div class="weather-card">
                <div class="weather-data">
                    <img src="weather-image/${icon}" alt="Weather Icon" class="weather-icon">
                    <h1>${weather.temperature}°C</h1>
                    <h2>${city}</h2>
                    <div class="weather-details">
                        <div class="detail-item">
                            <img src="/weather-image/humidity.png" width="20" height="20" />
                            <p>${humidity}%</p>
                            <small>Humidity</small>
                        </div>
                        <div class="detail-item">
                            <img src="/weather-image/wind.png" width="20" height="20" />
                            <p>${weather.windspeed} km/h</p>
                            <small>Wind Speed</small>
                        </div>
                    </div>
                </div>
                <div class="forecast-container">
                    ${forecastHTML}
                </div>
            </div>
        `;

        // Show weather card
        document.querySelector(".weather-card").style.display = "block";

        // Clickable forecast days
        setTimeout(() => {
            const forecastCards = document.querySelectorAll(".forecast-day");
            forecastCards.forEach(card => {
                card.addEventListener("click", () => {
                    forecastCards.forEach(c => c.classList.remove("active"));
                    card.classList.add("active");
                });
            });
        }, 0);

    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("weather-output").innerHTML = `
            <p class="error-msg">
                ❌ City not found or error fetching data.<br>
                Try: "Rohtak, India".
            </p>
        `;
    }
}
