import logging
import time
import pymysql
import config


def insert_data(r_data):
    if r_data["token"] != config.insert_token: return "invalid insert_token."
    if r_data["t"] is not None and r_data["w"] is not None and r_data["h"]:
        print("INSERT >> Received valid data: ", r_data)
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
            date = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            cursor = connection.cursor()
            sql = "INSERT INTO `data` (`number`, `temperature`, `weight`, `humidity`, `measured`) VALUES (0, %s, %s, %s, '%s')" % (float(r_data["t"]), float(r_data["w"]), float(r_data["h"]), date)

            log = open("insert.log", mode="a")
            log.write("\n[%s] - %s" % (time.asctime(), sql))
            log.close()

            cursor.execute(sql)
            connection.commit()
            return "data inserted"
        except Exception as error:
            return "error: %s" % error

    return "invalid arguments"
