FROM node:16

WORKDIR /opt/node_app
COPY package.json yarn.lock ./
RUN yarn
ENV PATH /opt/node_app/node_modules/.bin:$PATH
COPY . .
RUN yarn -s tsc
EXPOSE 8080

ENTRYPOINT [ "node", "dist/app.js", "--mode", "release" ]