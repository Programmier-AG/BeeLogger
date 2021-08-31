from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate
import os
import secrets
import smtplib
import ssl
from flask import Blueprint
from flask import render_template, request, redirect
import config

# Initialize Blueprint for visible routes with templates
views = Blueprint("views", __name__)

# /
@views.route("/")
def dashboard():
    return render_template("index.html", pages=config.embedded_pages)

# /display
@views.route("/display")
def display():
    if "token" not in request.args.keys():
        return redirect("/")
    if request.args["token"] != config.display_token:
        return redirect("/")
        
    return render_template("display.html", pages=config.embedded_pages)

# /<embedded_page>
@views.route("/<page>")
def embeddedPage(page):
    pages = config.embedded_pages

    if not page in pages.keys():
        return "this page doesn't exist"

    return render_template("embedded.html", page=pages[page])

# /post_contact
@views.route("/post_contact", methods=["POST"])
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

