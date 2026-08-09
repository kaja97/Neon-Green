FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Command is overridden in docker-compose.yml
CMD ["npm", "run", "dev"]
