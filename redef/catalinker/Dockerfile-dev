FROM node:4.2.1

ENV REFRESHED_AT 2016-02-10T08:58

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY .jscsrc /usr/src/app/
COPY .jshintrc /usr/src/app/
COPY .eslintrc /usr/src/app/

RUN npm set progress=false
RUN npm set color=false
RUN npm install > install.log 2>&1
VOLUME /usr/src/app/client
VOLUME /usr/src/app/public
VOLUME /usr/src/app/server

EXPOSE 8010

CMD [ "npm", "start" ]