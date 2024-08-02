import requests
from bs4 import BeautifulSoup
import json
import os

# IP_adress 0	Port 1	Country 2	City 3	Speed 4	Type 5	Anonymity 6	

def parser_freeproxy(countries= ['DE', 'FR'], max_proxy=50,max_page=150,on_proxy=True):
    base_url = 'https://www.freeproxy.world/?type=&anonymity=&country={}&speed=&port=&page={}'
    proxy_list = []
    if(not countries):
        countries=['']
    for country in countries:
        for page in range(1, max_page+1):
            url = base_url.format(country, page)
            response = requests.get(url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Table class='layui-table'
            table = soup.find('table', class_='layui-table')
            if(on_proxy and len(proxy_list)>max_proxy):
                break;
            if table:
                rows = table.find_all('tr')
                if len(rows) <= 1:
                    break
                
                for row in rows[1:]:
                    cols = row.find_all('td')
                    cols = [ele.text.strip() for ele in cols]
                    
                    if len(cols) > 5:
                        address = cols[0]
                        port = cols[1]
                        proxy_country = cols[2]
                        proxy_city = cols[3]
                        proxy_type = cols[5]
                        proxy_anonymity = cols[6]
                        
                        compact = {
                            'address': f'{address}:{port}',
                            'country': proxy_country,
                            'city': proxy_city,
                            'type': proxy_type,
                            'anonymity': proxy_anonymity
                        }
                        proxy_list.append(compact)
                    if(on_proxy and len(proxy_list)>max_proxy):
                        break;

            else:
                print(f'Table with class "layui-table" not found for {country} on page {page}.')
                break
    
    if not os.path.exists('proxy'):
        os.makedirs('proxy')
    
    filename = os.path.join('proxy', 'proxy_data.json')
    with open(filename, 'w') as f:
        json.dump(proxy_list, f, indent=2)
    
    print(f"Data saved to {filename}")
    return proxy_list

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