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

    privacy_url = ""
    server_scheme = "https"
    auto_server_name = "true"
    server_name = "<url>:<port>"

    insert_token = ""
    display_token = ""

    correction = {0: 1}  # Gets multiplied by the weight before insertion
    tare = {0: 0}  # tare value after selection from database
    real_tare = {0: 0}  # tare value before insertion into database

    class MySql:
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

    class Weather:
        location = ""
        api_key = ""
        lang = ""


    embedded_pages = {

    }


else:
    telegram_bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")

    privacy_url = os.environ.get("PRIVACY_URL", "")
    server_scheme = os.environ.get("SERVER_SCHEME", "http")
    server_name = os.environ.get("SERVER_NAME", "localhost")

    insert_token = os.environ.get("INSERT_TOKEN", "")
    display_token = os.environ.get("DISPLAY_TOKEN", "")

    correction = json.loads(os.environ.get("CORRECTION", '"0": 1'), object_hook=jsonkeys2int)
    tare = json.loads(os.environ.get("TARE", '"0": 0'), object_hook=jsonkeys2int)
    real_tare = json.loads(os.environ.get("REAL_TARE", '"0": 0'), object_hook=jsonkeys2int)


    class MySql:
        host = os.environ.get("MYSQL_HOST", "")
        port = int(os.environ.get("MYSQL_PORT", 3306))
        user = os.environ.get("MYSQL_USER", "beelogger")
        password = os.environ.get("MYSQL_PASS", "")
        db = os.environ.get("MYSQL_DB", "beelogger")


    class MySqlBackup:
        host = os.environ.get("MYSQL_BACKUP_HOST", "")
        port = int(os.environ.get("MYSQL_BACKUP_PORT", 3306))
        user = os.environ.get("MYSQL_BACKUP_USER", "")
        password = os.environ.get("MYSQL_BACKUP_PASS", "")
        db = os.environ.get("MYSQL_BACKUP_DB", "")


    class FileBackup:
        host = os.environ.get("FILE_BACKUP_HOST", "")
        port = int(os.environ.get("FILE_BACKUP_PORT", 22))
        user = os.environ.get("FILE_BACKUP_USER", "")
        password = os.environ.get("FILE_BACKUP_PASS", "")
        key = os.environ.get("FILE_BACKUP_KEY", "")
        directory = os.environ.get("FILE_BACKUP_DIRECTORY", "")


    class Mail:
        host = os.environ.get("MAIL_HOST", "")
        port = int(os.environ.get("MAIL_PORT", 465))
        user = os.environ.get("MAIL_USER", "")
        password = os.environ.get("MAIL_PASS", "")
        reciever = os.environ.get("MAIL_RECIEVER", "")

    class Weather:
        location = os.environ.get("WEATHER_LOCATION", "")
        api_key = os.environ.get("WEATHER_API_KEY", "")
        lang = os.environ.get("WEATHER_LANG", "de")


    embedded_pages = json.loads(os.environ.get("EMBEDDED_PAGES", '{}'))
