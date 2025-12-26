FROM node:20-alpine

WORKDIR /app

# To copy requisite files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose Vite's port
EXPOSE 5173

# To launch Vite with --host option
# It's fundamental to see the site from Windows
CMD ["npm", "run", "dev", "--", "--host"]