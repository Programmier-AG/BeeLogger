from flask.globals import request
from database import Database
from flask import request
import pymysql
import config


def insert_data():
    r_data = request.args
    if r_data["token"] != config.insert_token: return "invalid insert_token."
    if r_data["t"] is not None and r_data["w"] is not None and r_data["h"]:
        print("INSERT >> Received valid data: ", r_data)

        database = Database()
        database.insert_data(r_data["t"], r_data["w"], r_data["h"])

        return "data inserted"

    return "invalid arguments"
