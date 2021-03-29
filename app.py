import os
import time
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

@app.cli.command()
def queryDB():
    '''Run a full query of the DB and update a local json file'''
    # establish connection
    connectTo = 'final_project'
    client = pymongo.MongoClient(f"mongodb+srv://{os.getenv('USERNAME')}:{os.getenv('PASSWORD')}@bricluster.yskth.mongodb.net/{connectTo}?retryWrites=true&w=majority")
    db = client.final_project
    collection = db.state_action
    #query all records
    result = collection.find({})
    # loop over all records and create a json file with a key for each unique state and a count of actions for each state
    json_dumper = {}
    for doc in result:
        for pair in doc['gameplay']:
            cur_action = pair['action']
            cur_state = str(pair['state'])
            if cur_state in json_dumper:
                json_dumper[cur_state][cur_action] += 1
            else:
                json_dumper[cur_state] = {"RIGHT":0,"LEFT":0,"UP":0,"DOWN":0}
                json_dumper[cur_state][cur_action] += 1

    with open("static/agg_state_actions.json", 'w') as out_file:
        json.dump(json_dumper, out_file, indent=2)

if __name__ == "__main__":
    app.run(debug=True)