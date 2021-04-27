import os
import secrets
import smtplib
import ssl
from datetime import date
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate

from flask import Flask, redirect, render_template, request
from flask.json import JSONEncoder

import config
import statistics
from api import get_data, get_statistics, insert_data, scales
from crossdomain import crossdomain

if not os.path.isfile("app.py"):
    print("You need to start this script from the directory it's contained in. Please cd into that folder.")
    exit()

# Custom json encoder for returning date in ISO format
class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):  # pylint: disable=E0202
        try:
            if isinstance(obj, date):
                return obj.isoformat()
            iterable = iter(obj)
        except TypeError:
            pass
        else:
            return list(iterable)
        return JSONEncoder.default(self, obj)

app = Flask("BeeLogger", static_folder='public', static_url_path='', template_folder='pages')
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.json_encoder = CustomJSONEncoder

print("################################")
print("#     BeeLogger DataService    #")
print("#    -----------------------   #")
print("#     by Fabian R., Soenke K.  #")
print("################################")

# Front-End
@app.route("/")
def mainPage():
    statistics.update("website")
    return render_template("index.html")

@app.route("/display")
def display():
    if "token" not in request.args.keys():
        return redirect("/")
    if request.args["token"] != config.display_token:
        return redirect("/")
        
    return render_template("display.html")

@app.route("/simulate")
def simulate():
    return render_template("simulate.html")

@app.route("/post_contact", methods=["POST"])
def contactPost():
    message = request.form["message"]
    name = request.form["name"]
    emailaddr = request.form["email"]

    msg = MIMEMultipart()
    msg.attach(MIMEText(name + " schrieb uns über das Kontaktformular:\n\n"+message+"\n\nEnde der Nachricht. Falls du antworten möchtest, hier die E-Mail Adresse: "+emailaddr))

    msg["Subject"] = "Nachricht von " + name
    msg["From"] = "BeeLogger <%s>" % config.Mail.user + "@" + config.Mail.host
    msg["To"] = config.Mail.reciever
    msg["Date"] = formatdate(localtime=True)

    print(request.form)

    if 'file' in request.files:
        f = request.files["file"]
        if f.filename != "":
            if not os.path.exists("contact/"):
                os.mkdir("contact/")
            saved = secrets.token_urlsafe(10)
            print(saved)

            f.save("contact/"+saved)

            with open("contact/"+saved, "rb") as fil:
                part = MIMEApplication(
                    fil.read(),
                    Name=f.filename
                )

            part['Content-Disposition'] = 'attachment; filename="%s"' % f.filename
            msg.attach(part)

    with smtplib.SMTP_SSL(config.Mail.host, config.Mail.port, context=ssl.create_default_context()) as server:
        server.login(config.Mail.user, config.Mail.password)
        server.sendmail(config.Mail.user, config.Mail.reciever, msg.as_string())
        server.close()

    return "Deine Nachricht wurde gesendet. Wir werden dich demnächst kontaktieren.<br>Du wirst automatisch weitergeleitet...<meta http-equiv='refresh' content='3; URL=/'>"

# API
@app.route("/api/data/get")
@crossdomain(origin="*", current_app=app)
def getData():
    statistics.update("data_calls")
    return get_data.get_data(request.args)

@app.route("/api/data/insert", methods=["GET"])
@crossdomain(origin="*", current_app=app)
def insertData():
    statistics.update("insert_calls")
    return insert_data.insert_data(request.args)

@app.route("/api/data/scales", methods=["GET"])
@crossdomain(origin="*", current_app=app)
def insertDataScales():
    statistics.update("insert_calls")
    return scales.scales(request.args)

@app.route("/api/stats", methods=["GET"])
@crossdomain(origin="*", current_app=app)
def getStatistics():
    return get_statistics.get_statistics()


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=config.web_port)
