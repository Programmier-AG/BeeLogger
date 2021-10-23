FROM python:3.8-alpine
COPY . /app
WORKDIR /app
RUN apk update && apk add bash
RUN pip install --upgrade pip setuptools wheel
RUN apk add --update g++ make
RUN pip install -r requirements.txt
EXPOSE 2688
CMD python ./app.py