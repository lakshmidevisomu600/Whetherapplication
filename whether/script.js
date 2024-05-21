const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  uvIndex = document.querySelector(".uv-index"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "week";

// function to get date and time
function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // 12 hours format
  hour = hour % 12;
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

//Updating date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

// function to get public ip address
function getPublicIp() {
  fetch("https://geolocation-db.com/json/", {
    method: "GET",
    headers: {},
  })
    .then((response) => response.json())
    .then((data) => {
      currentCity = data.city;
      getWeatherData(data.city, currentUnit, hourlyorWeek);
    })
    .catch((err) => {
      console.error(err);
    });
}

getPublicIp();

// function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }
      currentLocation.innerText = data.resolvedAddress;
      condition.innerText = today.conditions;
      rain.innerText = "Perc - " + today.precip + "%";
      uvIndex.innerText = today.uvindex;
      windSpeed.innerText = today.windspeed;
      measureUvIndex(today.uvindex);
      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);
      humidity.innerText = today.humidity + "%";
      updateHumidityStatus(today.humidity);
      visibilty.innerText = today.visibility;
      updateVisibiltyStatus(today.visibility);
      airQuality.innerText = today.winddir;
      updateAirQualityStatus(today.winddir);
      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
      }
      sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
      sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
    })
    .catch((err) => {
      alert("City not found in our database");
    });
}

//function to update Forecast
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celciusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
    weatherCards.appendChild(card);
    day++;
  }
}

// function to change weather icons
function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "images/cloud-sun.png";
  } else if (condition === "partly-cloudy-night") {
    return "images/cloud-moon.png";
  } else if (condition === "rain") {
    return "images/rain.png";
  } else if (condition === "clear-day") {
    return "images/sun.png";
  } else if (condition === "clear-night") {
    return "images/moon.png";
  } else {
    return "images/sun.png";
  }
}

// function to change background depending on weather conditions
function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === "partly-cloudy-day") {
    bg = "images/clear-sky.jpg";
  } else if (condition === "partly-cloudy-night") {
    bg = "images/night-moon.jpg";
  } else if (condition === "rain") {
    bg = "images/Rainy.jpg";
  } else if (condition === "clear-day") {
    bg = "images/Sunny.jpg";
  } else if (condition === "clear-night") {
    bg = "images/clear night.jpg";
  } else {
    bg = "images/Cloudy.jpg";
  }
  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

//get hours from hh:mm:ss
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

// convert time to 12 hour format
function covertTimeTo12HourFormat(time) {
  let hour = time.split(":")[0];
  let minute = time.split(":")[1];
  let ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  let strTime = hour + ":" + minute + " " + ampm;
  return strTime;
}

// function to get day name from date
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

// function to get uv index status
function measureUvIndex(uvIndex) {
  if (uvIndex <= 2) {
    uvText.innerText = "Low";
  } else if (uvIndex <= 5) {
    uvText.innerText = "Moderate";
  } else if (uvIndex <= 7) {
    uvText.innerText = "High";
  } else if (uvIndex <= 10) {
    uvText.innerText = "Very High";
  } else {
    uvText.innerText = "Extreme";
  }
}

// function to get humidity status
function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

// function to get visibility status
function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Dense Fog";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Moderate Fog";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Light Fog";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Very Light Fog";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Light Mist";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Very Light Mist";
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Clear Air";
  } else {
    visibilityStatus.innerText = "Very Clear Air";
  }
}

// function to get air quality status
function updateAirQualityStatus(airquality) {
  if (airquality <= 50) {
    airQualityStatus.innerText = "Good👌";
  } else if (airquality <= 100) {
    airQualityStatus.innerText = "Moderate😐";
  } else if (airquality <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups😷";
  } else if (airquality <= 200) {
    airQualityStatus.innerText = "Unhealthy😷";
  } else if (airquality <= 250) {
    airQualityStatus.innerText = "Very Unhealthy😨";
  } else {
    airQualityStatus.innerText = "Hazardous😱";
  }
}

// function to handle search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(location, currentUnit, hourlyorWeek);
  }
});

// function to conver celcius to fahrenheit
function celciusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32).toFixed(1);
}


