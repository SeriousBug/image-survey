from uuid import uuid4

from sanic_jwt import exceptions as jwt_exceptions

SURVEYEE = "surveyee"
USER = "user"
ADMIN = "admin"
SURVEYEE_SCOPES = frozenset({SURVEYEE})
USER_SCOPES = frozenset({SURVEYEE, USER})
ADMIN_SCOPES = frozenset({SURVEYEE, USER, ADMIN})


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
            return {"user_id": token, "scopes": SURVEYEE_SCOPES}

        if not username or not password:
            raise jwt_exceptions.AuthenticationFailed("Missing username or password.")

        is_verified, is_admin = await database.verify_user(username, password)
        if is_verified:
            return {"user_id": username, "scopes": ADMIN_SCOPES if is_admin else USER_SCOPES}
        raise jwt_exceptions.AuthenticationFailed("Incorrect username or password.")

    return _authenticate
