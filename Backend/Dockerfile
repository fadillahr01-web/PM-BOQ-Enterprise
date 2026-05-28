FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Salin seluruh kode backend terlebih dahulu
COPY . .

# Jalankan generate secara mandiri jika library-nya terpasang di package.json
RUN npx prisma generate --schema=./node_modules/.prisma/client || true

EXPOSE 7860
ENV PORT=7860

CMD ["node", "server.js"]