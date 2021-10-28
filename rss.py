import rfeed
from database import Database

class RssFeed:
    @staticmethod
    def push_warning(feed_name, title, text):
        """
        Creates new item on the warning feed. E.g. temperature critical.

        Parameters
        ----------
        feed_name : str
            The name of the feed.
        title : str
            The title of the feed.
        text : str
            The text to push on the feed.
        """
        feed = Database.get_rss_feed(feed_name)
        feed.append({
            "time":
        })

        Database.insert_rss_feed(feed_name, text)
        return

    @staticmethod
    def get_feed(feed):
        """
        Gets the data feed. See self.push_data
        """
        Database.get_rss_feed(feed)
        pass
