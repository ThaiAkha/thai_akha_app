import React from 'react';
import {
  Typography, Card, Icon, Badge
} from '../components/ui/index';
import { CinematicBackground } from '../components/layout/index';
import AuthForm from '../components/auth/AuthForm';

interface AuthPageProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, onAuthSuccess }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row overflow-hidden font-sans selection:bg-primary/30">
      <CinematicBackground
        isLoaded={true}
        imageUrl="https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg"
      />

      {/* --- LEFT COLUMN: NARRATIVE SIDE (Desktop Only) --- 
          Modifiche: items-end, text-right, padding ottimizzato per il centro
      */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-end p-12 lg:pr-16 relative overflow-hidden">

        {/* Sfumatura verso sinistra per staccare dal centro */}
        <div className="absolute inset-0 z-0" />

        <div className="relative z-10 space-y-10 animate-in slide-in-from-left duration-1000 ease-cinematic max-w-lg text-right">

          <div className="flex justify-end">
            <Badge variant="solid">
              Welcome to System 4.8
            </Badge>
          </div>

          <div className="space-y-4">
            <Typography variant="titleMain">
              Your <Typography variant="titleHighlight" color="action" as="span">Culinary Journey</Typography> Begins
            </Typography>
            <Typography variant="paragraphM">
              Step into the heritage of the Akha tribe. From the high misty mountains to our bustling kitchen in Chiang Mai.
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-4">
            {/* MEET CHERRY */}
            <div className="flex items-center gap-5 group flex-row-reverse justify-start">
              <div className="size-12 rounded-2xl bg-primary/10 backdrop-blur-md border border-primary/20 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Icon name="face" />
              </div>
              <div className="flex flex-col items-end">
                <Typography variant="h6" className="mb-0.5">Meet Cherry</Typography>
                <Typography variant="body">Your AI Cultural Guide ready 24/7.</Typography>
              </div>
            </div>

            {/* MASTER THE MENU */}
            <div className="flex items-center gap-5 group flex-row-reverse justify-start">
              <div className="size-12 rounded-2xl bg-action/10 backdrop-blur-md border border-action/20 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Icon name="restaurant_menu" />
              </div>
              <div className="flex flex-col items-end">
                <Typography variant="h6" className="mb-0.5">Master the Menu</Typography>
                <Typography variant="body">Tailor ingredients (Vegan, Halal, Meaty).</Typography>
              </div>
            </div>

            {/* AKHA WISDOM */}
            <div className="flex items-center gap-5 group flex-row-reverse justify-start">
              <div className="size-12 rounded-2xl bg-quiz/10 backdrop-blur-md border border-quiz/20 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Icon name="psychology" />
              </div>
              <div className="flex flex-col items-end">
                <Typography variant="h6" className="mb-0.5">Akha Wisdom</Typography>
                <Typography variant="body">Test knowledge & become a guardian.</Typography>
              </div>
            </div>

            {/* EARN REWARDS */}
            <div className="flex items-center gap-5 group flex-row-reverse justify-start">
              <div className="size-12 rounded-2xl bg-secondary/10 backdrop-blur-md border border-secondary/20 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Icon name="workspace_premium" />
              </div>
              <div className="flex flex-col items-end">
                <Typography variant="h6" className="mb-0.5">Earn Rewards</Typography>
                <Typography variant="body">Unlock certificates & secret recipes.</Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: ACTION SIDE (AuthForm) --- 
          Modifiche: items-start per avvicinarsi al centro (su desktop)
      */}
      <div className="flex-1 flex flex-col items-center md:items-start justify-center p-6 md:p-12 lg:pl-16 relative z-10">
        {/* Mobile Backdrop Overlay */}
        <div className="md:hidden absolute inset-0 bg-black/60 backdrop-blur-sm -z-10" />

        <div className="w-full max-w-[440px] animate-in slide-in-from-bottom-8 duration-1000 ease-cinematic">
          <Card variant="glass" padding="none" className="bg-surface-overlay/80 border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
            <AuthForm onSuccess={onAuthSuccess} onNavigate={onNavigate} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;