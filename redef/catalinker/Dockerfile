FROM node:4.2.1

ENV REFRESHED_AT 2015-11-09

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm config set loglevel warn
RUN npm install
COPY . /usr/src/app

CMD [ "npm", "start" ]

EXPOSE 8010