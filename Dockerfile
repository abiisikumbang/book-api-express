# Gunakan Node.js versi LTS
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua source code
COPY . .

# Prisma generate (supaya client siap)
RUN npx prisma generate

# Expose port (sesuai app.js listen)
EXPOSE 3000

# Jalankan server
CMD ["npm", "start"]
