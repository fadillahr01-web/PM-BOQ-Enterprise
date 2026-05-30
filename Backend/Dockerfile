FROM node:18-slim

# Install OpenSSL yang dibutuhkan oleh Prisma Binary secara otomatis
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate --schema=./models/schema.prisma

EXPOSE 7860

CMD ["npm", "start"]