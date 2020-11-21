from setuptools import setup

with open('requirements.txt') as f:
    requirements = f.read().splitlines()

setup(
   name='image_survey',
   version='1.0',
   description='Perform human qualitative image comparison surveys.',
   author='Kaan Genc',
   author_email='imgsrv@kaangenc.me',
   packages=['image_survey'],
   install_requires=requirements,
)
