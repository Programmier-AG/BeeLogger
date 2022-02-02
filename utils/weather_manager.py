import requests
from geopy.geocoders import Nominatim

import config

geolocator = Nominatim(user_agent="BeeLogger")
location = geolocator.geocode(config.Weather.location)
print(f">>> FOUND LOCATION {location.latitude} N  {location.longitude} E FOR CITY {config.Weather.location}")

data = {}

def update_weather():
    raw = requests.get(f"https://api.openweathermap.org/data/2.5/onecall"
                       f"?units=metric"
                       f"&lang={config.Weather.lang}"
                       f"&lat={location.latitude}"
                       f"&lon={location.longitude}"
                       f"&appid={config.Weather.api_key}").json()

    data["now"] = raw["current"]
    data["forecast"] = raw["daily"]
