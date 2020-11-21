from uuid import uuid4
import os
import aiosqlite
from hashlib import scrypt
from sanic.log import logger


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
            '  password TEXT,'
            ');'
        )
        await self.__conn.execute(
           'CREATE TABLE IF NOT EXISTS votes('
           '  token_id TEXT,'
           '  date_cast TEXT,'
           '  option_A TEXT,'
           '  option_B TEXT,'
           '  voted_for TEXT,'
           '  PRIMARY KEY (id, option_A, option_B)'
           '  FOREIGN KEY (token_id) REFERENCES tokens(id)'
           ');'
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

    async def save_update_vote(self, token, option_A, option_B, voted_for):
        await self.__conn.execute('INSERT INTO votes(*)'
                                  '  VALUES(?, CURRENT_TIMESTAMP, ?, ?, ?)'
                                  '  ON CONFLICT(token_id, option_A, option_B)'
                                  '    DO UPDATE SET voted_for = ?;',
                                  [token, option_A, option_B, voted_for, voted_for])

    async def connect(self, *args, **kwargs):
        logger.info("Connecting to the database...")
        self.__conn = await aiosqlite.connect(*args, **kwargs)
        logger.info("Done!")

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        logger.info("Closing database connection!")
        await self.__conn.close()
