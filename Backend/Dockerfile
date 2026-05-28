FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Pasang semua library Node.js
RUN npm install

# Salin folder prisma yang berisi skema database Anda terlebih dahulu (jika ada)
COPY prisma ./prisma/

# KRASIAL: Generate Prisma Client agar tidak eror saat aplikasi startup
RUN npx prisma generate

# Salin sisa seluruh kode backend lainnya
COPY . .

# Menggunakan port standar Hugging Face
EXPOSE 7860
ENV PORT=7860

CMD ["node", "server.js"]