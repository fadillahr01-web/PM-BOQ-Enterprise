# Menggunakan versi Debian Slim yang jauh lebih stabil untuk Prisma
FROM node:18-slim

# Menginstal OpenSSL secara manual agar Prisma tidak panik
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Mengambil package.json dari folder Backend
COPY Backend/package*.json ./
RUN npm install

# Menyalin seluruh file backend Anda
COPY Backend/ .

# Memaksa server Node.js Anda untuk menggunakan port wajib Hugging Face
ENV PORT=7860
EXPOSE 7860

# Melakukan generate skema dan menyalakan server
CMD npx prisma generate --schema=./models/schema.prisma && npm start