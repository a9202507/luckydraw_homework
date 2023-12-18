# Use the official Nginx image as the base image
FROM nginx:alpine

# Copy the static content (index.html and raffle.js) to the Nginx web root directory
COPY index.html /usr/share/nginx/html/index.html
COPY raffle.js /usr/share/nginx/html/raffle.js

# Expose port 80 to the outside once the container has launched
EXPOSE 80

# Use the default Nginx start command
CMD ["nginx", "-g", "daemon off;"]