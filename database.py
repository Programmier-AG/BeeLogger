import pymysql
import config
import time

class Database:
    def __init__(self):
        self.mysql_args = {
            "host": config.MySql.host,
            "port": config.MySql.port,
            "user": config.MySql.user,
            "password": config.MySql.password,
            "db": config.MySql.db,
            "charset": "utf8mb4",
            "cursorclass": pymysql.cursors.DictCursor
        }

    def get_data(self, from_date, to_date):
        connection = pymysql.connect(**self.mysql_args)
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM `data` WHERE DATE(`measured`) BETWEEN '%s' AND '%s'" % (from_date, to_date))
        result = cursor.fetchall()
        connection.close()
        return result

    def insert_data(self, temperature, weight, humidity):
        connection = pymysql.connect(**self.mysql_args)
        date = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM data ORDER BY number DESC LIMIT 1")
        res = cursor.fetchone()

        if res is not None and res["weight"] is None:
            sql = "UPDATE data SET `temperature` = '%s', `weight` = '%s', `humidity` = '%s' WHERE number = '%s'" % (float(temperature), float(weight) * config.correction[0] - config.real_tare[0], float(humidity), res["number"])
        else:
            sql = "INSERT INTO `data` (`number`, `temperature`, `weight`, `humidity`, `measured`) VALUES (0, %s, %s, %s, '%s')" % (float(temperature), float(weight) * config.correction[0] - config.real_tare[0], float(humidity), date)

        log = open("insert.log", mode="a")
        log.write("\n[%s] - %s" % (time.asctime(), sql))
        log.close()

        cursor.execute(sql)
        connection.commit()
        connection.close()
        return

    def scales(self, number, weight):
        connection = pymysql.connect(**self.mysql_args)
        date = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM data ORDER BY number DESC LIMIT 1")
        res = cursor.fetchone()
        cursor.execute("DESCRIBE data")
        fields = cursor.fetchall()
        fields = [str(x["Field"]) for x in fields]
        if not number in fields:
            return "No column in database for this scale"
        if res is not None and res[number] is None:
            sql = "UPDATE data SET `%s` = '%s' WHERE number = '%s'" % (number, weight, res['number'])
        else:
            sql = "INSERT INTO `data` (`%s`, `measured`) VALUES (%s, '%s')" % (number, weight, date)

        print(sql)

        cursor.execute(str(sql))
        connection.commit()
        connection.close()

        log = open("insert.log", mode="a")
        log.write("\n[%s] - %s" % (time.asctime(), sql))
        log.close()

        return

    def get_statistics(self):
        connection = pymysql.connect(**self.mysql_args)
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM `statistics`")
        result = cursor.fetchall()
        return result