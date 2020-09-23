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

    try:
        if "compressed" in r_data:
            cursor = connection.cursor()
            cursor.execute("SELECT MIN(number) as number, temperature, weight, humidity, DATE_FORMAT(`measured`, '%%Y-%%m-%%d %%H:%%i:%%S') as measured FROM `data` WHERE DATE(`measured`) BETWEEN '%s' AND '%s' GROUP BY CAST(`measured` as DATE)" % (r_data["from"], r_data["to"]))
            result = cursor.fetchall()

        else:
            cursor = connection.cursor()
            cursor.execute("SELECT number, temperature, weight, humidity, DATE_FORMAT(`measured`, '%%Y-%%m-%%d %%H:%%i:%%S') as measured FROM `data` WHERE DATE(`measured`) BETWEEN '%s' AND '%s'" % (r_data["from"], r_data["to"]))
            result = cursor.fetchall()

        fetched_data = {}
        row_count = 0
        for row in result:
            fetched_data[row_count] = row
            row_count += 1
        
        return jsonify(fetched_data)
    except Exception as e:
        return str(e)