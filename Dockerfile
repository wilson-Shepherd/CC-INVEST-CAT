FROM node:21-alpine AS build

WORKDIR /app

COPY client/package*.json ./client/
RUN cd client && npm install

COPY client ./client
RUN cd client && npm run build

COPY server/package*.json ./server/
RUN cd server && npm install

COPY server ./server

FROM node:21-alpine

WORKDIR /app

COPY --from=build /app/server /app

COPY --from=build /app/client/dist /app/client/dist

ENV STATIC_FILES_PATH=/app/client/dist

EXPOSE 3000

CMD ["node", "index.js"]
