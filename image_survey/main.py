import asyncio
from getpass import getpass
import itertools
import os
from pathlib import Path
from random import shuffle
import argparse
import sys

import sanic.exceptions
import sanic_jwt
import yaml
from sanic import Sanic, exceptions, response
from sanic.log import logger
from sanic.request import Request
from sanic_cors import CORS
from sanic_limiter import Limiter, get_remote_address

from image_survey import auth, db
from image_survey.admin import check_disabled
from image_survey.imagesets import ImageSetCollector, VoteSet

# Potential locations of the config file.
# We'll try them in order, falling back to latter ones if earlier ones do not exist.

CONFIG_LOCATIONS = [
    # Current directory
    Path.cwd() / "image-survey.yaml",
    # $HOME/.config/image_survey or if defined, $XDG_CONFIG_DIRS/image_survey
    Path(os.getenv("XDG_CONFIG_DIRS", default=str(Path.home() / ".config"))) / "image-survey" / "image-survey.yaml",
    # /etc/image_survey
    Path("/etc") / "image-survey" / "image-survey.yaml",
]


# Default configuration, used as a fallback if no config file is found.
DEFAULT_CONFIG = {
    "DATABASE_LOCATION": "./image-survey.sqlite",
    "REQUEST_MAX_SIZE": 8000,
    "WEBSOCKET_MAX_SIZE": 8000,
    "KEEP_ALIVE_TIMEOUT": 15,
    "ACCESS_LOGGING": True,
    "IMAGE_FILES_PATH": "./image-files",
    "AUTH_EXPIRATION_DELTA": 60 * 60 * 72,  # 72 hours
    "AUTH_URL_PREFIX": "/api/auth",
    "AUTH_SECRET": "image-survey secret",
    "PORT": 8000,
}


image_collector = ImageSetCollector()
database = db.DB()
# Sanic used the wrong type for load_env, it's a bool or string. Override inspection for this statement.
# noinspection PyTypeChecker
app = Sanic("image survey", load_env="IMG_SURVEY_", strict_slashes=False)


def find_config():
    for location in CONFIG_LOCATIONS:
        if location.is_file():
            try:
                return location
            except IOError:
                continue
    return None


logger.info("-------[ image-survey ]-------")
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

jwt = sanic_jwt.Initialize(
    app,
    authenticate=auth.authenticate(database),
    secret=config["AUTH_SECRET"],
    url_prefix=config["AUTH_URL_PREFIX"],
    expiration_delta=config["AUTH_EXPIRATION_DELTA"],
)
limiter = Limiter(app, global_limits=["120/minute"], key_func=get_remote_address)
# TODO: Make this optionally enabled
CORS(app)


INDEX_PAGE = str(Path.cwd() / "ui" / "build" / "index.html")
app.static("/", INDEX_PAGE)
app.static("/start-survey/", INDEX_PAGE)
app.static("/complete/", INDEX_PAGE)


@app.route("/survey/<_n>")
async def survey(_request, _n):
    return await response.file(INDEX_PAGE)


app.static("/static/", str(Path.cwd() / "ui" / "build" / "static"))
app.static("/image-files/", str(config["IMAGE_FILES_PATH"]))


@app.route("/api/rate", methods=["POST"])
@jwt.protected()
@check_disabled(app)
async def rate(request):
    try:
        voted = VoteSet(request.json["original"], request.json["variant_A"], request.json["variant_B"])
        voted_for = request.json["voted_for"]
    except AttributeError:
        raise exceptions.InvalidUsage("Invalid request, missing some parameters")
    if voted not in image_collector.vote_sets:
        raise exceptions.InvalidUsage(f"{voted} is not a known image set")
    if voted_for not in [voted.original, voted.variant_A, voted.variant_B]:
        raise exceptions.InvalidUsage(
            f"{voted_for} is not a correct option, must be {voted.variant_A} or {voted.variant_B}"
        )

    logger.info(f"{request.token} rated {voted} with {voted_for}")
    await database.save_update_vote(request.token, voted, voted_for)
    return response.empty()


@app.route("/api/vote_sets")
@jwt.protected()
@check_disabled(app)
async def vote_sets(request: Request):
    cast_votes = await database.get_cast_votes(request.token)
    uncast_votes = list(image_collector.vote_sets.difference(cast_votes))
    shuffle(uncast_votes)
    votes = [v._asdict() for v in itertools.chain(cast_votes, uncast_votes)]
    return response.json(
        {
            "votesets": votes,
            "current": len(cast_votes),
        }
    )


@app.route("/api/user/stats")
@jwt.protected()
@jwt.scoped([auth.USER])
async def stats(request):
    return response.json(
        {
            "started": database.get_surveys_started(),
            "completed": database.get_surveys_completed(image_collector.vote_sets),
        }
    )


@app.route("/api/admin/disable_surveys")
@jwt.protected()
@jwt.scoped([auth.ADMIN])
async def stats(request):
    try:
        if request.json["disable"]:
            app.ctx.is_disabled = True
        else:
            app.ctx.is_disabled = False
        return response.json(True)
    except KeyError:
        raise sanic.exceptions.InvalidUsage()


@app.route("/api/user/download_data")
@jwt.protected()
@jwt.scoped([auth.ADMIN])
async def download_data(request):
    # TODO
    raise NotImplementedError()


def add_user(username: str, is_admin: bool):
    password = getpass(prompt=f'Password for {username}: ')
    asyncio.run(database.save_user(username, password, is_admin))


def main():
    is_server = len(sys.argv) == 1
    parser = argparse.ArgumentParser(description='Image survey server.')
    parser.add_argument('-a', '--add-admin', dest='admin_username', default=list(), action='append', type=str, help='Set up an admin user. Admins have full control over the survey, including disabling the survey or deleting the results.')
    parser.add_argument('-u', '--add-user', dest='username', default=list(), action='append', type=str, help='Set up a user. Users can view survey results, but can not control the survey.')
    parser.add_argument('-c', '--check-images', dest='check_images', action='store_true', help='Check the configured image files, and report what configuration we found.')
    args = parser.parse_args()

    if config["IMAGE_FILES_PATH"]:
        image_collector.location = Path(config["IMAGE_FILES_PATH"])
    image_collector.find_image_sets()
    if args.check_images:
        image_collector.print_report()

    # Set up user and admin accounts.
    asyncio.run(database.connect(config["DATABASE_LOCATION"]))
    for username in args.username:
        add_user(username, False)
    for username in args.admin_username:
        add_user(username, True)
    
    if not is_server:
        # Not running as a server, just exit.
        sys.exit(0)

    asyncio.run(database.setup_tables())
    with database:
        logger.info("Starting up server...")
        app.run(host="0.0.0.0", port=config["PORT"], access_log=app.config["ACCESS_LOGGING"])


if __name__ == '__main__':
    main()
