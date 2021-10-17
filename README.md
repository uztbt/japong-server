# JaPong Server

JaPong is a multi-player online Pong game. You can play JaPong at https://yuji.page/japong.

If you want to play with a CPU, please visit https://yuji.page/pong.
The documentation of JaPong is hosted at https://storage.googleapis.com/japong-document-web/index.html.

## System Requirements

- Node.js 16.0

## How to Run

Change `src/config.ts` to suite your environment.

```zsh
yarn
yarn debug
```

## How the Docker Image is published

```
docker build -t uztbt/japong-server:x.x.x .
docker push uztbt/japong-server:x.x.x
```
