from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import parser
import speed_test
import time
import os

app = Flask(__name__)
CORS(app)

last_test_results = []
proxy_list = []
buffer = []
is_testing = False

def load_proxy_data():
    filename = os.path.join('proxy', 'proxy_data.json')
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            data = json.load(f)
        print(f"Loaded {len(data)} proxies from {filename}")
        return data
    else:
        print(f"No proxy data file found at {filename}")
        return None
    
@app.route('/last_test_results', methods=['GET'])
def get_last_test_results():
    return jsonify(last_test_results)

@app.route('/proxy_list', methods=['GET'])
def get_proxy_list():
    return jsonify(proxy_list)

@app.route('/test', methods=['POST'])
def start_test():
    global proxy_list, is_testing
    if is_testing:
        return jsonify(success=False, message="A test is already in progress")
    
    data = request.get_json()
    countries = data.get('countries', [])
    connection_types = data.get('connectionTypes', [])
    max_proxies = data.get('maxProxies', 50)
    
    proxy_list = load_proxy_data()

    if connection_types:
        # Remove unwanted connection types 
        # Note this is handled by the parser (OVERHEAD)
        proxy_list = [proxy for proxy in proxy_list if proxy['type'] in connection_types]
    
    is_testing = True
    
    test_all_proxies()
    return jsonify(success=True, message="Proxy testing started")

@app.route('/status', methods=['GET'])
def get_status():
    return jsonify(is_testing=is_testing)

@app.route('/get_buffer', methods=['GET'])
def get_buffer():
    global buffer
    data = buffer
    buffer = []
    return jsonify(data)

def test_all_proxies():
    global last_test_results, buffer, is_testing
    is_testing = True
    last_test_results = []
    for proxy in proxy_list:
        result = speed_test.test_proxy(proxy)
        last_test_results.append(result)
        buffer.append(result)
        # time.sleep(0.1) # TEST
    is_testing = False

if __name__ == '__main__':
    app.run(debug=True, port=2001)