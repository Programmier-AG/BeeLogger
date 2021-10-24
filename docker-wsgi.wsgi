import sys
import os

sys.path.insert(0, "/app")
os.chdir("/app")

from app import app as application
