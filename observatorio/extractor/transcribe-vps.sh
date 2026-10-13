#!/bin/bash
# Transcribe los .mp4 de ~/tmp-tiktok en el VPS via Whisper API (la key vive en el .env de Perseo).
# Uso: scp <videos h264> y este script a perseo-vps:~/tmp-tiktok/ && ssh perseo-vps "bash -lc 'bash ~/tmp-tiktok/transcribe-vps.sh'"
# Al terminar, borrar el directorio: ssh perseo-vps "rm -rf ~/tmp-tiktok"
# NOTA: usar formatos h264 de TikTok (yt-dlp -F -> h264_540p_*). Los h265/bytevc1 fallan en Whisper.
KEY=$(grep '^OPENAI_API_KEY=' /home/perseo/Perseo/.env | cut -d= -f2- | tr -d '"' | tr -d '\r')
cd /home/perseo/tmp-tiktok || exit 1
for f in *.mp4; do
  echo "===== $f ====="
  curl -s https://api.openai.com/v1/audio/transcriptions \
    -H "Authorization: Bearer $KEY" \
    -F model=whisper-1 -F response_format=text -F "file=@$f"
  echo
done
