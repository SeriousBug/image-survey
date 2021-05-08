import itertools
import sys
from collections import namedtuple
from pathlib import Path
from typing import Dict, Optional, Set

from sanic.log import logger

DEFAULT_LOCATION = Path.cwd() / "image-files"
SUPPORTED_IMAGE_FORMATS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".apng"}


Image = namedtuple("Image", ["path", "name", "variant"])
VoteSet = namedtuple("VoteSet", ["original", "variant_A", "variant_B"])


class ImageSet:
    def __init__(self, name):
        self.name: str = name
        self.original: Optional[Image] = None
        self.variants: Dict[str, Image] = {}


class ImageSetCollector:
    def __init__(self, location=DEFAULT_LOCATION):
        self.location: Path = location
        self.image_sets: Dict[str, ImageSet] = {}
        self.vote_sets: Set[VoteSet] = set()

    def __find_image_dirs(self):
        try:
            return list(self.location.iterdir())
        except IOError:
            logger.error(f"Failed to read subdirectories from {str(self.location)}")
            sys.exit(1)

    @staticmethod
    def __check_image(image: Path):
        if not image.is_file():
            logger.warning(f"Unexpected object {str(image)} in data set")
            return False
        if image.suffix.lower() not in SUPPORTED_IMAGE_FORMATS:
            logger.warning(
                f"Skipping bad image type {image.suffix[1:]},"
                f" please convert it to a supported format: {SUPPORTED_IMAGE_FORMATS}"
            )
            return False
        return True

    @staticmethod
    def __check_image_set(image_set: ImageSet):
        if len(image_set.variants) < 2:
            logger.warning(f"Image set {image_set.name} does not have 2 variants, skipping this set")
            return False
        return True

    @staticmethod
    def __find_variants(image_dir: Path):
        if not image_dir.is_dir():
            return None
        try:
            return list(filter(ImageSetCollector.__check_image, image_dir.iterdir()))
        except IOError:
            logger.error(f"Failed to read image files from {str(image_dir)}")
            sys.exit(1)

    def __compute_vote_pairs(self):
        self.vote_sets = set()
        for _name, image_set in self.image_sets.items():
            for var_a, var_b in itertools.combinations(image_set.variants.values(), 2):
                self.vote_sets.add(
                    VoteSet(
                        str(image_set.original.path) if image_set.original else None, str(var_a.path), str(var_b.path)
                    )
                )

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
                if variant.stem == "original":
                    if image_set.original is not None:
                        logger.warning(f"Multiple original images in {image_set.name}, please only keep one")
                    image_set.original = variant_image
                else:
                    image_set.variants[variant.stem] = variant_image
            if self.__check_image_set(image_set):
                self.image_sets[str(image_dir)] = image_set
        self.__compute_vote_pairs()
