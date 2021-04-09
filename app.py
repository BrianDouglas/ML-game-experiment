import os
import time
from datetime import datetime
import json
import pymongo
import boto3

from flask import Flask, session, render_template, request, jsonify, send_from_directory

LOAD_DB = True

app = Flask(__name__)

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

@app.route("/json_data")
def json_data():
    session = boto3.session.Session(aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                                    aws_secret_access_key=os.getenv('AWS_ACCESS_KEY_SECRET'),
                                    region_name='us-west-2')
    s3 = session.resource('s3')
    content_obj = s3.Object('brianslearningbucket', 'agg_state_actions_2.json')
    file_content = content_obj.get()['Body'].read().decode('utf')
    my_data = json.loads(file_content)
    return jsonify(my_data)

@app.route("/game_data", methods=['POST'])
def game_data():
    data = request.get_json()
    if (LOAD_DB):
        connectTo = 'final_project'
        client = pymongo.MongoClient(f"mongodb+srv://{os.getenv('USERNAME')}:{os.getenv('PASSWORD')}@bricluster.yskth.mongodb.net/{connectTo}?retryWrites=true&w=majority")
        db = client.final_project
        collection = db.game_collection
        collection.insert(data)
        client.close()
    else:
        print(data)
    return "OK", 200


@app.cli.command()
def queryDB():
    '''Run a full query of the DB and update a local json file'''
    # establish connection
    connectTo = 'final_project'
    client = pymongo.MongoClient(f"mongodb+srv://{os.getenv('USERNAME')}:{os.getenv('PASSWORD')}@bricluster.yskth.mongodb.net/{connectTo}?retryWrites=true&w=majority")
    db = client.final_project
    collection = db.game_collection
    #query all records
    result = collection.find({})
    # loop over all records and create a json file with a key for each unique state and a count of actions for each state
    print(f'{result.count()} records returned')
    json_dumper = {}
    for doc in result:
        for i, record in enumerate(doc['gameplay']):
            cur_action = record['action']
            cur_state = str(record['state'])
            if i > 0:
                cur_time = record['time'] - doc['gameplay'][i-1]['time']
            else:
                cur_time = record['time']
            if cur_state in json_dumper:
                json_dumper[cur_state]['actions'][cur_action] += 1
                json_dumper[cur_state]['time'].append(cur_time)
            else:
                json_dumper[cur_state] = {'actions': {"RIGHT":0,"LEFT":0,"UP":0,"DOWN":0}, 'time': []}
                json_dumper[cur_state]['actions'][cur_action] += 1
                json_dumper[cur_state]['time'].append(cur_time)

    print(f'{len(json_dumper)} unique states.')
    session = boto3.session.Session(aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                                    aws_secret_access_key=os.getenv('AWS_ACCESS_KEY_SECRET'),
                                    region_name='us-west-2')
    s3 = session.resource('s3')
    s3obj = s3.Object('brianslearningbucket', 'agg_state_actions_2.json')
    s3obj.put(Body=(bytes(json.dumps(json_dumper).encode('UTF-8'))))

if __name__ == "__main__":
    app.run(debug=True)