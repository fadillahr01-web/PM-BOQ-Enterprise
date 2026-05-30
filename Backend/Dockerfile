# Menggunakan base biner yang menyertakan kompatibilitas musl/glibc secara otomatis
FROM node:18-alpine AS builder

# Paksa instalasi pustaka SSL & biner Alpine secara absolut
RUN apk update && apk add --no-cache openssl1.1-compat gcompat libc6-compat

WORKDIR /app

COPY package*.json ./

# Pasang dependencies tanpa membiarkan npm menggunakan cache biner lokal
RUN npm ci --no-audit --prefer-offline

COPY . .

# Buat ulang engine biner Prisma dari lingkungan Linux yang bersih
RUN npx prisma generate --schema=./models/schema.prisma

# ==================== STAGE RUNNER (Pembersih Cache) ====================
FROM node:18-alpine

RUN apk update && apk add --no-cache openssl1.1-compat gcompat libc6-compat

WORKDIR /app

# Salin hasil rakitan murni dari stage builder tanpa menyertakan ampas cache
COPY --from=builder /app ./

EXPOSE 7860

ENV NODE_ENV=production

CMD ["npm", "start"]