from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import requests
import time
import json

app = Flask(__name__)

CORS(app)

last_test_results = []
last_test_file = 'last_test.json'


if __name__ == '__main__':
    app.run(debug=True, port=2001)