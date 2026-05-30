FROM node:18-alpine

WORKDIR /app

# Mengambil package json dari folder Backend
COPY Backend/package*.json ./
RUN npm install

# Mengambil seluruh isi folder Backend
COPY Backend/ .

# Jalankan prisma generate mengarah ke skema di dalam folder models
RUN npx prisma generate --schema=./models/schema.prisma

EXPOSE 7860

CMD ["npm", "start"]