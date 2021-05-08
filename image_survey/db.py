import asyncio
import hashlib
import os

import aiosqlite
from sanic.log import logger

from image_survey.imagesets import VoteSet

# The following options configure scrypt to use 128 * N * R == 32 MB of memory
# to hash a password. Changing these parameters will break verification for all
# passwords, so avoid modifying these until we have support for re-hashing old
# passwords.
SCRYPT_N = 2 ** 15  # Increase iterations and memory use
SCRYPT_R = 8  # Increase memory use
SCRYPT_P = 1  # Disallow parallelization
SCRYPT_MAX_MEM = 2 ** 26  # Don't use more than 64 MB of memory


def scrypt(password: bytes, salt: bytes) -> bytes:
    return hashlib.scrypt(password, salt=salt, n=SCRYPT_N, r=SCRYPT_R, p=SCRYPT_P, maxmem=SCRYPT_MAX_MEM)


class DB:
    def __init__(self):
        # noinspection PyTypeChecker
        self.__conn: aiosqlite.Connection = None

    async def setup_tables(self):
        await self.__conn.execute("CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT);")
        await self.__conn.execute("CREATE TABLE IF NOT EXISTS tokens(id TEXT PRIMARY KEY, date_generated TEXT);")
        await self.__conn.execute(
            "CREATE TABLE IF NOT EXISTS users("
            "  username TEXT PRIMARY KEY,"
            "  is_admin INTEGER,"
            "  salt BLOB,"
            "  password BLOB"
            ");"
        )
        await self.__conn.execute(
            "CREATE TABLE IF NOT EXISTS votes("
            "  token_id TEXT,"
            "  date_cast TEXT,"
            "  original TEXT,"
            "  option_A TEXT,"
            "  option_B TEXT,"
            "  voted_for TEXT,"
            "  PRIMARY KEY (token_id, original, option_A, option_B)"
            "  FOREIGN KEY (token_id) REFERENCES tokens(id)"
            ");"
        )
        await self.__conn.execute("CREATE INDEX IF NOT EXISTS token_votes ON votes(token_id);")

    async def save_token(self, token):
        await self.__conn.execute(
            "INSERT OR IGNORE INTO tokens VALUES(?, CURRENT_TIMESTAMP);",
            [token],
        )

    async def save_user(self, username: str, password: str, is_admin: bool):
        salt = os.urandom(32)
        await self.__conn.execute(
            "INSERT INTO users VALUES(?, ?, ?, ?);",
            [username, int(is_admin), salt, scrypt(password.encode(), salt=salt)],
        )

    async def verify_user(self, username, password_claim):
        cursor = await self.__conn.execute("SELECT is_admin, salt, password FROM users WHERE username = ?;", [username])
        results = await cursor.fetchone()
        if results is None:
            return False, False
        is_admin, salt, password_real = results
        return scrypt(password_claim.encode(), salt=salt) == password_real, is_admin

    async def save_update_vote(self, token, vote_set: VoteSet, voted_for):
        await self.__conn.execute(
            "INSERT INTO votes"
            "  VALUES(?, CURRENT_TIMESTAMP, ?, ?, ?, ?)"
            "  ON CONFLICT(token_id, original, option_A, option_B)"
            "    DO UPDATE SET voted_for = ?, date_cast = CURRENT_TIMESTAMP;",
            [token, vote_set.original, vote_set.variant_A, vote_set.variant_B, voted_for, voted_for],
        )
        await self.__conn.commit()

    async def connect(self, *args, **kwargs):
        logger.info("Connecting to the database...")
        self.__conn = await aiosqlite.connect(*args, isolation_level=None, **kwargs)
        logger.info("Done!")

    async def get_cast_votes(self, token):
        cast_votes = []
        async with self.__conn.execute(
            "SELECT original, option_A, option_B FROM votes WHERE token_id = ? ORDER BY date_cast ASC;", [token]
        ) as votes_cursor:
            async for original, option_a, option_b in votes_cursor:
                cast_votes.append(VoteSet(original, option_a, option_b))
        return cast_votes

    async def get_surveys_started(self):
        cursor = await self.__conn.execute("SELECT COUNT(id) FROM tokens;")
        return await cursor.fetchone()

    async def get_surveys_completed(self, vote_sets):
        cursor = await self.__conn.execute(
            "SELECT COUNT(token_id) FROM ("
            "    SELECT token_id, COUNT(token_id) as vote_count FROM votes GROUP BY token_id"
            ") WHERE vote_count = ?;",
            [len(vote_sets)],
        )
        return await cursor.fetchall()

    async def get_all_votes(self):
        raise NotImplementedError()

    async def get_meta(self, key: str):
        cursor = await self.__conn.execute("SELECT value FROM meta WHERE key = ?;", [key])
        result = await cursor.fetchone()
        return result[0] if result is not None else None

    async def set_meta(self, key: str, value: str):
        await self.__conn.execute(
            "INSERT INTO meta VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = ?;", [key, value, value]
        )

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        logger.info("Closing database connection!")
        asyncio.run(self.__conn.close())

    async def close(self):
        await self.__conn.close()
