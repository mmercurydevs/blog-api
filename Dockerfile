FROM node:24-slim
WORKDIR /app

# Copy the manifest first so Docker can cache the install layer.
# If only application code changes, npm install is skipped on the next build.
COPY package.json ./
RUN npm ci --omit=dev

COPY . .
EXPOSE 3000
CMD ["node", "index.js"]