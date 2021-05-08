from functools import wraps

from sanic import Sanic
from sanic.exceptions import ServiceUnavailable


class DownForMaintenance(ServiceUnavailable):
    def __init__(self):
        super().__init__(
            "Service is temporarily down for maintenance. Please try again later, or check in with survey operators."
        )


def check_disabled(app: Sanic):
    def _check_disabled_decorator(func):
        @wraps(func)
        async def _check_disabled_decorated(request, *args, **kwargs):
            try:
                if app.ctx.is_disabled:  # TODO: Should make this persistent
                    raise DownForMaintenance()
            except AttributeError:
                pass  # Not explicitly disabled or enabled, so assume that it's enabled
            return await func(request, *args, **kwargs)

        return _check_disabled_decorated

    return _check_disabled_decorator
