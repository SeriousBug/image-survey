FROM python:3.8-alpine
# uvloop does not support 3.9, which is required for our backend

EXPOSE 80/tcp

VOLUME /image-files
VOLUME /etc/image-survey/
VOLUME /database

ADD . /image_survey

RUN cd /image_survey \
 && apk update \
 && apk add --no-cache --virtual build-deps build-base make libffi-dev yarn \
 && pip install --no-cache-dir -r requirements.txt \
 && pip install --no-cache-dir . \
 && cp etc/image-survey.sample.yaml image-survey.yaml \
 && cd ui \
 && yarn \
 && yarn build \
 && yarn cache clean \
 && apk del build-deps

WORKDIR /image_survey

CMD ["/usr/local/bin/python3", "/image_survey/image_survey/main.py"]
