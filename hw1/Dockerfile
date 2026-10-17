FROM node:22-alpine

WORKDIR /app

ENV PORT=3000 \
    APP_NAME="Docker Web App" \
    APP_ENV=production

COPY package.json server.js ./

USER node

EXPOSE 3000

CMD ["node", "server.js"]