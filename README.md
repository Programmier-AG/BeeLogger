# BeeLogger-rewrite
## Deploying BeeLogger
* The Arduino and the API must be able to communicate via LAN or the internet
* You can set up a hotspot: https://www.raspberrypi.org/documentation/configuration/wireless/access-point-routed.md

### Installing packages
These packages are needed
`sudo apt install git python3 python3-pip python3-dev`

### Setting up WSGI
I this case we will use Apache2 in combination with Python3.7 and mod_wsgi (pip)

So let's install the things

`sudo apt install apache2 apache2-dev libapache2-mod-wsgi-py3`

`python3 -m pip install mod_wsgi pymysql`

Now modify your apache2.conf with `sudo nano /etc/apache2/apache2.conf`

Add this at the bottom:
```
LoadModule wsgi_module /usr/local/lib/python3.7/dist-packages/mod_wsgi/server/mod_wsgi-py37.cpython-37m-arm-linux-gnueabihf.so
WSGIPythonHome "/usr"
```
If you use a different Python version, change the Path accordingly.

Now configure your virtual host:
`sudo nano /etc/apache2/sites-available/000-default.conf`

And change it to this:
```
<VirtualHost *:80>
    WSGIDaemonProcess beelogger threads=5 lang='de_DE.UTF-8' locale='de_DE.UTF-8'
    WSGIScriptAlias / /var/www/BeeLogger/wsgi/beelogger.wsgi

    <Directory /var/www/BeeLogger>
        WSGIProcessGroup beelogger
        WSGIApplicationGroup %{GLOBAL}
        Order deny,allow
        Allow from all
    </Directory>
</VirtualHost>
```

### Cloning BeeLogger
`cd /var/www`
`git clone https://github.com/Programmier-AG/BeeLogger`

Don't forget to set the permissions!
Don't forget to rename the example_config to `config` and fill in the data!

Finally restart Apache:
`sudo service apache2 restart`

## Setting up database
Install MySql server and client.

`sudo apt install mariadb-server mariadb-client`

Launch the admin panel of your choice or do the following in the console:

* Add a database
* Add a table into that database
* Create an user
* Grant the user permission on the db

The table should look like this:
| Field name | Type | Allow nulls | Key | Default Value | Extras |
| -----------|:----:|:-----------:|:---:|:-------------:|-------:|
|number      |bigint|No           |primary|NULL         |auto_increment|
|temperature |double|Yes          |None | NULL          |   -    |
|weight      |double|Yes          |None | NULL          |   -    |
|humidity    |double|Yes          |None | NULL          |   -    |
|measured    |datetime|Yes        |None | NULL          |   -    |

You can also create the database with the included sql file.

**You are ready to go!**

# Optional Chrome extension
If you want to secure the kiosk so that it stays on the BeeLogger page, just use the basic plugin for Chrome.
Open the background.js file and customize your kiosk URL. Then open the extension-manager and enable developer mode. Then select "load unpacked extension" and open the "Chrome Domain lock" folder, and off you go.

Note that this plugin makes the browser otherwise unusable since it forces to only have a single tab with the set website. It may also be difficult to remove the extension.test

# Third party dependencies
## Front-End
* [Materialize](https://materializecss.com/)
* [Material Icons](https://fonts.google.com/icons)
* [Google Charts](https://developers.google.com/chart)