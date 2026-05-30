FROM node:18-alpine
# cache-buster: v2

# Pastikan baris instalasi ini ada di bawah FROM
RUN apk add --no-cache openssl gcompat libc6-compat

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate --schema=./models/schema.prisma

EXPOSE 7860

CMD ["npm", "start"]