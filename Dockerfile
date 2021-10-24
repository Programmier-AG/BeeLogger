FROM python:3.8-alpine
COPY . /app
WORKDIR /app
RUN apk update && apk add bash
RUN pip install --upgrade pip setuptools wheel
RUN apk add --update g++ make bash mariadb-client sshpass openssh-client
RUN pip install -r requirements.txt
RUN chmod +x ./wait-for-it.sh
EXPOSE 2688
CMD python ./app.py