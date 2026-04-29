# Stage 1: Build & Development
FROM node:20-alpine

# El WORKDIR debe ser /app para que coincida con el volumen del compose
WORKDIR /app

# Copiamos solo los archivos de dependencias primero (mejor uso de caché)
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de Angular
EXPOSE 4200

CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--proxy-config", "proxy.conf.json", "--poll", "1000"]