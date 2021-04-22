import sys
import os

sys.path.insert(0, "/var/www/BeeLogger")
os.chdir("/var/www/BeeLogger")

from app import app as application
