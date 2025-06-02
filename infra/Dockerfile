FROM node:20

RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*
# Set the working directory inside the container
WORKDIR /usr/src/app

COPY ../project/package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install



# Copy the rest of the application files
COPY ../project .

EXPOSE 3000

# Command to run the application in dev mode
ENTRYPOINT ["sh", "./script.sh"]