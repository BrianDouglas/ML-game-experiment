import os
from datetime import datetime

from flask import Flask, session, render_template, request, jsonify
#from flask_socketio import SocketIO, emit

app = Flask(__name__)
#app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
#socketio = SocketIO(app)

#landing page
@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)