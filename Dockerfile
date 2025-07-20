
# Usar una imagen base de Node.js
FROM node:18-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./
COPY bun.lockb ./

# Instalar bun globalmente y las dependencias
RUN npm install -g bun
RUN bun install

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN bun run build

# Etapa de producción
FROM nginx:alpine

# Copiar la aplicación construida al directorio de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx si es necesaria
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
