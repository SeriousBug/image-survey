import asyncio
import os
import aiosqlite
from hashlib import scrypt
from sanic.log import logger
from image_survey.imagesets import VoteSet


class DB:
    def __init__(self):
        # noinspection PyTypeChecker
        self.__conn: aiosqlite.Connection = None

    async def setup_tables(self):
        await self.__conn.execute(
            'CREATE TABLE IF NOT EXISTS tokens('
            '  id TEXT PRIMARY KEY,'
            '  date_generated TEXT'
            ');'
        )
        await self.__conn.execute(
            'CREATE TABLE IF NOT EXISTS admins('
            '  username TEXT PRIMARY KEY,'
            '  salt TEXT,'
            '  password TEXT'
            ');'
        )
        await self.__conn.execute(
           'CREATE TABLE IF NOT EXISTS votes('
           '  token_id TEXT,'
           '  date_cast TEXT,'
           '  original TEXT,'
           '  option_A TEXT,'
           '  option_B TEXT,'
           '  voted_for TEXT,'
           '  PRIMARY KEY (token_id, original, option_A, option_B)'
           '  FOREIGN KEY (token_id) REFERENCES tokens(id)'
           ');'
        )
        await self.__conn.execute(
            'CREATE INDEX IF NOT EXISTS token_votes ON votes(token_id);'
        )

    async def save_token(self, token):
        await self.__conn.execute(
            'INSERT OR IGNORE INTO tokens VALUES(?, CURRENT_TIMESTAMP);',
            [token],
        )

    async def save_user(self, username, password):
        salt = os.urandom(32)
        await self.__conn.execute(
            'INSERT INTO admins VALUES(?, ?, ?);',
            [username, salt.hex(), scrypt(password, salt=salt)]
        )

    async def verify_user(self, username, password_claim):
        salt_cursor = await self.__conn.execute('SELECT salt, password FROM admins WHERE username = ?;', [username])
        salt, password_real = await salt_cursor.fetchone()
        return scrypt(password_claim, salt=salt) == password_real

    async def save_update_vote(self, token, vote_set: VoteSet, voted_for):
        await self.__conn.execute(
            'INSERT INTO votes'
            '  VALUES(?, CURRENT_TIMESTAMP, ?, ?, ?, ?)'
            '  ON CONFLICT(token_id, original, option_A, option_B)'
            '    DO UPDATE SET voted_for = ?;',
            [token, vote_set.original, vote_set.variant_A, vote_set.variant_B, voted_for, voted_for]
        )
        await self.__conn.commit()

    async def connect(self, *args, **kwargs):
        logger.info("Connecting to the database...")
        self.__conn = await aiosqlite.connect(*args, isolation_level=None, **kwargs)
        logger.info("Done!")

    async def get_cast_votes(self, token):
        cast_votes = []
        async with self.__conn.execute(
            'SELECT original, option_A, option_B FROM votes WHERE token_id = ? ORDER BY date_cast ASC;',
            [token]
        ) as votes_cursor:
            async for original, option_A, option_B in votes_cursor:
                cast_votes.append(VoteSet(original, option_A, option_B))
        return cast_votes

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        logger.info("Closing database connection!")
        asyncio.run(self.__conn.close())
