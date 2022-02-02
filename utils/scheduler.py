import time

import schedule

import backup
# import utils.weather_fetch

schedule.every().day.at("00:00").do(backup.run_with_notify)  # run backup at midnight

weather_scheduler = schedule.Scheduler()
# weather_scheduler.every(5).hours.do(utils.weather_fetch.update_weather)  # Update the weather every 5 hours

def run_tasks():
    weather_scheduler.run_all()  # Initial update of weather data
    while True:
        schedule.run_pending()
        weather_scheduler.run_pending()
        time.sleep(1)


if __name__ == "__main__":
    run_tasks()
