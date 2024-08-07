import json
import math
import os

import speed_test

last_test = []
buffer = []
is_testing = False
stop_thread = False
test_duration = 10


def save_json_file(filename, directory, data):
    if not os.path.exists(directory):
        os.makedirs(directory)

    filename = os.path.join(directory, filename)
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Data saved to {filename}")


def load_json_file(filename, directory):
    filename = os.path.join(directory, filename)
    if os.path.exists(filename):
        with open(filename, "r") as f:
            data = json.load(f)
        return data
    else:
        return []


def save_scraping_data(data):
    return save_json_file("proxy_data.json", "proxy", data=data)


def save_test(data):
    return save_json_file("proxy_data_test.json", "proxy", data=data)


def load_test():
    return load_json_file("proxy_data_test.json", "proxy")


def load_proxy_data():
    return load_json_file("proxy_data.json", "proxy")


def search_proxy(proxies, key, values, max_proxy=0):
    per_value = 0
    values_len = len(values)
    if not max_proxy or len(proxies) < max_proxy:
        max_proxy = len(proxies)

    elif (values_len and max_proxy / values_len) >= 1:
        # Distribute the proxy equally on values
        per_value = math.floor(max_proxy / values_len)

    if not values:
        return proxies[:max_proxy]

    filtered = []
    for value in values:
        counter = 0
        to_next = False
        for proxy in proxies:
            if proxy[key] == value:
                filtered.append(proxy)
                counter = counter + 1
                if len(filtered) >= max_proxy:
                    return filtered
                elif per_value and counter >= per_value:
                    to_next = True
                    break
            if to_next:
                break
    return filtered


def test_all_proxies(proxies):
    global last_test, buffer, is_testing, test_duration, stop_thread
    is_testing = True
    stop_thread = False
    last_test = []
    for proxy in proxies:
        if stop_thread:
            is_testing = False
            stop_thread = False
            save_test(last_test)
            return 0
        result = speed_test.test_proxy(proxy, test_duration=test_duration)
        last_test.append(result)
        buffer.append(result)
        # time.sleep(0.1) # TEST
    is_testing = False
    save_test(last_test)
