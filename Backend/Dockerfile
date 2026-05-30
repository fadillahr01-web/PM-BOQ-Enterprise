FROM node:18-alpine

# 1. Pasang libssl1.1 resmi untuk Alpine lama agar binary Prisma Musl bisa membacanya
RUN apk update && \
    apk add --no-cache libssl1.1 --repository=http://dl-cdn.alpinelinux.org/alpine/v3.16/main

WORKDIR /app

COPY package*.json ./

# 2. Lakukan install bersih
RUN npm install

COPY . .

# 3. Paksa Prisma untuk mengabaikan cache lokal dan membuat binary murni linux-musl saat deployment
RUN npx prisma generate --schema=./models/schema.prisma

EXPOSE 7860

CMD ["npm", "start"]