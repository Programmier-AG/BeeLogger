from flask import Blueprint
import notifications

Notifications = notifications.Feed()

rss = Blueprint("rss", __name__)

@rss.route("/<feed>/", methods=["GET"])
def show_feed(feed):
    return Notifications.get_feed(feed)

@rss.route("/<feed>/<feed_id>/", methods=["GET"])
def show_article(feed, feed_id):
    items = Notifications.get_feed(feed, rss_format=False)
    article = [x for x in items if str(x["id"]) == feed_id][0]

    return article["text"]
