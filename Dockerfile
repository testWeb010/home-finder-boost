# Use Node.js as the base image
FROM node:18.20.4

# Set environment variables to prevent treating warnings as errors
ENV CI=false

# Set working directory
WORKDIR /app

# Copy all project files into the container
COPY . .

# Install dependencies and build the client
WORKDIR /app/client

# Remove existing node_modules and package-lock.json
RUN rm -rf node_modules package-lock.json

# Clean npm cache
RUN npm cache clean --force

# Install client dependencies with specific flags
RUN npm install --platform=linux --arch=x64 --no-optional --legacy-peer-deps

# Install specific rollup dependency
RUN npm install @rollup/rollup-linux-x64-gnu

# Build the client app with warnings ignored
RUN CI=false npm run build

# Remove any existing dist folder in the server directory
RUN rm -rf /app/server/dist

# Move the client build to the server directory
RUN mv ./dist /app/server/dist

# Remove the client directory as it is no longer needed
RUN rm -rf /app/client

# Install dependencies for the server
WORKDIR /app/server
RUN npm install --legacy-peer-deps

# Expose the port for the server
EXPOSE 3001

# Set the default command to start the server
CMD ["npm", "start"]