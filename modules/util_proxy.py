import json
import os

import speed_test

last_test = []
buffer = []
is_testing = False


def load_proxy_data():
    filename = os.path.join("proxy", "proxy_data.json")
    if os.path.exists(filename):
        with open(filename, "r") as f:
            data = json.load(f)
        return data
    else:
        return []


def search_proxy(proxies, max_proxy=0, key="", values=[]):
    filtered = []
    if not max_proxy:
        max_proxy = len(proxies)

    if not values:
        return proxies[:max_proxy]

    for proxy in proxies[:max_proxy]:
        if proxy[key] in values:
            filtered.append(proxy)

    return filtered


def test_all_proxies(proxies):
    global last_test, buffer, is_testing
    is_testing = True
    last_test = []
    for proxy in proxies:
        result = speed_test.test_proxy(proxy)
        last_test.append(result)
        buffer.append(result)
        # time.sleep(0.1) # TEST
    is_testing = False
