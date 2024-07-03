# Use the official Node.js image.
FROM node:16

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Build the application.
RUN npm run build

# Run the web service on container startup.
CMD [ "npm", "run", "start:prod" ]

# Inform Docker that the container listens on the specified port at runtime.
EXPOSE 3000
