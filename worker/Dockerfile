FROM node:20-bookworm

RUN apt-get update && apt-get install -y ffmpeg openssl curl unzip \
  && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux \
     -o /usr/local/bin/yt-dlp \
  && chmod a+rx /usr/local/bin/yt-dlp \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY index.ts pipeline.ts ytdlp.ts stream-fallback.ts cobalt-download.ts download-youtube.ts download-direct.ts ./
COPY prisma ./prisma
RUN npx prisma generate

ENV PORT=8080
EXPOSE 8080
CMD ["npx", "tsx", "index.ts"]
