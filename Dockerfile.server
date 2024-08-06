FROM tiangolo/uwsgi-nginx-flask:python3.11

WORKDIR /app

COPY requirements.txt /app/

RUN pip install -r requirements.txt --no-cache-dir

COPY ./modules/ /app/modules/

COPY ./webui/. /app/static/

ENV FLASK_APP=modules/server.py

ENV STATIC_PATH /app/static

ENV STATIC_INDEX 1

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY ./proxy/. /app/proxy/.

EXPOSE 80 2001

CMD ["sh", "-c", "flask run --host=0.0.0.0 --port=2001 & nginx"]