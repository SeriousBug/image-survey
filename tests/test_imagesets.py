import tempfile
import pathlib
import shutil

from ward import test, fixture, raises

from image_survey.imagesets import ImageSet, ImageSetCollector


@fixture
def image_dir():
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

@test('collect image sets')
def _(imgdir=image_dir):
    collector = ImageSetCollector(location=imgdir)
    collector.find_image_sets()
    assert(len(collector.image_sets) == 2)
    assert(len(collector.vote_sets) == 4)
