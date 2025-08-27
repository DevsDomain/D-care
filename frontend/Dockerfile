# Dockerfile para React
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:20 AS serve
WORKDIR /app
COPY --from=build /app/build ./build
RUN npm install -g serve
EXPOSE 3030
CMD ["serve", "-s", "build", "-l", "3030"]
