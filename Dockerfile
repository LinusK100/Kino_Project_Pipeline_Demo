# Kino-UI — minimales, reproduzierbares Image.
FROM node:20-alpine

WORKDIR /app

# Erst nur die Manifeste kopieren -> Docker-Layer-Cache nutzt npm ci optimal.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Anwendungscode.
COPY src ./src
COPY public ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Healthcheck: Container gilt erst als "healthy", wenn die API antwortet.
HEALTHCHECK --interval=15s --timeout=3s --retries=5 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "src/server.js"]
