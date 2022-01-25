import os
import sys
import threading

from flask import Flask

import config
from blueprints.api import api
from blueprints.rss import rss
from blueprints.views import views
from database import Database
from notifications import Feed
from utils.jsonencoder import CustomJSONEncoder
from telegram import bot as telegram_bot

print("waiting until db is ready")
os.popen(f"/bin/bash ./docker/wait-for-it.sh {config.MySql.host}:{str(config.MySql.port)}").read()
print("db ready")

# Check whether the script is started from the directory it's contained in
if not os.path.isfile("app.py"):
    print("You need to start this script from the directory it's contained in. Please cd into that folder.")
    exit()

print("################################")
print("#           BeeLogger          #")
print("#    -----------------------   #")
print("#    by Fabian R., Soenke K.   #")
print("################################")

print("\nInitializing database...")

database = Database()

try:
    database.prepare_database()
    print("Database prepared.")
except Exception as exception:
    print("An error occurred while trying to connect to (and prepare) the database:")
    raise exception

# Initialize Flask app
app = Flask("BeeLogger", static_folder='public', static_url_path='', template_folder='pages')
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.json_encoder = CustomJSONEncoder

# Initialize all routes that display a rendered template
app.register_blueprint(views, url_prefix='/')

# Initialize all routes of the REST API
app.register_blueprint(api, url_prefix='/api')

# Initialize all routes for the RSS feeds
app.register_blueprint(rss, url_prefix='/rss')

# Append headers
@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    Credit: https://stackoverflow.com/a/34067710
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


if not config.telegram_bot_token == "":
    telegram_bot_thread = threading.Thread(target=telegram_bot.infinity_polling)
    telegram_bot_thread.daemon = True
    telegram_bot_thread.start()
else:
    print(">>> Not starting telegram bot because there is no token")

# Start the app
if __name__ == "__main__":
    try:
        app.run(host='0.0.0.0', port=config.web_port)
    except (KeyboardInterrupt, SystemExit):
        print(">>> Stopping BeeLogger...")
        database.connection_pool.close()
        sys.exit(0)
