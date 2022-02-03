import flask
from flask import Blueprint, request

import utils.weather_manager
from api.get_data import get_data
from api.insert_data import insert_data
from api.scales import scales

# Initialize Blueprint for API routes
api = Blueprint("api", __name__)

# /api/data/get
api.add_url_rule("/data/get", view_func=get_data, methods=["GET"])

# /api/data/insert
api.add_url_rule("/data/insert", view_func=insert_data, methods=["GET"])

# /api/data/scales
api.add_url_rule("/data/scales", view_func=scales, methods=["GET"])


@api.route("/weather")
def weather():
    return utils.weather_manager.data

@api.route("/weather_icon")
def weather_icon():
    icon_id = int(request.args["icon"])

    if icon_id < 300:
        return flask.send_file("public/assets/weather_icons/thunder.svg")

    if icon_id == 800:
        return flask.send_file("public/assets/weather_icons/day.svg")

    if icon_id == 801:
        return flask.send_file("public/assets/weather_icons/cloudy-day-1.svg")
    if icon_id == 802:
        return flask.send_file("public/assets/weather_icons/cloudy-day-2.svg")
    if icon_id == 803:
        return flask.send_file("public/assets/weather_icons/cloudy-day-3.svg")
    if icon_id == 804:
        return flask.send_file("public/assets/weather_icons/cloudy.svg")

    if icon_id in [301, 311, 321, 501, 521]:
        return flask.send_file("public/assets/weather_icons/rainy-1.svg")
    if icon_id in [300, 310, 500, 520]:
        return flask.send_file("public/assets/weather_icons/rainy-2.svg")
    if icon_id in [302, 312, 502, 503, 504]:
        return flask.send_file("public/assets/weather_icons/rainy-3.svg")

    if icon_id in [520]:
        return flask.send_file("public/assets/weather_icons/rainy-4.svg")
    if icon_id in [313, 321, 521, 531]:
        return flask.send_file("public/assets/weather_icons/rainy-5.svg")
    if icon_id in [314, 522]:
        return flask.send_file("public/assets/weather_icons/rainy-6.svg")

    if icon_id in [511, 601, 611, 616]:
        return flask.send_file("public/assets/weather_icons/snowy-1.svg")
    if icon_id in [600, 615]:
        return flask.send_file("public/assets/weather_icons/snowy-2.svg")
    if icon_id in [602]:
        return flask.send_file("public/assets/weather_icons/snowy-3.svg")

    if icon_id in [612, 620]:
        return flask.send_file("public/assets/weather_icons/snowy-4.svg")
    if icon_id in [613, 621]:
        return flask.send_file("public/assets/weather_icons/snowy-5.svg")
    if icon_id in [622]:
        return flask.send_file("public/assets/weather_icons/snowy-6.svg")
