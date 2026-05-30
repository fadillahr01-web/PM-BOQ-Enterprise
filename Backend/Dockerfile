FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate client (akan menghasilkan format WASM karena previewFeatures driverAdapters)
RUN npx prisma generate --schema=./models/schema.prisma

EXPOSE 7860

CMD ["npm", "start"]