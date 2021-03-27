FROM python:3.8-slim-buster
# uvloop does not support 3.9, which is required for our backend

EXPOSE 80/tcp

VOLUME /image-files
VOLUME /etc/image-survey/
VOLUME /database

ADD . /image_survey
WORKDIR /image_survey

RUN apt-get update \
 && apt-get install -y yarnpkg \
 && pip install --no-cache-dir poetry \
 && rm -rf $HOME/.cache/pypoetry/cache

RUN poetry install \
 && cp etc/image-survey.sample.yaml image-survey.yaml \
 && cd ui \
 && yarnpkg \
 && yarnpkg build \
 && yarnpkg cache clean \


CMD ["poetry", "run", "image-survey"]
