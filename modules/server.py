import parser
import threading

import public
import util_proxy
from flask import Flask, jsonify, request,render_template

app = Flask(__name__,template_folder='template',static_folder='./template/webui/assets/')

parser_search_engine = ["www.freeproxy.world", "JSON"]
proxies = []
thread = None



@app.route('/')
def hello():
    return render_template('./webui/index.html')



@app.route("/last_test", methods=["GET"])
def get_last_test():
    if util_proxy.is_testing or util_proxy.last_test:
        return jsonify(util_proxy.last_test), 200
    return jsonify(util_proxy.load_test()), 200


@app.route("/get_proxies", methods=["GET"])
def get_proxy_list():
    return jsonify(util_proxy.load_proxy_data()), 200


@app.route("/test", methods=["POST"])
def start_test():
    global proxies, thread
    if util_proxy.is_testing:
        return jsonify(success=False, message="A test is already in progress"), 200

    util_proxy.is_testing = True
    data = request.get_json()
    countries = data.get("countries", [])
    search_engine = data.get(
        "searchEngine",
    )  # json parser
    connection_types = data.get("connectionTypes", [])
    max_proxies = data.get("maxProxies")
    if search_engine == "www.freeproxy.world":
        # Note parsing 'freeproxy.world' consumes a lot of time (1>MIN)
        if not (countries or max_proxies):
            # If there is no saved proxy data, scrape the website and save a copy
            proxies = util_proxy.load_proxy_data()
            if not proxies:
                proxies = parser.scraping_freeproxy()
        else:
            proxies = parser.parser_freeproxy(
                countries=countries, max_proxy=max_proxies
            )
    else:
        countries = [public.countryNames[a] for a in countries]  # full name
        proxies_raw = util_proxy.load_proxy_data()
        proxies = util_proxy.search_proxy(
            proxies=proxies_raw,
            max_proxy=max_proxies,
            key="country",
            values=countries,
        )

    if connection_types:
        # Remove unwanted connection types
        proxies = [proxy for proxy in proxies if proxy["type"] in connection_types]
    if not len(proxies):
        util_proxy.is_testing = False
        return jsonify(success=True, message="No proxy matched found"), 200
    thread = threading.Thread(target=util_proxy.test_all_proxies, args=(proxies,))
    thread.daemon = True
    thread.start()
    return jsonify(success=True, message="Thread started to test proxy speed"), 200


@app.route("/status", methods=["GET"])
def get_status():
    matched_proxy = len(proxies)
    return jsonify(
        is_testing=util_proxy.is_testing,
        matched_proxy=matched_proxy,
        test_duration=util_proxy.test_duration,
    )


@app.route("/get_buffer", methods=["GET"])
def get_buffer():
    data = util_proxy.buffer.copy()
    util_proxy.buffer = []
    return jsonify(data)


@app.route("/get_search_engine", methods=["GET"])
def get_search_engine():
    return jsonify(value=parser_search_engine), 200


@app.route("/force_stop", methods=["PUT"])
def force_stop():
    data = request.get_json()
    if data["action"] == "stop" and util_proxy.is_testing:
        util_proxy.stop_thread = True
        try:
            thread.join(30)
        except:
            print("EXIT EXCEPTION ")
    return jsonify(success=True), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0",debug=True, port=2001)
