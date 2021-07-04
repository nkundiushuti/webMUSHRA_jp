FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8-slim
RUN rm /app/prestart.sh
RUN pip install tinydb
COPY ./backend.py /app/main.py
