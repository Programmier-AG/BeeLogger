import json
import os

def jsonkeys2int(x):
    if isinstance(x, dict):
        return {int(k): v for k, v in x.items()}
    return x


use_env = True

web_port = 2688


if not use_env:
    telegram_bot_token = ""

    insert_token = ""
    display_token = ""

    correction = {0: 1}  # Gets multiplied by the weight before insertion
    tare = {0: 0}  # tare value after selection from database
    real_tare = {0: 0}  # tare value before insertion into database

    class MySql:
        host = ""
        host = ""
        port = 3306
        user = "beelogger"
        password = ""
        db = "beelogger"

    class MySqlBackup:
        host = ""
        port = 3306
        user = ""
        password = ""
        db = ""

    class FileBackup:
        host = ""
        port = 2232
        user = ""
        password = ""
        key = ""
        directory = ""

    class Mail:
        host = ""
        port = 465
        user = ""
        password = ""
        reciever = ""


    embedded_pages = {

    }


else:
    telegram_bot_token = os.environ["telegram_bot_token"]

    insert_token = os.environ["insert_token"]
    display_token = os.environ["display_token"]

    correction = json.loads(os.environ["correction"], object_hook=jsonkeys2int)
    tare = json.loads(os.environ["tare"], object_hook=jsonkeys2int)
    real_tare = json.loads(os.environ["real_tare"], object_hook=jsonkeys2int)


    class MySql:
        host = os.environ["mysql_host"]
        port = int(os.environ["mysql_port"])
        user = os.environ["mysql_user"]
        password = os.environ["mysql_pass"]
        db = os.environ["mysql_db"]


    class MySqlBackup:
        host = os.environ["mysql_backup_host"]
        port = int(os.environ["mysql_backup_port"])
        user = os.environ["mysql_backup_user"]
        password = os.environ["mysql_backup_pass"]
        db = os.environ["mysql_backup_db"]


    class FileBackup:
        host = os.environ["backup_host"]
        port = int(os.environ["backup_port"])
        user = os.environ["backup_user"]
        password = os.environ["backup_pass"]
        key = os.environ["backup_key"]
        directory = os.environ["backup_dir"]


    class Mail:
        host = os.environ["mail_host"]
        port = int(os.environ["mail_port"])
        user = os.environ["mail_user"]
        password = os.environ["mail_pass"]
        reciever = os.environ["mail_rec"]


    embedded_pages = json.loads(os.environ["pages"])
