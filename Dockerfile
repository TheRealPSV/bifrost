FROM node:lts-alpine

WORKDIR /frontend
COPY frontend/ .
WORKDIR /backend
COPY backend/ .

WORKDIR /serve
COPY entrypoint.sh rebuild-frontend.sh watch-customization.mjs ./

ENV NODE_ENV=production

EXPOSE 3001
RUN chmod +x ./entrypoint.sh ./rebuild-frontend.sh ./watch-customization.mjs
ENTRYPOINT [ "/serve/entrypoint.sh" ]
