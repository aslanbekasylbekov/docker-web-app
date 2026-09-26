# Docker Web App

A minimal Node.js web application running in a Docker container.

## Build the image

```bash
docker build -t docker-web-app .
```

## Run the container

```bash
docker run -d --name web-app -p 8080:3000 docker-web-app
```

Open <http://localhost:8080>.

## Run with environment variables

```bash
docker run -d --name web-app -p 8080:3000 \
  -e APP_NAME="My App" \
  -e APP_ENV=staging \
  docker-web-app
```

| Variable   | Default          |
|------------|------------------|
| `PORT`     | `3000`           |
| `APP_NAME` | `Docker Web App` |
| `APP_ENV`  | `production`     |

## Stop and remove

```bash
docker rm -f web-app
```
