// selecting the HTML element
const cityName = document.getElementById("cityName")
const temperatureInDegree = document.getElementById("temperature")
const windInMS = document.getElementById("wind")
const humidityInPercent = document.getElementById("humidity")
const dateTime = document.getElementById("localtime")
const searchInput = document.getElementById("searchInput")
const searchBtn = document.getElementById("searchBtn")
const weatherImg = document.getElementById("weatherImg")
const weatherText = document.getElementById("weatherText")
const messageDiv = document.getElementById("message")
const searchLocation = document.getElementById("searchLocation")

// feching the weather Api
const fetchData = async (city) => {
  const apiKeyForcast = `https://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&cnt=5&appid=3f0494270e2dcf90c46720cecc65c078`
  const apikeyFetch = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=3f0494270e2dcf90c46720cecc65c078`
  try {
    const response = await fetch(apikeyFetch)
    if (!response.ok) {
      if (response.status === 404) {
        messageDiv.textContent = "City not found. Please check the spelling."
      } else {
        messageDiv.textContent = `Error: ${response.status} ${response.statusText}`
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    displayWeather(data)
    const { coord } = data

    fetchForecast(coord.lat, coord.lon).then(updateForecastCards)
  } catch (error) {
    console.error("Error fetching data:", error)
  }
}

// calling the Api passing the default cityName
fetchData("London")

// calling the fetchData function based on search and handling the invalid/wrong search
searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim()
  messageDiv.textContent = ""
  if (city) {
    fetchData(city)
  }
})

// Displaying the data on UI fetch from an fetchData function
function displayWeather(data) {
  const { name, dt, wind, main, weather } = data
  const { temp, humidity } = main
  const description = weather[0].description

  // Format date
  let epochInMilliseconds = dt * 1000
  let dateObject = new Date(epochInMilliseconds)
  let localDate = dateObject.toLocaleDateString("en-IN")

  // Update text content
  cityName.textContent = name
  dateTime.textContent = `(${localDate})`
  temperatureInDegree.textContent = `Temperature : ${Math.floor(temp - 273.15)}`
  windInMS.textContent = `Wind : ${wind.speed} M/S`
  humidityInPercent.textContent = `Humidity : ${humidity}%`
  weatherText.textContent = description

  // Set the weather image based on  weather description
  let imgSrc = ""
  switch (description) {
    case "clear sky":
      imgSrc = "../images/clearsky.png"
      break
    case "few clouds":
      imgSrc = "../images/fewclouds.png"
      break
    case "scattered clouds":
    case "broken clouds":
      imgSrc = "../images/scatteredclouds.png"
      break
    case "shower rain":
      imgSrc = "../images/showerrain.png"
      break
    case "rain":
      imgSrc = "../images/rain.png"
      break
    case "thunderstorm":
      imgSrc = "../images/thunderstorm.png"
      break
    case "mist":
    case "haze":
    case "fog":
      imgSrc = "../images/mist.png"
      break
    default:
      imgSrc = "../images/fewclouds.png"
  }

  weatherImg.setAttribute("src", imgSrc)
}

// feching the data based on  current location for that using geolocation coord(lat and lon)

async function fetchWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=3f0494270e2dcf90c46720cecc65c078`
    )

    if (!response.ok) {
      messageDiv.textContent = `Error fetching weather data: ${response.status} ${response.statusText}`
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    displayWeather(data)

    const { coord } = data
    // Fetch forecast data based on coordinates
    const forecastData = await fetchForecast(coord.lat, coord.lon)
    updateForecastCards(forecastData)
  } catch (error) {
    console.error("Error fetching weather by coords:", error)
    messageDiv.textContent = "Unable to fetch weather data for your location."
  }
}

searchLocation.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        fetchWeatherByCoords(latitude, longitude)
      },
      (error) => {
        alert("Unable to retrieve your location. Please allow location access.")
        console.error("Geolocation error:", error)
      }
    )
  } else {
    alert("Geolocation is not supported by your browser")
  }
})

// fetching the 5 days forcast of the search city
async function fetchForecast(lat, lon) {
  const apiKey = "YOUR_API_KEY"
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=3f0494270e2dcf90c46720cecc65c078`
  )
  if (!response.ok) throw new Error("Forecast data fetch failed")
  const data = await response.json()
  return data
}

// displaying the  5-days forcast on the UI
function updateForecastCards(forecastData) {
  const days = {}
  forecastData.list.forEach((entry) => {
    const dateStr = new Date(entry.dt * 1000).toLocaleDateString("en-IN")

    if (!days[dateStr]) {
      days[dateStr] = []
    }
    days[dateStr].push(entry)
  })

  const forecastContainer = document.querySelector("#forecastContainer")
  forecastContainer.innerHTML = ""

  const today = new Date().toLocaleDateString("en-IN")

  let count = 0
  for (const date in days) {
    if (count >= 5) break

    const dayData = days[date]

    const temps = dayData.map((d) => d.main.temp)
    const winds = dayData.map((d) => d.wind.speed)
    const humiditys = dayData.map((d) => d.main.humidity)

    const avgTempK = temps.reduce((a, b) => a + b, 0) / temps.length
    const tempC = Math.floor(avgTempK - 273.15)

    const avgWind = winds.reduce((a, b) => a + b, 0) / winds.length
    const avgHumidity = humiditys.reduce((a, b) => a + b, 0) / humiditys.length
    const humidityP = Math.floor(avgHumidity)

    // Create forecast card
    const card = document.createElement("article")
    card.className =
      "bg-gray-600 w-44 rounded text-left p-4 flex flex-col gap-4 flex-shrink-0"

    const dateHeader = document.createElement("h3")
    dateHeader.textContent = `(${date})`

    let weatherIcon = document.createElement("i")
    weatherIcon.className = "text-2xl pl-4"

    const description = dayData[0].weather[0].description

    switch (description) {
      case "clear sky":
        weatherIcon.innerHTML = `<i class="fa-solid fa-sun"></i>`
        break
      case "few clouds":
      case "scattered clouds":
      case "broken clouds":
        weatherIcon.innerHTML = `<i class="fa-solid fa-cloud"></i>`
        break
      case "shower rain":
        weatherIcon.innerHTML = `<i class="fa-solid fa-cloud-sun-rain"></i>`
        break
      case "rain":
        weatherIcon.innerHTML = `<i class="fa-solid fa-cloud-rain"></i>`
        break
      case "thunderstorm":
        weatherIcon.innerHTML = `<i class="fa-solid fa-cloud-bolt"></i>`
        break
      case "mist":
      case "haze":
      case "fog":
        weatherIcon.innerHTML = `<i class="fa-solid fa-cloud-fog"></i>`
        break
      default:
        weatherIcon.innerHTML = `<i class="fa-solid fa-cloud"></i>`
    }

    card.innerHTML = `
      <div class="flex flex-col gap-4">
        ${dateHeader.outerHTML}
        ${weatherIcon.outerHTML}
      </div>
      <div class="flex flex-col gap-2">
        <p>Temp: ${tempC}°C</p>
        <p>Wind: ${avgWind.toFixed(1)} M/S</p>
        <p>Humidity: ${humidityP}%</p>
      </div>
    `

    forecastContainer.appendChild(card)
    count++
  }
}
