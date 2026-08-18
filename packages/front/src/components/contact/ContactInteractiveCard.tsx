import { useState } from 'react';
import { Typography, Icon, Badge } from '../ui';
import { HeaderSection } from '../layout';

export default function ContactInteractiveCard() {
  const [activeTab, setActiveTab] = useState<'chat' | 'form'>('chat');

  return (
    <section className="flex flex-col [gap:var(--space-fluid-m)] [margin-bottom:var(--space-fluid-l)]">
      <HeaderSection
        variant="section"
        align="left"
        title="How can we"
        highlight="Help You?"
      />
      
      {/* Tabs */}
      <div className="flex bg-surface p-1 rounded-xl border border-border w-fit">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors duration-300 font-semibold text-sm ${
            activeTab === 'chat' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-title hover:bg-surface-hover'
          }`}
        >
          <Icon name="support_agent" size="sm" className={activeTab === 'chat' ? 'text-white' : 'text-primary'} />
          Ask Cherry (Instant)
        </button>
        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors duration-300 font-semibold text-sm ${
            activeTab === 'form' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-title hover:bg-surface-hover'
          }`}
        >
          <Icon name="mail" size="sm" className={activeTab === 'form' ? 'text-white' : 'text-primary'} />
          Send Email Form
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-surface border border-border rounded-2xl p-6 min-h-[400px]">
        {activeTab === 'chat' ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <Icon name="auto_awesome" className="text-primary text-3xl" />
            </div>
            <Typography variant="h4" color="title">Cherry Chat Flow</Typography>
            <Typography variant="paragraphM" color="sub" className="text-center max-w-md">
              Here we will implement the zero-latency cascading chat flow reading from our Ragnatela static nodes.
            </Typography>
            <Badge variant="mineral" color="action" size="md" className="mt-2">
              Coming in next step
            </Badge>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center border border-border">
              <Icon name="edit_document" className="text-muted text-3xl" />
            </div>
            <Typography variant="h4" color="title">Contact Form</Typography>
            <Typography variant="paragraphM" color="sub" className="text-center max-w-md">
              Here we will implement the standard form for Agencies, Bloggers, and general inquiries.
            </Typography>
          </div>
        )}
      </div>

    </section>
  );
}
