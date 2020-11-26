from pathlib import Path
from collections import namedtuple
from sanic.log import logger
import itertools

DEFAULT_LOCATION = Path.cwd() / 'image-files'


Image = namedtuple('Image', ['path', 'name', 'variant'])
VoteSet = namedtuple('VoteSet', ['original', 'variant_A', 'variant_B'])


class ImageSet:
    def __init__(self, name):
        self.name = name
        self.original = None
        self.variants = {}


class ImageSetCollector:
    def __init__(self, location=DEFAULT_LOCATION):
        self.location = location
        self.image_sets = {}
        self.vote_sets = set()

    def __find_image_dirs(self):
        try:
            return list(self.location.iterdir())
        except IOError:
            logger.error(f'Failed to read subdirectories from {str(self.location)}')
            exit(1)

    @staticmethod
    def __check_image(image: Path):
        if not image.is_file():
            logger.warning(f'Unexpected object {str(image)} in data set')
            return False
        if image.suffix.lower() not in {'.png', '.jpg', '.jpeg'}:
            logger.warning(f'Skipping bad image type {image.suffix[1:]}, please convert it to PNG or JPG')
            return False
        return True

    @staticmethod
    def __check_image_set(image_set: ImageSet):
        if not image_set.original:
            logger.warning(f'Image set {image_set.name} is missing the original image, skipping this set')
            return False
        if len(image_set.variants) < 2:
            logger.warning(f'Image set {image_set.name} does not have 2 variants, skipping this set')
            return False
        return True

    @staticmethod
    def __find_variants(image_dir: Path):
        if not image_dir.is_dir():
            return
        try:
            return list(filter(ImageSetCollector.__check_image,
                               image_dir.iterdir()))
        except IOError:
            logger.error(f'Failed to read image files from {str(image_dir)}')
            exit(1)

    def __compute_vote_pairs(self):
        self.vote_sets = set()
        for name, image_set in self.image_sets.items():
            for var_A, var_B in itertools.combinations(image_set.variants.values(), 2):
                self.vote_sets.add(VoteSet(str(image_set.original.path), str(var_A.path), str(var_B.path)))

    def find_image_sets(self):
        image_dirs = self.__find_image_dirs()
        self.image_sets = {}
        for image_dir in image_dirs:
            image_set = ImageSet(image_dir)
            name = image_dir.stem
            variants = self.__find_variants(image_dir)
            if variants is None:
                continue
            for variant in variants:
                variant_image = Image(variant, name, variant.stem)
                if variant.stem == 'original':
                    if image_set.original is not None:
                        logger.warning(f'Multiple original images in {image_set.name}, please only keep one')
                    image_set.original = variant_image
                else:
                    image_set.variants[variant.stem] = variant_image
            if self.__check_image_set(image_set):
                self.image_sets[str(image_dir)] = image_set
        self.__compute_vote_pairs()
