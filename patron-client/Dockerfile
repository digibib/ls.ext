FROM node:0.12

RUN npm install -g nodemon
RUN npm install -g jslint
RUN npm install -g mocha

RUN mkdir -p /usr/src/app
COPY package.json /usr/src/app/
WORKDIR /usr/src/app
RUN npm install

COPY . /usr/src/app

CMD [ "npm", "start" ]
EXPOSE 8000
