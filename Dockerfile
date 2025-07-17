# Use Node.js official image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies and fix vulnerabilities
RUN npm install && npm audit fix --force

# Copy the rest of the project files
COPY . .

# Expose the port for the frontend (if applicable)
EXPOSE 3000

# Default command to start the application
CMD ["npm", "run", "dev"]