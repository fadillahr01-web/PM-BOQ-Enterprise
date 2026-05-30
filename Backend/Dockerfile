FROM node:18-alpine

RUN apk update && \
    apk add --no-cache libssl1.1 --repository=http://dl-cdn.alpinelinux.org/alpine/v3.16/main libcrypto1.1 --repository=http://dl-cdn.alpinelinux.org/alpine/v3.16/main

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PRISMA_CLIENT_ENGINE_TYPE="library"

RUN npx prisma generate --schema=./models/schema.prisma

EXPOSE 7860

CMD ["npm", "start"]
