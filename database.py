import mysql.connector.cursor
import mysql.connector.errors
from dbutils.pooled_db import PooledDB
import config
import time

class Database:
    def __init__(self):
        self.connection_pool = PooledDB(mysql.connector, 5,
                                        host=config.MySql.host,
                                        port=config.MySql.port,
                                        user=config.MySql.user,
                                        password=config.MySql.password,
                                        db=config.MySql.db,
                                        buffered=True
                                        )

        self.connection_pool.connection().cursor().execute("SET NAMES UTF8")

    @staticmethod
    def get_sql_from_file():
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
        connection = mysql.connector.connect(
            host=config.MySql.host,
            port=config.MySql.port,
            user=config.MySql.user,
            password=config.MySql.password,
            buffered=True
        )
        with connection.cursor() as cursor:
            try:
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {config.MySql.db}")
            except mysql.connector.Error as e:
                raise e
            connection.commit()
            connection.close()

        with self.connection_pool.connection() as con, con.cursor(dictionary=True) as cursor:
            # SQL queries as a list
            queries = self.get_sql_from_file()
            for query in queries:
                cursor.execute(query)

            # Commit changes and close connection
            con.commit()
            con.close()
            return

    def get_data(self, from_date, to_date):
        """
        Reads the data records of specified time range.

        Parameters
        ----------
        from_date : str
            datetime
            Specifies starting point of query
        to_date : str
            datetime
            Specifies end point of query
        """
        with self.connection_pool.connection() as con, con.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM `data` WHERE DATE(`measured`) BETWEEN '%s' AND '%s'" % (from_date, to_date))
            result = cursor.fetchall()
            con.close()
            return result

    def insert_data(self, temperature, weight, humidity):
        """
        Inserts a new dataset into the database.

        Parameters
        ----------
        temperature : str
            float
            Current temperature
        weight : str
            float
            Current weight
        humidity : str
            float
            Current humidity
        """
        with self.connection_pool.connection() as con, con.cursor(dictionary=True) as cursor:
            date = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

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
            con.commit()
            con.close()
            return

    def scales(self, number, weight):
        """
        Inserts a new dataset for a specific scale into the database.
        A collumn with the name of "number" must exist!

        Parameters
        ----------
        number : str
            The unique number of the scale
        weight : str
            float
            Current weight
        """
        with self.connection_pool.connection() as con, con.cursor(dictionary=True) as cursor:
            date = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            cursor.execute("SELECT * FROM data ORDER BY number DESC LIMIT 1")
            res = cursor.fetchone()
            cursor.execute("DESCRIBE data")
            fields = cursor.fetchall()
            fields = [str(x["Field"]) for x in fields]
            if number not in fields:
                return "No column in database for this scale"
            if res is not None and res[number] is None:
                sql = "UPDATE data SET `%s` = '%s' WHERE number = '%s'" % (number, weight, res['number'])
            else:
                sql = "INSERT INTO `data` (`%s`, `measured`) VALUES (%s, '%s')" % (number, weight, date)

            print(sql)

            cursor.execute(str(sql))
            con.commit()
            con.close()

            log = open("logs/insert.log", mode="a")
            log.write("\n[%s] - %s" % (time.asctime(), sql))
            log.close()
            return

    def insert_rss_feed(self, feed, data):
        """
        Inserts a new feed item into the database.

        Parameters
        ----------
        feed : str
            Name of the feed.
            Currently only "data", "admin", or "warning".
        data : str
            The text to insert.
        """
        pass
