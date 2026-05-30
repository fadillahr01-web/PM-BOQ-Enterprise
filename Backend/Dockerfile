FROM node:18-alpine

# Menggunakan versi openssl bawaan alpine untuk kompabilitas engine prisma terbaru
RUN apk add --no-cache openssl gcompat libc6-compat

WORKDIR /app

COPY package*.json ./

# Tambahkan flag --no-cache pada npm install untuk memastikan tidak ada cache node_modules yang rusak
RUN npm install --no-cache

COPY . .

RUN npx prisma generate --schema=./models/schema.prisma

EXPOSE 7860

CMD ["npm", "start"]