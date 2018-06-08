FROM node:latest
WORKDIR /arbitrage.js
ADD . /arbitrage.js
RUN npm install
EXPOSE 4000
CMD [ "npm", "start" ]
