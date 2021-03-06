import pymysql, config, time, datetime, random

connection = pymysql.connect(
    host=config.MySql.host,
    port=config.MySql.port,
    user=config.MySql.user,
    password=config.MySql.password,
    db=config.MySql.db, 
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)

month = 1
day = 1
hour = 0

while month != 13:
    while day != 31:
        while hour != 24:
            try:
                cursor = connection.cursor()
                mmonth = month
                dday = day
                hhour = hour
                if len(str(month)) == 1: mmonth = "0" + str(month)
                if len(str(day)) == 1: dday = "0" + str(day)
                if len(str(hour)) == 1: hhour = "0" + str(hour)
                final_date = "2020-" + str(mmonth) + "-" + str(dday) + " " + str(hhour) + ":13:06"
                final_date = datetime.datetime.strptime(final_date, "%Y-%m-%d %H:%M:%S")
                cursor.execute("INSERT INTO `data` (`number`, `temperature`, `weight`, `humidity`, `measured`) VALUES (0, %s, %s, %s, '%s')" % (random.uniform(20.0, 30.0), random.uniform(50.0, 70.0), random.uniform(90.0, 120.0), final_date))
                connection.commit()
                print("Generated data for ", final_date, ".")
                hour += 1
            except ValueError:
                day = 1
                hour = 0
                month += 1
        hour = 0
        day += 1
    day = 1
    hour = 0
    month += 1