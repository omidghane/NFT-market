# ## develop

# # Use Node.js official image
# FROM node:22

# # Set the working directory inside the container
# WORKDIR /app

# # Copy package.json and package-lock.json to the container
# COPY package.json package-lock.json ./

# # Install dependencies and fix vulnerabilities
# RUN npm install

# # Copy the rest of the project files
# COPY . .

# # Expose the port for the frontend (if applicable)
# EXPOSE 3000

# # Default command to start the application
# CMD ["npm", "run", "dev"]


## production

# Use Node.js official image
FROM node:22 AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the Next.js app
RUN npm run build

# ---- Production image ----
FROM node:22 AS runner
WORKDIR /app

# Copy only the build output and node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Run Next.js in production mode
CMD ["npm", "run", "start"]
