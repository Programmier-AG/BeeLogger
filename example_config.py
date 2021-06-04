web_port = 80
insert_token = ""
display_token = ""

correction = {0: 1}  # Gets multiplied by the weight before insertion
tare = {0: 0}  # tare value after selection from database
real_tare = {0: 0}  # tare value before insertion into database

class MySql:
    host = ""
    port = 3306
    user = ""
    password = ""
    db = ""

class MySqlBackup:
    host = ""
    port = 3306
    user = ""
    password = ""
    db = ""
    
class FileBackup:
    host = ""
    port = 22
    user = ""
    password = ""
    directory = ""

class Mail:
    host = ""
    port = 587
    user = ""
    password = ""

# Pages that are 'mounted' at /<key> and embedded using an iframe
embedded_pages = {
    # "examplePage": "https://example.org"
}