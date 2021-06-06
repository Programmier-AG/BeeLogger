from database import Database

def get_statistics():
    try:
        database = Database()
        result = database.get_statistics()
        return result[0]
    except Exception as e:
        return str(e)