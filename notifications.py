import datetime
import json
import time

import rfeed
from flask import jsonify, request

import database

Database = database.Database()

class Feed:
    def __init__(self):
        self.supported_feeds = ["data", "admin", "warning"]
        self.feed_descriptions = {
            "data": "Jeder Datensatz ist hier verfügbar.",
            "admin": "Wichtige Informationen, die nur für Administratoren bestimmt sind.",
            "warning": "Allgemeine Warnungen, die das Bienenvolk betreffen."
        }
        self.feed_names = {
            "admin": "BeeLogger Admin Alarm!",
            "data": "BeeLogger Datensätze",
            "warning": "BeeLogger Bienen Alarm!"
        }

    def push_notification(self, feed, title, text):
        """
        Creates new item on the warning feed. E.g. temperature critical.

        Parameters
        ----------
        feed : str
            The name of the feed. "data", "admin", "warning"
        title : str
            The title of the Item.
        text : str
            The text to push on the feed.

        Raises
        ------
        TypeError
            You did not provide a valid feed name.
        """

        if feed not in self.supported_feeds:
            raise TypeError("This feed name is unsupported")

        item = {
            "time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "title": title,
            "text": text
        }

        Database.insert_feed(feed, item)

        return True

    def get_feed(self, feed_name, rss_format=True):
        """
        Gets the data feed. See self.push_data
        feed_name : str
            Name of the feed to get. "data", "admin", "warning"
        rss_format : bool
            Specify whether the feed should be returned in a RSS XML format.
        """
        if feed_name not in self.supported_feeds:
            raise TypeError("This feed name is unsupported")

        feed = Database.get_feed(feed_name)

        if rss_format:
            items = []
            for item in feed:
                # item = json.loads(item)
                items.append(rfeed.Item(
                    title=item["title"],
                    description=item["text"],
                    author="Automatic BeeLogger Notification",
                    pubDate=datetime.datetime.strptime(item["time"], "%Y-%m-%d %H:%M:%S"),
                    link=f"{request.host_url}rss/{feed_name}/{item['id']}/",
                ))

            return rfeed.Feed(
                title=self.feed_names[feed_name],
                description=self.feed_descriptions[feed_name],
                link=request.url,
                language="de-DE",
                items=items
            ).rss()

        return feed

