FROM node:20-bookworm

RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip openssl curl unzip \
  && pip3 install --break-system-packages -U yt-dlp \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY index.ts pipeline.ts ytdlp.ts ./
COPY prisma ./prisma
RUN npx prisma generate

ENV PORT=8080
EXPOSE 8080
CMD ["npx", "tsx", "index.ts"]
