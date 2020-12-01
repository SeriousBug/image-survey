# Image Survey

Do qualitative image comparison surveys where 2 image variants are compared against an original.

![Example screenshot of the comparison UI.](misc/screenshot-vote.jpg)

### Requirements

* python 3.7 or newer
* sqlite 3.24.0 or newer

### Development

```shell script
pip3 install -r requirements.txt
pip3 install -e .

cp image-survey.yaml.sample image-survey.yaml
# edit image-survey.yaml
python3 image-survey/main.py

# In a different terminal
cd ui
npm install
npm run start
```
