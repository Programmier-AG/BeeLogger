FROM python:3.8-alpine
COPY . /app
WORKDIR /app
RUN apk update
RUN pip install --upgrade pip~=21.3 setuptools~=58.3 wheel

RUN set -x ; \
  addgroup -g 82 -S www-data ; \
  adduser -u 82 -D -S -G www-data www-data && exit 0 ; exit 1

RUN apk add --update bash tmux mariadb-client sshpass openssh-client apache2 apache2-dev gcc g++ make

RUN pip install -r requirements.txt

RUN pip install mod_wsgi

RUN chmod +x ./wait-for-it.sh
EXPOSE 8000

CMD tmux new -d -s wsgi 'mod_wsgi-express start-server docker-wsgi.wsgi --user www-data --group www-data' ; mkdir -p /tmp/mod_wsgi-localhost:8000:0/ ; touch /tmp/mod_wsgi-localhost:8000:0/error_log ; tail -f /tmp/mod_wsgi-localhost:8000:0/error_log