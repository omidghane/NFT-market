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

# ---- Builder ----
FROM node:22 AS builder
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install ALL deps including devDependencies
RUN npm install --production=false

# Copy project files
COPY . .

# Build the Next.js app
RUN npm run build

# ---- Production runner ----
FROM node:22 AS runner

WORKDIR /app

# Copy only needed files
COPY package.json package-lock.json ./

# Install only production deps
RUN npm install --omit=dev

# Copy build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Start Next.js
CMD ["npm", "run", "start"]