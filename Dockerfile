# Use Node.js 22 image (or another version as per your requirement)
FROM node:22

# Install cron
RUN apt-get update && apt-get install -y cron

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the crontab file into the container
COPY crontab /etc/cron.d/crontab

# Set ownership to root:root
RUN chown root:root /etc/cron.d/crontab

# Give the cron job file proper permissions
RUN chmod 0644 /etc/cron.d/crontab

# Apply the cron job to the container
RUN crontab /etc/cron.d/crontab

# Ensure cron logs are available
RUN touch /var/log/cron.log

# Run cron in the foreground (this keeps the container running)
CMD ["cron", "-f"]
