from functools import wraps

from sanic import Sanic
from sanic.exceptions import ServiceUnavailable


class DownForMaintenance(ServiceUnavailable):
    def __init__(self):
        super(DownForMaintenance, self).__init__(
            "Service is temporarily down for maintenance. Please try again later, or check in with survey operators."
        )


def check_disabled(app: Sanic):
    def _check_disabled_decorator(f):
        @wraps(f)
        async def _check_disabled_decorated(request, *args, **kwargs):
            if app.ctx.is_disabled:
                raise DownForMaintenance()
            return await f(request, *args, **kwargs)

        return _check_disabled_decorated

    return _check_disabled_decorator
