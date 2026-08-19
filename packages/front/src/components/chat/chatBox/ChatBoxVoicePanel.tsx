import React from 'react';
import { Typography } from '../../ui/Typography';

interface ChatBoxVoicePanelProps {
  isVoiceActive: boolean;
  isConnecting: boolean;
  inputTranscript: string;
  outputTranscript: string;
}

export const ChatBoxVoicePanel: React.FC<ChatBoxVoicePanelProps> = ({ isVoiceActive, isConnecting, inputTranscript, outputTranscript }) => (
  <>
  {/* Live Transcription (voice only) */}
  {isVoiceActive && (inputTranscript || outputTranscript) && (
    <div className="mt-auto space-y-4 animate-in fade-in duration-500 pb-4">
      {inputTranscript && (
        <div className="flex justify-end opacity-60">
          <div className="bg-surface-2 p-3 rounded-2xl border border-border">
            <Typography variant="caption" color="muted">
              "{inputTranscript}..."
            </Typography>
          </div>
        </div>
      )}
      {outputTranscript && (
        <div className="flex justify-start">
          <div className="bg-cherry-ai-teal/15 p-4 rounded-2xl border border-cherry-ai-teal/30">
            <Typography variant="body" className="font-medium text-white">
              Cherry: {outputTranscript}<span className="animate-pulse ml-0.5 opacity-70">▌</span>
            </Typography>
          </div>
        </div>
      )}
    </div>
  )}

  {/* Connecting dots (voice only — text chat dots live inside the bubble) */}
  {isConnecting && (
    <div className="flex gap-1.5 py-2 px-4 rounded-full bg-white/5 w-fit">
      <div className="size-1.5 bg-cherry-ai rounded-full animate-bounce [animation-delay:0ms]" />
      <div className="size-1.5 bg-cherry-ai rounded-full animate-bounce [animation-delay:150ms]" />
      <div className="size-1.5 bg-cherry-ai rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  )}
  </>
);

export default ChatBoxVoicePanel;
