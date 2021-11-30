Overview

The development environment uses docker and docker-compose.

Prerequisites

Install docker, there is a distribution for mac.

Get docker-compose

You might need to set up a ssh key for github (follow these instructions) and set the email address of the github user.

How to set it up (with pycharm and local env with debug capability for frontend and backend development)

Make sure you have pip, docker and docker-compose installed (we need it for the database)

Clone the CRM repository

git clone git@github.com:zonason/CRM.git

install virutalenv

pip3 install virtualenv

go to the root of your checked out repository

cd CRM

install pre-commit

pip3 install "pre-commit==1.16.1"
pre-commit install

create a virtualenv

virtualenv -p /usr/bin/python3 .venv3

edit .venv3/bin/activate and add at the end following lines

export DJANGO_SETTINGS_MODULE=backend.settings.local

activate the virtual environment

source .venv3/bin/activate

install requirements

pip3 install -r requirements.txt

start local components

docker-compose -f docker-compose.dev.yml up

run the migrations

python3 manage.py migrate

Create initial user

python3 manage.py createsuperuser

Installing PostGIS & GDAL (on a mac):

brew install postgis
pip3 install gdal

Point PyCharm project interpreter to use ./venv/bin/python3 in PyCharm Settings

In Pycharm: Under Run > Edit Config: create "worker" config from "python" template:

Script Path: /CRM/.venv3/bin/celery

Parameters: --app=backend worker -B -l debug

Working Directory: (point it to the checked out git repository)

Environment Variables:

PYTHONUNBUFFERED=1

DJANGO_SETTINGS_MODULE=backend.settings.localdev

In Pycharm: Under Run > Edit Config: create "web" config from "django server" template:

Host: 0.0.0.0

Environment Variables:

PYTHONUNBUFFERED=1

DJANGO_SETTINGS_MODULE=backend.settings.localdev

In Pycharm: Under Run > Edit Config: create "web:test" config from "django test" template:

Options: --parallel=4

Working Directory: (point it to the checked out git repository)

Environment Variables:

PYTHONUNBUFFERED=1

C_FORCE_ROOT=1

REMAP_SIGTERM=SIGQUIT

DJANGO_SETTINGS_MODULE=backend.settings.localdev

In PyCharm: Under Run > Run ... : Run worker

In PyCharm: Under Run > Run ... : Run web

In PyCharm: Under Run > Run ... : Run web:test

Run front end by using : npm run start

In PyCharm: Und Run > Run ... : Run worker

In PyCharm: Und Run > Run ... : Run web

In PyCharm: Und Run > Run ... : Run web:test

point your browser at http://localhost:8000

hard reset docker

If you want to bring your docker installation to the state it was right after it was installed.

	docker stop $(docker ps -a -q) # stop all running containers
	docker rm $(docker ps -a -q) # delete all containers
	docker rmi $(docker images -q) # delete all images

or with newer docker versions:

	docker system prune -a --images # will delete all docker content (container, images networks and volumes)

That can be useful if you think that an docker image was build wrongly. Please note that this will alter docker for all projects using it and can cause problems where state is keeped inside containers. For example postgres does not handle changes in its data directory in all cases, so you could loose you local databases.