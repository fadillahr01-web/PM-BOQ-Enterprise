FROM node:18-slim

# Pasang pustaka OpenSSL yang dibutuhkan oleh Prisma Engine secara bawaan
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Salin informasi dependensi proyek
COPY package*.json ./
RUN npm install

# Salin seluruh kode sumber ke dalam container
COPY . .

# Buat ulang Prisma Client murni berdasarkan skema Anda
RUN npx prisma generate --schema=./models/schema.prisma

EXPOSE 7860

ENV NODE_ENV=production

CMD ["npm", "start"]