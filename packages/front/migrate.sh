#!/bin/bash

# 1. Creazione Gerarchia Cartelle
mkdir -p components/layout components/ui components/chat components/quiz components/menu components/dietary

# 2. Spostamento Componenti Layout
mv components/Header.tsx components/layout/
mv components/HeaderMenu.tsx components/layout/
mv components/HeaderQuiz.tsx components/layout/
mv components/Sidebar.tsx components/layout/

# 3. Spostamento Componenti UI & Feature
mv components/ui/Button.tsx components/ui/
mv components/ChatBox.tsx components/chat/
mv components/chat/*.tsx components/chat/ 2>/dev/null

mv components/MenuCard.tsx components/menu/
mv components/RecipeDetail.tsx components/menu/
mv components/DietaryInsightPanel.tsx components/dietary/

mv components/LevelQuiz.tsx components/quiz/
mv components/PlayQuiz.tsx components/quiz/
mv components/ResultQuiz.tsx components/quiz/
mv components/BonusQuiz.tsx components/quiz/
mv components/ButtonQuiz.tsx components/quiz/

# 4. Consolidamento Dati (Rimozione duplicati in lib/)
rm -rf lib/data.ts lib/quizData.ts lib/bonusQuiz.ts lib/buttonQuiz.ts lib/buttonChatt.ts

# 5. Creazione Barrel Files
echo "export { default as Button } from './Button';" > components/ui/index.ts
echo "export { default as ChatBox } from './ChatBox';" > components/chat/index.ts
echo "export * from './LevelQuiz';
export * from './PlayQuiz';
export * from './ResultQuiz';
export * from './BonusQuiz';
export * from './ButtonQuiz';" > components/quiz/index.ts
echo "export { default as MenuCard } from './MenuCard';
export { default as RecipeDetail } from './RecipeDetail';" > components/menu/index.ts

echo "Migrazione completata con successo kha!"
