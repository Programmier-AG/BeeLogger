import config
import os
from blueprints.api import api
from blueprints.views import views
from flask import Flask
from database import Database
from utils.jsonencoder import CustomJSONEncoder

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


# Start the app
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=config.web_port)
