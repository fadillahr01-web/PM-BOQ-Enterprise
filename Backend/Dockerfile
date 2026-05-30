FROM node:18-alpine
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate client otomatis dalam mode WASM karena fitur driverAdapters aktif
RUN npx prisma generate --schema=./models/schema.prisma

EXPOSE 7860

CMD ["npm", "start"]