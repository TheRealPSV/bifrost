FROM node:lts-alpine

WORKDIR /frontend
COPY frontend/ .
WORKDIR /backend
COPY backend/ .

WORKDIR /serve
COPY entrypoint.sh .

ENV NODE_ENV=production

EXPOSE 3001
RUN chmod +x ./entrypoint.sh
ENTRYPOINT [ "/serve/entrypoint.sh" ]
