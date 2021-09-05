from database import Database
import config
from flask import jsonify, request

def get_data():
    if len(request.args["from"]) < 10 or len(request.args["to"]) < 10: return "date must have following format: 'yyyy-mm-dd'"

    database = Database()
    result = database.get_data(request.args["from"], request.args["to"])

    compressed = False
    if "compressed" in request.args.keys():
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
