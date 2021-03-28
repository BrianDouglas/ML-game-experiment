import os
from datetime import datetime
import json
import pymongo

from flask import Flask, session, render_template, request, jsonify
#from flask_socketio import SocketIO, emit

LOAD_DB = True

app = Flask(__name__)
#app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
#socketio = SocketIO(app)

#landing page
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/machine")
def machine():
    return render_template("machine.html")

@app.route("/data")
def data():
    return render_template("data.html")

@app.route("/game_data", methods=['POST'])
def game_data():
    data = request.get_json()
    if (LOAD_DB):
        connectTo = 'final_project'
        client = pymongo.MongoClient(f"mongodb+srv://{os.getenv('USERNAME')}:{os.getenv('PASSWORD')}@bricluster.yskth.mongodb.net/{connectTo}?retryWrites=true&w=majority")
        db = client.final_project
        collection = db.state_action
        collection.insert(data)
        client.close()
    else:
        print(data)
        print(type(data))
    return "OK", 200

if __name__ == "__main__":
    app.run(debug=True)