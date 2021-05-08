from image_survey.imagesets import ImageSetCollector, VoteSet
import os
import tempfile
import shutil
import pathlib

from sanic import Sanic
from image_survey.db import DB
from image_survey import main

from sanic_testing import TestManager
from ward import test, fixture, raises



@fixture
async def database():
    db_file, db_file_name = tempfile.mkstemp(prefix='image-survey-test', suffix='sqlite')
    db = DB()
    await db.connect(db_file_name)
    await db.setup_tables()
    yield db
    await db.close()
    os.remove(db_file_name)


@fixture
async def image_dir():
    imgdir = tempfile.mkdtemp(prefix='image-survey-test')
    imgdir = pathlib.Path(imgdir)
    (imgdir / 'one').mkdir()
    (imgdir / 'one' / 'original.png').touch()
    (imgdir / 'one' / 'left.png').touch()
    (imgdir / 'one' / 'right.png').touch()
    (imgdir / 'two').mkdir()
    (imgdir / 'two' / 'original.png').touch()
    (imgdir / 'two' / 'first.png').touch()
    (imgdir / 'two' / 'second.png').touch()
    (imgdir / 'two' / 'third.png').touch()
    yield imgdir
    shutil.rmtree(imgdir)


@fixture
async def server(db: DB=database, images=image_dir):
    main.app.ctx.database = db
    main.app.ctx.image_collector = ImageSetCollector(images)
    main.app.ctx.image_collector.find_image_sets()
    TestManager(main.app)
    yield main.app


@test('survey workflow')
async def _(app: Sanic=server):
    # Acquire token
    request, response = await app.asgi_client.post('/api/auth')
    assert('access_token' in response.json)
    token = response.json['access_token']
    print(token)
    assert(token is not None and len(token) > 0)
    
    # See what we can vote on
    headers = {'Authorization': f'Bearer {token}'}
    request, response = await app.asgi_client.get('/api/vote_sets', headers=headers)
    assert('votesets' in response.json)
    assert(len(response.json['votesets']) == 4)
    assert(response.json['current'] == 0)
    # Try voting on some
    vote_on = response.json['votesets'][0]
    request, response = await app.asgi_client.post(
        '/api/rate',
        json={
            'original': vote_on['original'],
            'variant_A': vote_on['variant_A'],
            'variant_B': vote_on['variant_B'],
            'voted_for': vote_on['variant_B'],
        },
        headers=headers,
    )
    assert(response.status < 300)
    # Remaining votes should have changed
    request, response = await app.asgi_client.get('/api/vote_sets', headers=headers)
    assert('votesets' in response.json)
    assert(len(response.json['votesets']) == 4)
    assert(response.json['current'] == 1)
    