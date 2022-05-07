import datetime

from flask import request

import config
import notifications
from database import Database


def insert_data():
    r_data = request.args
    if r_data["token"] != config.insert_token: return "invalid insert_token."
    if r_data["t"] is not None and r_data["w"] is not None and r_data["h"]:
        print("INSERT >> Received valid data: ", r_data)

        database = Database()

        # TODO: Implement proper check system
        # Check for weight differences > 500g
        try:
            current = database.get_data(datetime.date.strftime(datetime.date.today()-datetime.timedelta(days=5), "%Y-%m-%d"),
                                        datetime.date.strftime(datetime.date.today(), "%Y-%m-%d"))[-1]
            if current["weight"] - float(r_data["w"]) > 0.5:
                notifications.Feed().push_notification("warning",
                                                       "Gewichtsabfall!",
                                                       "Das Gewicht ist bei der aktuellen Messung um %sg abgefallen!"
                                                       % str(round(float(r_data["w"]) - current["weight"], 2)))
        except Exception as e:
            print("Error while performing data checks!\n"
                  "ignoring to still have data inserted\n%s" % e)

        database.insert_data(r_data["t"], r_data["w"], r_data["h"])

        return "data inserted"

    return "invalid arguments"
