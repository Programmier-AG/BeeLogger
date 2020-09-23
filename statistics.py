import json
import time
import pymysql
import config

date = time.strftime("%Y-%m")

def update(event):
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
        cursor.execute("update statistics SET " + event + "=" + event + "+ 1 where id=1")
        connection.commit()

        connection.close()
        return True

    except:
        return False