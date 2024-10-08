import time

import requests
from ping3 import ping

is_testing_lock = False  # mutex
file_test_url = [
    "https://test2.fibertelecom.it/100MB.zip",
    "http://speedtest.tele2.net/100MB.zip",
    "http://fra.download.datapacket.com/100mb.bin",
]


def test_proxy(proxy, test_duration=10):
    global file_test_url, chunk_size
    address = proxy["address"]
    proxy_type = proxy["type"]

    session = requests.Session()
    if proxy_type in ["http", "https"]:
        if proxy_type == "http":
            proxies = {
                "http": f"{proxy_type}://{address}",
            }
        else:
            proxies = {"https": f"{proxy_type}://{address}"}
        session.proxies.update(proxies)
    elif proxy_type in ["socks4", "socks5"]:
        session.proxies = {
            "http": f"{proxy_type}://{address}",
            "https": f"{proxy_type}://{address}",
        }
    else:
        return 0

    for file in file_test_url:
        try:
            start_time = time.time()
            total_downloaded = 0
            with session.get(file, stream=True, timeout=10) as response:
                response.raise_for_status()
                for chunk in response.iter_content(chunk_size=4096):
                    if chunk:
                        total_downloaded += len(chunk)
                        if time.time() - start_time >= test_duration:
                            break

            end_time = time.time()
            duration = end_time - start_time
            speed = (total_downloaded / duration) / (
                1024 * 1024
            )  # (1024 * 1024) to MB/s
            print(f"Address: {address} Speed: {speed:.2f}")
            latency = ping(address.split(":")[0]) * 1000
            data = {
                **proxy,
                "speed": f"{speed:.2f}",
                "latency": f"{latency:.3f}",
            }
            return data

        except Exception:
            print(f"Testing file fails: {address}")

    return {
        **proxy,
        "speed": "0.00",
        "latency": "0.00",
    }
