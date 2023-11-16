FROM node:18-bullseye
RUN apt-get update -y
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN npm install nodemon --global
RUN yarn install
COPY . .
EXPOSE 3000
CMD [ "bash", "./docker/run.sh" ]