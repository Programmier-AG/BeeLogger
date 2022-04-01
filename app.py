import datetime
import os
import sys
import threading

import flask
from flask import Flask, request, render_template

import config
import utils.scheduler
import utils.weather_manager
from blueprints.api import api
from blueprints.rss import rss
from blueprints.views import views
from database import Database
from notifications import Feed
from telegram import bot as telegram_bot
from utils.jsonencoder import CustomJSONEncoder

print("waiting until db is ready")
os.popen(f"/bin/bash ./docker/wait-for-it.sh {config.MySql.host}:{str(config.MySql.port)}").read()
print("db ready")

# Check whether the script is started from the directory it's contained in
if not os.path.isfile("app.py"):
    print("You need to start this script from the directory it's contained in. Please cd into that folder.")
    exit()

path = os.path.abspath("logs")
if not os.path.exists(path): os.mkdir(path)

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


@app.route("/opt-in")
def opt_in():
    if "OPT_IN_COMNFIRM" in request.args.keys():
        response = flask.make_response(flask.redirect("/"))
        response.set_cookie("opt-in", "true", max_age=36000, expires=(datetime.date.today()+datetime.timedelta(days=365)).toordinal())
        return response
    return render_template("opt-in.html", privacy_url=config.privacy_url)
@app.route("/opt-out")
def opt_out():
    response = flask.make_response(flask.redirect("/"))
    response.delete_cookie("opt-in")
    return response

# Route to check if provider can insert
@app.route("/healthcheck/")
def check_provider():
    if "insert" in request.args.keys():
        if request.args["token"] == config.insert_token:
            return "OK"
        else:
            return "Invalid token", 401
    else:
        return "Don't know how to check", 400

@app.after_request
def add_header_check_cookies(r):
    if request.cookies.get("opt-in") != "true" and request.path.split("/")[1] not in ["opt-in",
                                                                                      "display",
                                                                                      "healthcheck",
                                                                                      "opt-out",
                                                                                      "api",
                                                                                      "rss",
                                                                                      "lib",
                                                                                      "assets",
                                                                                      "css",
                                                                                      "js",
                                                                                      "favicon.ico"]:
        response = flask.make_response(flask.redirect("/opt-in"))

        for cookie in request.cookies:
            response.delete_cookie(cookie)
        return response
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

scheduler_thread = threading.Thread(target=utils.scheduler.run_tasks)
scheduler_thread.daemon = True
scheduler_thread.start()

Feed().push_notification("admin", "Beelogger gestartet", "BeeLogger wurde gerade gestartet...")


# Start the app
if __name__ == "__main__":
    try:
        app.run(host='0.0.0.0', port=config.web_port)
    except (KeyboardInterrupt, SystemExit):
        print(">>> Stopping BeeLogger...")
        database.connection_pool.close()
        sys.exit(0)
