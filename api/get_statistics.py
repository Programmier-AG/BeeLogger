import json
import pymysql
import time
from flask import jsonify

import config

date = time.strftime("%Y-%m")

def get_statistics():
    try:
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
        cursor.execute("select * from statistics")
        result = cursor.fetchall()

        return result[0]
    except Exception as e:
        return str(e)