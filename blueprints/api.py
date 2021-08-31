from flask import Blueprint
from api.get_data import get_data
from api.insert_data import insert_data
from api.scales import scales

# Initialize Blueprint for API routes
api = Blueprint("api", __name__)

# /api/data/get
api.add_url_rule("/data/get", view_func=get_data, methods=["GET"])

# /api/data/insert
api.add_url_rule("/data/insert", view_func=insert_data, methods=["GET"])

# /api/data/scales
api.add_url_rule("/data/scales", view_func=scales, methods=["GET"])
