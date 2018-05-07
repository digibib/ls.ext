FROM node:6.9.1

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY public /usr/src/app/
COPY src/backend /usr/src/app/backend
COPY src/common /usr/src/app/common

RUN npm set progress=false
RUN npm set color=false
RUN npm install > install.log 2>&1

COPY . /usr/src/app
EXPOSE 8000

CMD [ "npm", "run", "production"]