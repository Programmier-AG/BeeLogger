import pymysql
import config
import datetime
from flask import jsonify

def get_data(r_data):
    if len(r_data["from"]) < 10 or len(r_data["to"]) < 10: return "date must have following format: 'yyyy-mm-dd'"

    connection = pymysql.connect(
        host=config.MySql.host,
        port=config.MySql.port,
        user=config.MySql.user,
        password=config.MySql.password,
        db=config.MySql.db,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

    cursor = connection.cursor()
    cursor.execute("SELECT * FROM `data` WHERE DATE(`measured`) BETWEEN '%s' AND '%s'" % (r_data["from"], r_data["to"]))
    result = cursor.fetchall()

    compressed = False
    if "compressed" in r_data.keys():
        compressed = True

    fetched_data = {}
    row_count = 0
    last_date = 0

    for row in result:
        row["weight"] = row["weight"] - config.tare[0]

        for i in range(1, len(row.keys())):
            if str(i) in row.keys() and row[str(i)] is not None:
                if i in config.tare.keys():
                    row[str(i)] = row[str(i)] - config.tare[i]
                else:
                    row[str(i)] = row[str(i)] - config.tare[0]

        fetched_data[row_count] = row

        row_count += 1

    if compressed == True:
        compressed_data = []

        # All values for one day (for later calculating average value)
        temp = []
        weight = []
        humidity = []

        last_date = 0
        for row in fetched_data:
            if last_date == 0:
                last_date = fetched_data[row]["measured"].date()
            
            if last_date == fetched_data[row]["measured"].date():
                temp.append(fetched_data[row]["temperature"])
                weight.append(fetched_data[row]["weight"])
                humidity.append(fetched_data[row]["humidity"])
            else:
                # Get an average int of all ints in array
                temp_avg = sum(temp) / len(temp)
                weight_avg = sum(weight) / len(weight)
                humidity_avg = sum(humidity) / len(humidity)

                # Clear all arrays for next day
                temp.clear()
                weight.clear()
                humidity.clear()

                # Append average value for day to compressed_data array
                compressed_data.append({
                    "temperature": round(temp_avg, 2),
                    "weight": round(weight_avg, 2),
                    "humidity": round(humidity_avg, 2),
                    "measured": last_date
                })
                last_date = fetched_data[row]["measured"].date()
        
        return jsonify(compressed_data)

    return jsonify(fetched_data)
