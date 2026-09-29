# Produktions-Image (Node-Server aus `vite build`, Nitro-Preset node-server)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
# VITE_* werden zur Build-Zeit eingebettet
ARG VITE_SITE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SITE_URL=$VITE_SITE_URL VITE_SUPABASE_URL=$VITE_SUPABASE_URL VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build /app/.output ./.output
EXPOSE 3000
# Laufzeit-Variablen (SUPABASE_*, SMTP_*, …) per Umgebung setzen, siehe .env.example
CMD ["node", ".output/server/index.mjs"]
