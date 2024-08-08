import math

import requests
import util_proxy
from bs4 import BeautifulSoup


# IP_adress 0 Port 1 Country 2 City 3 Speed 4 Type 5 Anonymity 6
def scraping_freeproxy():
    data = parser_freeproxy(countries=[""], max_proxy=0, max_page=200, on_proxy=False)
    util_proxy.save_scraping_data(data)
    return data


def parser_freeproxy(countries, max_proxy=50, max_page=150, on_proxy=True):
    per_value = 0
    if not max_proxy:
        on_proxy = False

    if not countries:
        countries = [""]

    elif len(countries) and (max_proxy / len(countries)) >= 1:
        # Distribute the proxy equally on values
        per_value = math.floor(max_proxy / len(countries))

    base_url = (
        "https://www.freeproxy.world/?type=&anonymity=&country={}&speed=&port=&page={}"
    )
    filtered = []

    for country in countries:
        counter = 0
        for page in range(1, max_page + 1):
            url = base_url.format(country, page)
            response = requests.get(url, timeout=10)
            soup = BeautifulSoup(response.content, "html.parser")

            # Table class='layui-table'
            table = soup.find("table", class_="layui-table")
            if on_proxy and len(filtered) > max_proxy:
                break
            if table:
                rows = table.find_all("tr")
                if len(rows) <= 1:
                    break
                to_next = False
                for row in rows[1:]:

                    cols = row.find_all("td")
                    cols = [ele.text.strip() for ele in cols]

                    if len(cols) > 5:
                        address = cols[0]
                        port = cols[1]
                        proxy_country = cols[2]
                        proxy_city = cols[3]
                        proxy_type = cols[5]
                        proxy_anonymity = cols[6]

                        compact = {
                            "address": f"{address}:{port}",
                            "country": proxy_country,
                            "city": proxy_city,
                            "type": proxy_type,
                            "anonymity": proxy_anonymity,
                        }
                        filtered.append(compact)
                        counter = counter + 1
                        if on_proxy and len(filtered) >= max_proxy:
                            # util_proxy.save_test(filtered)
                            return filtered
                        elif per_value and counter >= per_value:
                            to_next = True
                            break

                if to_next:
                    break

            else:
                print(
                    f'Table with class "layui-table" not found for {country} on page {page}.'
                )
                break
    return filtered
