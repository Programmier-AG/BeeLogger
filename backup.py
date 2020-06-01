import os
import time
from shutil import copyfile, copytree, make_archive

from config import FileBackup, MySql

if not os.path.isfile("backup.py"):
    print("You need to start this script from the directory it's contained in. Please cd into that folder.")
    exit()

print("checking backup directory")

if not os.path.exists("backup/"):
    print("create backup directory")
    os.mkdir("backup/")

print("parsing backup name")
dir_name = time.asctime()
dest = "backup/" + dir_name + "/"
dest = dest.replace(" ", "-")

if os.path.exists(dest):
    os.removedirs(dest)

os.mkdir(dest)

print("downloading MySql database")
os.popen("mysqldump -h %s -u %s -p%s %s > %sdb_backup.sql" % (MySql.host, MySql.user, MySql.password, MySql.db, dest)).readlines()

print("copying files")
copyfile("insert.log", dest + "insert.log")
# copytree("stats", dest + "stats/")

print("packing files")
make_archive(dest, "zip", dest)

print("cleaning up")
os.popen("rm -r " + dest).readlines()

print("saving on remote")
os.popen("sshpass -p '%s' scp '%s.zip' '%s@%s:%s'" % (FileBackup.password, dest[:-1], FileBackup.user, FileBackup.host, FileBackup.directory)).readlines()