var currentFocus;
search.addEventListener("input", function (e) {
  removeSuggestions();
  var a,
    b,
    i,
    val = this.value;
  if (!val) {
    return false;
  }
  currentFocus = -1;

  a = document.createElement("ul");
  a.setAttribute("id", "suggestions");

  this.parentNode.appendChild(a);

  for (i = 0; i < cities.length; i++) {
    /*check if the item starts with the same letters as the text field value:*/
    if (
      cities[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()
    ) {
      /*create a li element for each matching element:*/
      b = document.createElement("li");
      /*make the matching letters bold:*/
      b.innerHTML =
        "<strong>" + cities[i].name.substr(0, val.length) + "</strong>";
      b.innerHTML += cities[i].name.substr(val.length);
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML += "<input type='hidden' value='" + cities[i].name + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
      b.addEventListener("click", function (e) {
        /*insert the value for the autocomplete text field:*/
        search.value = this.getElementsByTagName("input")[0].value;
        removeSuggestions();
      });

      a.appendChild(b);
    }
  }
});
/*execute a function presses a key on the keyboard:*/
search.addEventListener("keydown", function (e) {
  var x = document.getElementById("suggestions");
  if (x) x = x.getElementsByTagName("li");
  if (e.keyCode == 40) {
    /*If the arrow DOWN key
      is pressed,
      increase the currentFocus variable:*/
    currentFocus++;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 38) {
    /*If the arrow UP key
      is pressed,
      decrease the currentFocus variable:*/
    currentFocus--;
    /*and and make the current item more visible:*/
    addActive(x);
  }
  if (e.keyCode == 13) {
    /*If the ENTER key is pressed, prevent the form from being submitted,*/
    e.preventDefault();
    if (currentFocus > -1) {
      /*and simulate a click on the "active" item:*/
      if (x) x[currentFocus].click();
    }
  }
});
function addActive(x) {
  /*a function to classify an item as "active":*/
  if (!x) return false;
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  /*add class "autocomplete-active":*/
  x[currentFocus].classList.add("active");
}
function removeActive(x) {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("active");
  }
}

function removeSuggestions() {
  var x = document.getElementById("suggestions");
  if (x) x.parentNode.removeChild(x);
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("c");
});

// function to change unit
function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (unit === "c") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

// function to change hourly to weekly or vice versa
function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}



// Cities add your own to get in search

