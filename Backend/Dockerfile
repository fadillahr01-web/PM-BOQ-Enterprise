FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Salin semua kode backend
COPY . .

# Generate Prisma client dari schema utama
RUN npx prisma generate --schema=./models/schema.prisma

EXPOSE 7860
ENV PORT=7860

CMD ["node", "server.js"]