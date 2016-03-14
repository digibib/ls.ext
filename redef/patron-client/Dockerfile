FROM node:5.8.0

ENV REFRESHED_AT 2016-01-10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm set progress=false
RUN npm set color=false
RUN npm install > install.log 2>&1

VOLUME /usr/src/app/src
VOLUME /usr/src/app/test

EXPOSE 8000

CMD [ "npm", "start" ]