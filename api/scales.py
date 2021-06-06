from database import Database
from flask import request
from werkzeug import datastructures
import config


def scales():
    r_data = request.args
    if r_data["token"] != config.insert_token: return "invalid insert_token."
    if r_data["w"] is not None and r_data["n"] is not None:
        print("INSERT >> Received valid data: ", r_data)

        real_tare = config.real_tare[int(r_data["n"])] if int(r_data["n"]) in config.real_tare.keys() else config.real_tare[0]
        correction = config.correction[int(r_data["n"])] if int(r_data["n"]) in config.correction.keys() else config.correction[0]
        weight = float(r_data["w"]) * correction - real_tare
        number = r_data["n"]

        database = Database()
        database.scales(number, weight)

        return "data inserted"

    return "invalid arguments"
