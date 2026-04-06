# Run Locally:

lsof -ti :3000,3001 | xargs kill -9
pnpm install
pnpm run dev

# Deploy Firebase:
pnpm run build
pnpm dlx firebase-tools deploy --only hosting --project default

# 1. Backup completo (tutto: struttura + dati + funzioni + trigger)
supabase db dump > supabase/backups/full_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Solo dati (INSERT - NO struttura)
supabase db dump --data-only > supabase/backups/data_only.sql

# Per Terminale Mac Os - Ridurre da wav a mp3 audio file
cd AudioPlayer-Akha
for f in *.wav; do 
  ffmpeg -i "$f" -ar 22050 -ac 1 -b:a 64k "${f%.wav}.mp3"
done

# upload file NotebookLM - 1 File

nlm source add "6c156743-1952-4568-b9b1-9bb7d4ac0fd5" --file /Users/svevomondino/Desktop/thaiakha-cherry-2026/docs/ARCHITECTURE.md

# upload file NotebookLM - 2 File

echo "📄 Aggiungo File" && \
nlm source add "6c156743-1952-4568-b9b1-9bb7d4ac0fd5" --file /Users/svevomondino/Desktop/thaiakha-cherry-2026/docs/ARCHITECTURE.md && \
nlm source add "6c156743-1952-4568-b9b1-9bb7d4ac0fd5" --file /Users/svevomondino/Desktop/thaiakha-cherry-2026/docs/ZZ-MCP-Server-OK.md && \
echo "✅ File aggiunti"


nlm source add "6c156743-1952-4568-b9b1-9bb7d4ac0fd5" --file /Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/prompts/cherryPrompt.md

echo "📄 Aggiungo File" && \
nlm source add "6c156743-1952-4568-b9b1-9bb7d4ac0fd5" --file /Users/svevomondino/Desktop/thaiakha-cherry-2026/docs/88-Admin-TH-EN.md && \
nlm source add "6c156743-1952-4568-b9b1-9bb7d4ac0fd5" --file /Users/svevomondino/Desktop/thaiakha-cherry-2026/docs/ZZ-Deploy-BackupDB.md && \
echo "✅ File aggiunti"
