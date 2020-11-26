import asyncio
import os
from random import shuffle
from pathlib import Path
from sanic import Sanic
from sanic.log import logger
from sanic.request import Request
from sanic.response import json, html
import sanic_jwt
from sanic_limiter import Limiter, get_remote_address
import yaml
from image_survey import db, auth
from image_survey.imagesets import ImageSetCollector

# Potential locations of the config file.
# We'll try them in order, falling back to latter ones if earlier ones do not exist.

CONFIG_LOCATIONS = [
    # Current directory
    Path.cwd() / 'image-survey.yaml',
    # $HOME/.config/image_survey or if defined, $XDG_CONFIG_DIRS/image_survey
    Path(os.getenv('XDG_CONFIG_DIRS', default=(Path.home() / '.config'))) / 'image-survey' / 'image-survey.yaml',
    # /etc/image_survey
    Path('/etc') / 'image-survey' / 'image-survey.yaml',
]


# Default configuration, used as a fallback if no config file is found.
DEFAULT_CONFIG = {
    'DATABASE_LOCATION': './image-survey.sqlite',
    'REQUEST_MAX_SIZE': 8000,
    'WEBSOCKET_MAX_SIZE': 8000,
    'KEEP_ALIVE_TIMEOUT': 15,
    'ACCESS_LOGGING': True,
    'IMAGE_FILES_PATH': './image-files',
    'SANIC_JWT_EXPIRATION_DELTA': 60 * 60 * 72,  # 72 hours
    'SANIC_JWT_ACCESS_TOKEN_NAME': 'image-survey',
    'SANIC_JWT_URL_PREFIX': '/api/auth',
    'SANIC_JWT_SECRET': 'image-survey secret',
}


image_collector = ImageSetCollector()
database = db.DB()
app = Sanic("image survey", load_env="IMG_SURVEY_", strict_slashes=False)
jwt = sanic_jwt.Initialize(app, authenticate=auth.authenticate(database))
limiter = Limiter(app, global_limits=['120/minute'], key_func=get_remote_address)


@app.route("/api/rate/<image>", methods=["POST"])
@jwt.protected()
async def rate(request, image):
    logger.info(f"[{request.ip}] Image {image} rated {request}")


@app.route("/api/vote_sets")
@jwt.protected()
async def vote_sets(request: Request):
    # TODO: Shuffle list
    vs = list(await database.get_uncast_votes(image_collector.vote_sets, request.token))
    shuffle(vs)
    return json(vs)


@app.route("/api/stats")
@jwt.protected()
@jwt.scoped([auth.ADMIN])
async def stats(request):
    # TODO
    return json({})


@app.route("/api/download_data")
@jwt.protected()
@jwt.scoped([auth.ADMIN])
async def download_data(request):
    # TODO
    return json({})


def find_config():
    for location in CONFIG_LOCATIONS:
        if location.is_file():
            try:
                return location
            except IOError:
                continue
    return None


if __name__ == "__main__":
    logger.info("--[ image-survey ]--")
    config = {**DEFAULT_CONFIG, **app.config}
    config_file = find_config()
    if config_file is None:
        logger.info("No configuration file found.")
    else:
        logger.info(f"Loading config from {str(config_file)}")
        loaded_text = config_file.read_text()
        loaded = yaml.safe_load(loaded_text)
        if loaded is None:
            loaded = {}
        # Replace default options with ones provided in the file
        config = {**config, **loaded}
    app.update_config(config)
    logger.info("Config loaded.")

    if config['IMAGE_FILES_PATH']:
        image_collector.location = Path(config['IMAGE_FILES_PATH'])
    image_collector.find_image_sets()

    asyncio.run(database.connect(config['DATABASE_LOCATION']))
    asyncio.run(database.setup_tables())
    with database:
        logger.info("Starting up server...")
        app.run(host="0.0.0.0", port=8000, access_log=app.config['ACCESS_LOGGING'])
