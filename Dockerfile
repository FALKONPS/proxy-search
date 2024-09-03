FROM python:3.12.5-slim-bullseye

WORKDIR /app

COPY requirements.txt /app/

RUN pip install -r requirements.txt --no-cache-dir

COPY ./modules/ /app/modules/

CMD ["python","modules/server.py"]