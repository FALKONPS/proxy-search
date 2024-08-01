from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import requests
import time
import json
import parser
import speed_test

app = Flask(__name__)

CORS(app)

last_test_results = [  {
    "address": "test1",
    "country": "Germany",
    "city": "Leipzig",
    "type": "http",
    "anonymity": "High",
    "speed": "70"
  },
  {
    "address": "test2",
    "country": "Germany",
    "city": "Muenster",
    "type": "http",
    "anonymity": "No",
    "speed": "100"
  }]
last_test_file = 'last_test.json'
proxy_list=[]
@app.route('/proxy_list', methods=['GET'])
def get_proxy_list():
    return jsonify(last_test_results)

if __name__ == '__main__':
    app.run(debug=True, port=2001)