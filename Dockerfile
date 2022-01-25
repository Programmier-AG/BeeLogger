FROM python:3.9-alpine

COPY . /app

COPY example_config.py /app/config.py

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
  make \
  openblas \
  musl \
  py3-numpy \
  py3-numpy-dev

ENV PYTHONPATH=/usr/lib/python3.9/site-packages

RUN pip install --no-cache-dir -r docker/docker-requirements.txt

# This fixes an issue with "py3-numpy" where python won't find additional modules because of an musl vs. gcc error... credit: https://stackoverflow.com/a/69360361
RUN find /usr/lib/python3.9/site-packages -iname "*.so" -exec sh -c 'x="{}"; mv "$x" "${x/cpython-39-x86_64-linux-musl./}"' \;

RUN chmod +x ./docker/wait-for-it.sh

RUN chown www-data:www-data /app/ -R

EXPOSE 8000

CMD tmux new -d -s wsgi 'mod_wsgi-express start-server docker/docker-wsgi.wsgi --user www-data --group www-data' ; \
  mkdir -p /tmp/mod_wsgi-localhost:8000:0/ ; \
  touch /tmp/mod_wsgi-localhost:8000:0/error_log ; \
  tail -f /tmp/mod_wsgi-localhost:8000:0/error_log