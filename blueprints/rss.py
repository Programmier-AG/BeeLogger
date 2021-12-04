from flask import Blueprint, Response, request, jsonify
from flask.templating import render_template
import notifications

Notifications = notifications.Feed()

rss = Blueprint("rss", __name__)

@rss.route("/<feed>/", methods=["GET"])
def show_feed(feed):
    # Get the HTTP request's GET params
    args = dict(request.args)

    # Return pretty, HTML-based version of the feed if ?pretty is passed
    if "pretty" in args.keys():
        feed_data = Notifications.get_feed(feed, rss_format=False)
        return render_template("feed.html", feed_name=feed, records=feed_data)
    # Return feed as valid JSON if ?json is passed
    elif "json" in args.keys():
        feed_data = jsonify(Notifications.get_feed(feed, rss_format=False))
        return feed_data
    # Return feed as valid XML (for instance for RSS readers)
    else:
        feed_data = Notifications.get_feed(feed, rss_format=True)
        return Response(feed_data, mimetype="text/xml")

@rss.route("/<feed>/<feed_id>/", methods=["GET"])
def show_article(feed, feed_id):
    # Get the HTTP request's GET params
    args = dict(request.args)

    feed_data = Notifications.get_feed(feed, rss_format=False)
    article = [x for x in feed_data if str(x["id"]) == feed_id][0]

    # Return just the text if ?raw is passed
    if "raw" in args.keys():
        return article["text"]
    # Return feed as valid JSON if ?json is passed
    elif "json" in args.keys():
        return article
    # Return pretty, HTML-based version of the feed
    else:
        return render_template("feed-article.html", feed_name=feed, article=article)
