FROM node:16.13.0-alpine3.12

WORKDIR /app

COPY . .

RUN npm install
CMD ["npm", "run", "start", "demo-frontend2"]
