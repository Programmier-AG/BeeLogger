FROM python:3.8-alpine

COPY . /app

COPY example_config.py /app/example_config.py

WORKDIR /app

RUN apk update

RUN pip install --no-cache-dir --upgrade \
  pip \
  setuptools \
  wheel

RUN set -x ; \
  addgroup -g 82 -S www-data ; \
  adduser -u 82 -D -S -G www-data www-data && exit 0 ; exit 1

RUN apk add --update \
  bash \
  tmux \
  mariadb-client \
  sshpass \
  openssh-client \
  apache2 \
  apache2-dev \
  gcc \
  g++ \
  make

RUN pip install --no-cache-dir -r requirements.txt

RUN chmod +x ./wait-for-it.sh

EXPOSE 8000

CMD tmux new -d -s wsgi 'mod_wsgi-express start-server docker-wsgi.wsgi --user www-data --group www-data' ; \
  mkdir -p /tmp/mod_wsgi-localhost:8000:0/ ; \
  touch /tmp/mod_wsgi-localhost:8000:0/error_log ; \
  tail -f /tmp/mod_wsgi-localhost:8000:0/error_log