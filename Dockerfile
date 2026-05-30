FROM node:18-alpine

WORKDIR /app

# Mengambil package.json dari folder Backend
COPY Backend/package*.json ./
RUN npm install

# Menyalin seluruh isi folder Backend ke dalam container
COPY Backend/ .

EXPOSE 7860

# Kita pindahkan npx prisma generate ke dalam perintah CMD sebelum npm start
CMD npx prisma generate --schema=./models/schema.prisma && npm start