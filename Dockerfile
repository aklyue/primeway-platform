# Stage 1: Build the React app
FROM node:18 AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the app using a static server
FROM nginx:1.23-alpine

# Copy the built app from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration file (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]