# BeeLogger-rewrite
## Deploying BeeLogger
* The Arduino and the API must be able to communicate via LAN or the internet
* You can set up a hotspot: https://www.raspberrypi.org/documentation/configuration/wireless/access-point-routed.md

## Setting up WSGI
I this case we will use Apache2 in combination with Python3.7 and mod_wsgi (pip)

So let's install the things

`sudo apt install apache2 apache2-dev`

`python3.7 -m pip install mod_wsgi pymysql`

Now modify your apache2.conf with `sudo nano /etc/apache2/apache2.conf`

Add this at the bottom:
```
LoadModule wsgi_module /usr/local/lib/python3.7/dist-packages/mod_wsgi/server/mod_wsgi-py37.cpython-37m-arm-linux-gnueabihf.so
WSGIPythonHome "/usr"
```
If you use a different Python version change the Path accordingly.

Now configure your virtual host:
`sudo nano /etc/apache2/sites-available/000-default.conf`

And change it to this:
```
<VirtualHost *:80>
    WSGIDaemonProcess beelogger threads=5 lang='de_DE.UTF-8' locale='de_DE.UTF-8' 
    WSGIScriptAlias / /var/www/beelogger/wsgi/beelogger.wsgi

    <Directory /var/www/beelogger>
        WSGIProcessGroup beelogger
        WSGIApplicationGroup %{GLOBAL}
        Order deny,allow
        Allow from all
    </Directory>
</VirtualHost>
```
Now clone the repository into `/var/www` rename it to beelogger and set the permissions.

Dont forget to rename the example_config to `config` and fill in the data!

## Setting up database
Install MySql server and client.

`sudo apt install mysql-server mysql-client`

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

You are ready to go!