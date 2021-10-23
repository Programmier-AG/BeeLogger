from database import Database
import config
from flask import jsonify, request
import numpy as np

def get_data():
    if len(request.args["from"]) < 10 or len(request.args["to"]) < 10: return "date must have following format: 'yyyy-mm-dd'"

    database = Database()
    result = database.get_data(request.args["from"], request.args["to"])

    # If "compressed" is submitted, tell api to compress data (see if compressed: below)
    compressed = True if "compressed" in request.args.keys() else False

    fetched_data = {}
    row_count = 0

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

    if compressed:
        compressed_data = []

        if "width" in request.args.keys():
            width = int(request.args["width"])
            amount = width / 8  # Tune Value for row_count vs. width values
            amount = int(amount) + 1  # Account for float values
        else:
            amount = int(request.args["amount"])

        compress_count = round(row_count / amount)

        print("compressing from %s to %s values with interval %s" % (row_count, amount, compress_count))

        c_row_count = 0
        temp = []
        weight = []
        humidity = []
        date = []
        while c_row_count < row_count:
            # Gather data within interval
            for i in range(compress_count):
                try:
                    temp.append(fetched_data[c_row_count]["temperature"])
                    weight.append(fetched_data[c_row_count]["weight"])
                    humidity.append(fetched_data[c_row_count]["humidity"])
                    date.append(fetched_data[c_row_count]["measured"])
                except KeyError:
                    break
                finally:
                    c_row_count += 1

            # Average data
            temp_avg = sum(temp) / len(temp)
            weight_avg = sum(weight) / len(weight)
            humidity_avg = sum(humidity) / len(humidity)

            insert_date = (np.array(date, dtype='datetime64[s]')  # Calculate mean measure time
                           .view('i8')                            # https://stackoverflow.com/a/35600296
                           .mean()
                           .astype('datetime64[s]'))

            # Add parsed data to list
            compressed_data.append({
                "temperature": round(temp_avg, 2),
                "weight": round(weight_avg, 2),
                "humidity": round(humidity_avg, 2),
                "measured": str(insert_date)
            })

            # Clear 'helper lists' for next run
            temp.clear()
            weight.clear()
            humidity.clear()
            date.clear()

        return jsonify(
            {"original": len(fetched_data),
             "compressed": len(compressed_data),
             "interval": compress_count,
             "data": compressed_data}
        )

    """
    if compressed:
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
    """

    return jsonify({"rows": row_count, "data": fetched_data})
