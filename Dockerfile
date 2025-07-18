# Use Node.js official image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies and fix vulnerabilities
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose the port for the frontend (if applicable)
EXPOSE 3000

# Default command to start the application
CMD ["npm", "run", "dev"]