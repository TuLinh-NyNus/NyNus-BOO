# Frontend Dockerfile - Development Mode
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set NODE_ENV to development to ensure devDependencies are installed
ENV NODE_ENV=development

# Copy package files
COPY apps/frontend/package.json ./

# Copy source code (excluding node_modules via .dockerignore)
COPY apps/frontend .

# Install ALL dependencies using npm with legacy peer deps
RUN npm install --legacy-peer-deps

# Expose port
EXPOSE 3000

# Start the application in development mode using npm
CMD ["npm", "run", "dev"]
