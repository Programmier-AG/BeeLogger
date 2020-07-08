import os
import smtplib
import statistics
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from flask import Flask, make_response, redirect, render_template, request

import config
from api import get_data, get_statistics, insert_data
from crossdomain import crossdomain

if not os.path.isfile("app.py"):
    print("You need to start this script from the directory it's contained in. Please cd into that folder.")
    exit()

app = Flask("BeeLogger", static_folder='public', static_url_path='', template_folder='pages')

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
        
    return render_template("slideshow.html")

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
    msg["To"] = "fabian@itechnious.com, sonke@itechnious.com"

    if "file" in request.form.keys():
        f = request.files["file"]
        f.save("contact/"+f.filename)

        with open("contact/"+f.filename, "rb") as fil:
            part = MIMEApplication(
                fil.read(),
                Name=f.filename
            )
        
        part['Content-Disposition'] = 'attachment; filename="%s"' % f.filename
        msg.attach(part)

    server = smtplib.SMTP(config.Mail.host)
    server.connect(config.Mail.host, config.Mail.port)
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(config.Mail.user + "@" + config.Mail.host, config.Mail.password)
    server.send_message(msg)
    server.quit()

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

@app.route("/api/stats", methods=["GET"])
@crossdomain(origin="*", current_app=app)
def getStatistics():
    return get_statistics.get_statistics()

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=config.web_port)
