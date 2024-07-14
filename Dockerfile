FROM node:21-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server ./
EXPOSE 3000
CMD ["npm", "start"]