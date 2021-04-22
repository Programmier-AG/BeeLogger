import logging
import time
import pymysql
import config


def scales(r_data):
    if r_data["token"] != config.insert_token: return "invalid insert_token."
    if r_data["w"] is not None and r_data["n"] is not None:
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

        date = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        real_tare = config.real_tare[int(r_data["n"])] if int(r_data["n"]) in config.real_tare.keys() else config.real_tare[0]
        correction = config.correction[int(r_data["n"])] if int(r_data["n"]) in config.correction.keys() else config.correction[0]
        weight = float(r_data["w"]) * correction - real_tare

        cursor = connection.cursor()
        cursor.execute("SELECT * FROM data ORDER BY number DESC LIMIT 1")
        res = cursor.fetchone()
        cursor.execute("DESCRIBE data")
        fields = cursor.fetchall()
        fields = [str(x["Field"]) for x in fields]
        if not r_data["n"] in fields:
            return "No column in database for this scale"
        if res is not None and res[r_data["n"]] is None:
            sql = "UPDATE data SET `%s` = '%s' WHERE number = '%s'" % (r_data['n'], weight, res['number'])
        else:
            sql = "INSERT INTO `data` (`%s`, `measured`) VALUES (%s, '%s')" % (r_data['n'], weight, date)

        print(sql)

        cursor.execute(str(sql))
        connection.commit()

        log = open("insert.log", mode="a")
        log.write("\n[%s] - %s" % (time.asctime(), sql))
        log.close()

        return "data inserted"

    return "invalid arguments"
