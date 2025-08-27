# Dockerfile para testes Node.js
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
VOLUME ["/app/testdata"]
CMD ["npm", "test"]
