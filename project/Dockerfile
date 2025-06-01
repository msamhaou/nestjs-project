FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install



# Copy the rest of the application files
COPY . .

RUN npx prisma generate

# Expose the application port
EXPOSE 3000

# Command to run the application in dev mode
CMD ["npm", "run", "start:dev"]