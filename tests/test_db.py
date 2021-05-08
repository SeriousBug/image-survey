import tempfile
import os

from ward import test, fixture, raises

from image_survey.db import DB
from image_survey.imagesets import VoteSet


@fixture
async def database():
    db_file, db_file_name = tempfile.mkstemp(prefix='image-survey-test', suffix='sqlite')
    db = DB()
    await db.connect(db_file_name)
    await db.setup_tables()
    yield db
    await db.close()
    os.remove(db_file_name)


@test('survey workflow')
async def _(db=database):
    token = 'test token'
    await db.save_token(token)
    vset = VoteSet('original', 'left', 'right')
    await db.save_update_vote(token, vset, 'right')
    votes = await db.get_cast_votes(token)
    assert(len(votes) == 1)
    assert(votes[0] == vset)



@test('successful login')
async def _(db: DB=database):
    await db.save_user('ham', 'spam', False)
    await db.save_user('egg', 'bacon', True)
    is_successful, is_admin = await db.verify_user('ham', 'spam')
    assert(is_successful)
    assert(not is_admin)
    is_successful, is_admin = await db.verify_user('egg', 'bacon')
    assert(is_successful)
    assert(is_admin)


@test('wrong password')
async def _(db: DB=database):
    await db.save_user('ham', 'spam', False)
    is_successful, is_admin = await db.verify_user('ham', 'granola')
    assert(not is_successful)


@test('wrong username')
async def _(db: DB=database):
    await db.save_user('ham', 'spam', False)
    is_successful, is_admin = await db.verify_user('waffle', 'spam')
    assert(not is_successful)
