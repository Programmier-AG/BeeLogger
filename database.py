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
    
    def get_sql_from_file(self):
        """
        Reads and parses SQL queries from provided .sql file.
        """
        from os import path

        file = "database.sql"

        # File did not exists
        if path.isfile(file) is False:
            print("Unable to open sql file '{}'.".format(file))
            return False
        else:
            with open(file, "r") as sql_file:
                query = sql_file.read().split(';')
                query.pop()
                return query

    def prepare_database(self) -> None:
        """
        Utilizes SQL from 'database.sql' to create all needed
        tables automatically.
        """
        connection = pymysql.connect(
            host=self.mysql_args["host"],
            port=self.mysql_args["port"],
            user=self.mysql_args["user"],
            password=self.mysql_args["password"],
            charset="utf8mb4"
        )
        with connection.cursor() as cursor:
            try:
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.mysql_args['db']}")
            except pymysql.err.Error as e:
                raise e
            connection.commit()
            connection.close()

        connection = pymysql.connect(**self.mysql_args)
        cursor = connection.cursor()
        
        # SQL queries as a list
        queries = self.get_sql_from_file()
        for query in queries:
            cursor.execute(query)

        # Commit changes and close connection
        connection.commit()
        connection.close()
        return
        

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

        log = open("logs/insert.log", mode="a")
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

        log = open("logs/insert.log", mode="a")
        log.write("\n[%s] - %s" % (time.asctime(), sql))
        log.close()
        return