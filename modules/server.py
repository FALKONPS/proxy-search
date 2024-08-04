import copy
from flask import Flask, jsonify, request
from flask_cors import CORS
import util_proxy
import threading
import logging

app = Flask(__name__)
CORS(app)

proxy_list =[]

@app.route('/last_test_results', methods=['GET'])
def get_last_test():
    return jsonify(util_proxy.last_test)

@app.route('/proxy_list', methods=['GET'])
def get_proxy_list():
    return jsonify(proxy_list)

@app.route('/test', methods=['POST'])
def start_test():
    global proxy_list
    if util_proxy.is_testing:
        return jsonify(success=False, message="A test is already in progress")
    
    data = request.get_json()
    countries = data.get('countries', [])
    connection_types = data.get('connectionTypes', [])
    max_proxies = data.get('maxProxies', 50)
    proxy_list = util_proxy.search_proxy(util_proxy.load_proxy_data(), max_proxy=max_proxies,key='country',values=countries)
    
    if connection_types:
        # Remove unwanted connection types 
        # Note this is handled by the parser (OVERHEAD)
        proxy_list = [proxy for proxy in proxy_list if proxy['type'] in connection_types]
    
    util_proxy.is_testing = True
    
    logging.info("Proxy testing started")
    thread = threading.Thread(target=util_proxy.test_all_proxies,args=(proxy_list,))
    thread.start()
    return jsonify(success=True, message="Proxy testing started"),200

@app.route('/status', methods=['GET'])
def get_status():
    return jsonify(is_testing=util_proxy.is_testing)

@app.route('/get_buffer', methods=['GET'])
def get_buffer():
    data =util_proxy.buffer.copy()
    util_proxy.buffer = []
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=2001)