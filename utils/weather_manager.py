import requests
from geopy.geocoders import Nominatim
from babel.dates import format_datetime, format_date


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
    data["now"]["datetime"] = format_datetime(data["now"]["dt"], "EEEE dd.MM.", locale=config.Weather.lang)
    data["forecast"] = raw["daily"]

    for i in range(len(data["forecast"])-1):
        data["forecast"][i]["datetime"] = format_datetime(data["forecast"][i]["dt"], "EEE dd.MM.", locale=config.Weather.lang)

