import pymysql
import config
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

    return jsonify(fetched_data)
