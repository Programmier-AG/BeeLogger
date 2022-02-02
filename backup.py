import os
import time
from shutil import copyfile, make_archive

import notifications
from config import FileBackup, MySql


def run_backup():
    if not os.path.isfile("backup.py") and False:
        raise "You need to start this script from the directory it's contained in. Please cd into that folder."

    print("checking backup directory")

    if not os.path.exists("backup/"):
        print("create backup directory")
        os.mkdir("backup/")

    print("parsing backup name")
    dir_name = time.strftime("%d-%m-%Y_%a_%H-%M-%S")
    dest = "backup/" + dir_name + "/"
    dest = dest.replace(" ", "-")

    if os.path.exists(dest):
        os.removedirs(dest)

    os.mkdir(dest)

    print("downloading MySql database")
    os.popen("mysqldump -h %s -u %s -p%s %s > %sdb_backup.sql" % (MySql.host, MySql.user, MySql.password, MySql.db, dest)).readlines()

    try:
        print("copying files")
        copyfile("logs/insert.log", dest + "insert.log")
        # copytree("stats", dest + "stats/")
    except FileNotFoundError:
        print("no insert.log file, ignoring")

    print("packing files")
    make_archive(dest, "zip", dest)

    print("cleaning up")
    os.popen("rm -r " + dest).readlines()

    print("saving on remote")
    if FileBackup.key != "":
        cmd = f"scp -o StrictHostKeyChecking=no -i 'secrets/{FileBackup.key}' -P {FileBackup.port} '{dest[:-1]}.zip' '{FileBackup.user}@{FileBackup.host}:{FileBackup.directory}'"
    else:
        cmd = f"sshpass -p {FileBackup.password} scp -o StrictHostKeyChecking=no -P {FileBackup.port} '{dest[:-1]}.zip' '{FileBackup.user}@{FileBackup.host}:{FileBackup.directory}'"

    # cmd = "sshpass -p '%s' scp -P %s '%s.zip' '%s@%s:%s'" % (FileBackup.password, FileBackup.port, dest[:-1], FileBackup.user, FileBackup.host, FileBackup.directory)

    # print(cmd)
    print(os.popen(cmd).read())


def run_with_notify():
    try:
        run_backup()
        notifications.Feed().push_notification("admin", "Backup Erfolg", "Der Backupvorgang wurde erfolgreich abgeschlossen!")
    except Exception as e:
        print(">!> Error while running backup!\n"+str(e))
        notifications.Feed().push_notification("admin", "Backup Fehler", "Beim Backupvorgang ist es zu einem Fehler gekommen!\n" + str(e))


if __name__ == "__main__":
    run_with_notify()
