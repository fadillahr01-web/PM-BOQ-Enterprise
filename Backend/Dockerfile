FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate --schema=./models/schema.prisma

EXPOSE 7860

CMD ["npm", "start"]