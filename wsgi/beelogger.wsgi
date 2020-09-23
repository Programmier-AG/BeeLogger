import sys
import os

sys.path.insert(0, "/var/www/beelogger")
os.chdir("/var/www/beelogger")

from app import app as application
