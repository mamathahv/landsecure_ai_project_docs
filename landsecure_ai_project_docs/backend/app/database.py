import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    try:
        current_loop = asyncio.get_running_loop()
    except RuntimeError:
        current_loop = None

    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGODB_URL)
    else:
        try:
            loop = _client.get_io_loop()
            if loop.is_closed() or (current_loop is not None and loop != current_loop):
                _client = AsyncIOMotorClient(settings.MONGODB_URL)
        except Exception:
            _client = AsyncIOMotorClient(settings.MONGODB_URL)
    return _client


def get_database():
    return get_client()[settings.MONGODB_DB]


class CollectionProxy:
    def __init__(self, name: str):
        self._name = name

    def _coll(self):
        return get_database()[self._name]

    def __getattr__(self, item):
        return getattr(self._coll(), item)

    def __getitem__(self, item):
        return self._coll()[item]


class ClientProxy:
    def __getitem__(self, name):
        return get_client()[name]

    def __getattr__(self, name):
        return getattr(get_client(), name)


class DatabaseProxy:
    def __getitem__(self, name: str):
        return CollectionProxy(name)

    def __getattr__(self, name: str):
        return getattr(get_database(), name)


client = ClientProxy()
db = DatabaseProxy()


async def ping_db() -> bool:
    try:
        await get_client().admin.command("ping")
        return True
    except Exception:
        return False
