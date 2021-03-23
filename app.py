import os
from datetime import datetime

from flask import Flask, session, render_template, request, jsonify
#from flask_socketio import SocketIO, emit

from GameEnv import GameEnv
from ModelBuilder import *

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

@app.route("/game_data", methods=['POST'])
def game_data():
    if request.method == "POST":
        print(request.get_json())
    return "OK", 200

if __name__ == "__main__":
    app.run(debug=True)