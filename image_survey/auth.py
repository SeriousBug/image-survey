from uuid import uuid4

from sanic_jwt import exceptions as jwt_exceptions

SURVEYEE = "surveyee"
ADMIN = "admin"


def authenticate(database):
    async def _authenticate(request, *_args, **_kwargs):
        if request.json:
            username = request.json.get("username", None)
            password = request.json.get("password", None)
        else:
            username = None
            password = None

        if not username and not password:
            # Not actually authenticating, just a new survey taker
            token = f"{uuid4()}"
            await database.save_token(token)
            return {"user_id": token, "scopes": [SURVEYEE]}

        if not username or not password:
            raise jwt_exceptions.AuthenticationFailed("Missing username or password.")

        if await database.verify_user(username, password):
            return {"user_id": username, "scopes": [ADMIN]}
        raise jwt_exceptions.AuthenticationFailed("Incorrect username or password.")

    return _authenticate
