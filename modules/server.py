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

@app.route('/test', methods=['POST'])
def start_test():
    """ This method initializes the connection for stream data """
    global proxy_list
    if speed_test.is_testing_lock:
        return jsonify(success=False, message="A test is already in progress")
    
    data = request.get_json()
    countries = data.get('countries', [])
    connection_types = data.get('connectionTypes', [])
    max_proxies = data.get('maxProxies', 50)
    print(f'Max Proxies: {max_proxies}, Countries: {countries}, Connection Types: {connection_types}')
    proxy_list = parser.parser_freeproxy(countries=countries,max_proxy=max_proxies)

    if connection_types:
        # Remove unwanted connection types 
        # Note this is handled by the parser (OVERHEAD)
        proxy_list = [proxy for proxy in proxy_list if proxy['type'] in connection_types]
    
    return jsonify(success=True, message="Initializes proxy testing")

if __name__ == '__main__':
    app.run(debug=True, port=2001)