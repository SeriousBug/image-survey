# Image Survey

Do qualitative image comparison surveys where 2 image variants are compared against an original.

[A demo is available.](https://imagesurvey.kaangenc.me/)

![Example screenshot of the comparison UI.](misc/screenshot-vote.jpg)

## Requirements

For the backend:

* `python` 3.7 or newer, and `pip`
* `sqlite` 3.24.0 or newer

For the frontend:

* `nodejs`
* `npm` or `yarn`

Alternatively, all dependencies are included when using `docker` and
`docker-compose` with the provided files.

## Usage

First, pull the repository.

``` shell
git pull 'https://github.com/SeriousBug/image-survey.git'
```

Next, add your images to the `image-files` folder. A readme file is provided in
the folder on naming conventions.

Then, go to the `ui` folder, copy the file `.env` to `.env.local`, then modify
`.env.local` to customize the UI and fit your setup.


### Docker

First, enter the `/etc` directory, copy `image-survey.sample.yaml` as
`image-survey.yaml`, and change the line `AUTH_SECRET` to some random value.
Please do not modify any other option.

A `docker-compose.yaml` file is provided for your convenience. You can use this
file to build and run the service by running the following command:

``` shell
docker-compose up -d
```

Alternatively, you can build and run the container directly. To do so, run the following command to build the container.

``` shell
docker build . --tag 'image-survey:1.0' --tag 'image-survey:latest'
```

You can then use the following command to run the service:

``` shell
docker run -v etc/:/etc/image-survey/ -v image-files/:/image-files/ -v database/:/database image-survey:latest
```

Either way, the service will now be available at `http://localhost:8000`. You
can change which port the service is located at by modifying
`docker-compose.yaml` if using docker-compose, or changing `-p 8000:8000`.


### Bare

First, install the backend. At the top level directory:

``` shell
pip3 install -r requirements.txt
pip3 install .
```

Next, build the UI, inside the `ui` directory.

``` shell
npm install # or yarn
npm run build # or yarn build
```


Finally, run the service. At the top level directory:

``` shell
python3 image_survey/main.py
```

## Development

If you are working on modifying this codebase, you can follow these commands to set up your development environment.

```shell script
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
pip3 install -e .

python3 image-survey/main.py

# In a different terminal
cd ui
yarn
yarn start
```

Yarn starts a development server to serve the UI, make sure to use that so that
you see any changes you make to the UI without having to do a full rebuild.
