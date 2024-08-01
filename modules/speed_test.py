import time
import json
import requests

test_duration = 5
is_testing_lock = False # mutex 
max_proxies = 100
file_test_url = "http://fra.download.datapacket.com/100mb.bin"
chunk_size=1024 * 1024


def test_proxy(proxy):
    global file_test_url,chunk_size,test_duration
    address = proxy['address']
    proxy_type = proxy['type']
    
    try:
        session = requests.Session()
        if proxy_type in ['http', 'https']:
            if(proxy_type=='http'):
                proxies = {
                    'http': f'{proxy_type}://{address}',
                }
            else:
                proxies = {
                    'https': f'{proxy_type}://{address}'
                }
            session.proxies.update(proxies)
        elif proxy_type in ['socks4', 'socks5']:
            session.proxies = {
                'http': f'{proxy_type}://{address}',
                'https': f'{proxy_type}://{address}'
            }
        else:
            raise ValueError(f"Unsupported proxy type: {proxy_type}")

        
        start_time = time.time()
        total_downloaded = 0
        
        with session.get(file_test_url, stream=True, timeout=10) as response:
            response.raise_for_status()
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    total_downloaded += len(chunk)
                    if time.time() - start_time >= test_duration:
                        break
        
        end_time = time.time()
        duration = end_time - start_time
        speed = (total_downloaded / duration) / (chunk_size)
        return { 'speed': f"{speed:.2f}"} # Unpacking proxy
    
    except Exception as e:
        print(f"Error testing {address}: {str(e)}")
        return {**proxy, 'speed': "0.00"} # Unpacking proxy



# Test
# import freeproxy
# test_proxy(freeproxy.parser_freeproxy(max_proxy=2)[0])