cities = [
    {"country": "IN","name": "Mumbai","lat": "19.0760","lng": "72.8777",},
    {"country": "IN", "name": "Delhi","lat": "28.7041","lng": "77.1025",},
    {"country": "IN","name": "Bangalore","lat": "12.9716","lng": "77.5946",},
    {"country": "IN","name": "Tamil Nadu","lat": "11.1271","lng": "78.6569"},
    {"country": "IN","name": "Kerala","lat": "10.8505","lng": "76.2711"},
    {"country": "IN","name": "Adoni","lat": "15.6280","lng": "77.2749"},
    {"country": "IN","name": "Amaravati","lat": "16.4973","lng": "80.6480"},
    {"country": "IN","name": "Anantapur","lat": "14.6808","lng": "77.6006"},
    {"country": "IN","name": "Chandragiri","lat": "13.6288","lng": "79.4142"},
    {"country": "IN","name": "Chittoor","lat": "13.2174","lng": "79.1006"},
    {"country": "IN","name": "Dowlaiswaram","lat": "16.3149","lng": "81.7144"},
    {"country": "IN","name": "Eluru","lat": "16.7106","lng": "81.0952"},
    {"country": "IN","name": "Guntur","lat": "16.3067","lng": "80.4365"},
    {"country": "IN","name": "Kadapa","lat": "14.4674","lng": "78.8242"},
    {"country": "IN","name": "Kakinada","lat": "16.9891","lng": "82.2475"},
    {"country": "IN","name": "Kurnool","lat": "15.8281","lng": "78.0373"},
    {"country": "IN","name": "Machilipatnam","lat": "16.1875","lng": "81.1389"},
    {"country": "IN","name": "Nagarjunakoṇḍa","lat": "16.8340","lng": "79.3151"},
    {"country": "IN","name": "Nellore","lat": "14.4426","lng": "79.9865"},
    {"country": "IN","name": "Rajahmundry","lat": "17.6868","lng": "83.2185"},
    {"country": "IN","name": "Srikakulam","lat": "18.2944","lng": "83.8930"},
    {"country": "IN","name": "Tirupati","lat": "13.6288","lng": "79.4192"},
    {"country": "IN","name": "Vijayawada","lat": "16.5062","lng": "80.6480"},
    {"country": "IN","name": "Visakhapatnam","lat": "17.6868","lng": "83.2185"},
    {"country": "IN","name": "Vizianagaram","lat": "18.1067","lng": "83.3956"},
          {"country": "IN","name": "Yemmiganur","lat": "15.7312","lng": "77.4845"},
          {"country": "IN","name": "Adilabad","lat": "19.6722","lng": "78.5320"},
            {"country": "IN", "name": "Bhadradri Kothagudem", "lat": "17.5566", "lng": "80.6188"},
            {"country": "IN", "name": "Hanumakonda", "lat": "17.9837", "lng": "79.5356"},
            {"country": "IN", "name": "Hyderabad", "lat": "17.3850", "lng": "78.4867"},
            {"country": "IN", "name": "Jagtial", "lat": "18.7948", "lng": "78.9157"},
            {"country": "IN", "name": "Jangaon", "lat": "17.7265", "lng": "79.1445"},
            {"country": "IN", "name": "Jayashankar Bhupalpally", "lat": "18.2315", "lng": "80.0417"},
            {"country": "IN", "name": "Jogulamba Gadwal", "lat": "16.2313", "lng": "77.8003"},
            {"country": "IN", "name": "Kamareddy", "lat": "18.3160", "lng": "78.3500"},
            {"country": "IN", "name": "Karimnagar", "lat": "18.4392", "lng": "79.1288"},
            {"country": "IN", "name": "Khammam", "lat": "17.2500", "lng": "80.1600"},
            {"country": "IN", "name": "Kumuram Bheem", "lat": "19.6350", "lng": "79.7002"},
            {"country": "IN", "name": "Mahabubabad", "lat": "17.5989", "lng": "80.0023"},
            {"country": "IN", "name": "Mahabubnagar", "lat": "16.7325", "lng": "77.9825"},
            {"country": "IN", "name": "Mancherial", "lat": "18.8704", "lng": "79.4304"},
            {"country": "IN", "name": "Medak", "lat": "18.0453", "lng": "78.2600"},
            {"country": "IN", "name": "Medchal-Malkajgiri", "lat": "17.6293", "lng": "78.4832"},
            {"country": "IN", "name": "Mulugu", "lat": "18.0964", "lng": "80.6774"},
            {"country": "IN", "name": "Nagarkurnool", "lat": "16.4854", "lng": "77.8628"},
            {"country888": "IN", "name": "Nalgonda", "lat": "17.0568", "lng": "79.2680"},
            {"country": "IN", "name": "Narayanpet", "lat": "16.7488", "lng": "77.4982"},
            {"country": "IN", "name": "Nirmal", "lat": "19.0962", "lng": "78.3442"},
            {"country": "IN", "name": "Nizamabad", "lat": "18.6732", "lng": "78.1008"},
            {"country": "IN", "name": "Peddapalli", "lat": "18.6159", "lng": "79.3734"},
            {"country": "IN", "name": "Rajanna Sircilla", "lat": "18.3860", "lng": "78.8116"},
            {"country": "IN", "name": "Rangareddy", "lat": "17.2335", "lng": "78.2937"},
            {"country": "IN", "name": "Sangareddy", "lat": "17.6282", "lng": "78.0866"},
            {"country": "IN", "name": "Siddipet", "lat": "18.1010", "lng": "78.8482"},
            {"country": "IN", "name": "Suryapet", "lat": "17.1396", "lng": "79.6190"},
            {"country": "IN", "name": "Vikarabad", "lat": "17.3386", "lng": "77.9043"},
            {"country": "IN", "name": "Wanaparthy", "lat": "16.3681", "lng": "78.0704"},
            {"country": "IN", "name": "Warangal", "lat": "17.9806", "lng": "79.5981"},
            {"country": "IN", "name": "Yadadri Bhuvanagiri", "lat": "17.1597", "lng": "78.6939"},
        
        
    
  ]



