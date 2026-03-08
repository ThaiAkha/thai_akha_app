
import React, { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { 
  Typography, 
  Button, 
  Card, 
  Input, 
  Textarea, 
  Toggle, 
  Slider, 
  Chip, 
  Tabs, 
  Badge, 
  Divider, 
  Icon, 
  Tooltip, 
  Pagination 
} from '../components/ui/index';
import { cn } from '../lib/utils';

const DisplayPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  
  // --- STATE PER INTERATTIVITÀ ---
  const [inputValue, setInputValue] = useState('');
  const [toggleState, setToggleState] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [activeTabMineral, setActiveTabMineral] = useState('tab1');
  const [activeTabPills, setActiveTabPills] = useState('tab1');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeChip, setActiveChip] = useState<string>('chip1');

  // Dati Mock
  const TAB_ITEMS = [
    { value: 'tab1', label: 'Overview', icon: 'dashboard' },
    { value: 'tab2', label: 'Dettagli', icon: 'list' },
    { value: 'tab3', label: 'Settings', icon: 'settings', badge: 2 }
  ];

  return (
    <PageLayout slug="display" loading={false} hideDefaultHeader={false}>
      <div className="w-full max-w-5xl mx-auto px-6 py-12 space-y-16 pb-32">

        {/* HEADER INTRO */}
        <div className="text-center space-y-4">
          <Typography variant="display2" className="text-primary">System 4.8 UI Kit</Typography>
          <Typography variant="paragraphM" className="text-desc max-w-2xl mx-auto">
            Inventario completo dei componenti atomici per l'applicazione Thai Akha Kitchen.
            Ogni componente è reattivo al tema Dark/Light.
          </Typography>
        </div>

        <Divider variant="gradient" label="1. INPUT & FORM CONTROLS" />

        {/* 1. SEZIONE INPUT */}
        <section className="space-y-8">
          <div>
            <Typography variant="h3" className="mb-2">Input Fields</Typography>
            <p className="text-desc mb-4">Campi di testo con varianti semantiche e stati.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Standard Mineral" 
                placeholder="Digita qualcosa..." 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
              />
              <Input 
                label="Con Icona" 
                leftIcon="search" 
                placeholder="Cerca..." 
              />
              <Input 
                label="Stato Errore" 
                error={true} 
                placeholder="Input non valido" 
                defaultValue="Valore errato" 
              />
              <Input 
                label="Stato Successo" 
                success={true} 
                rightIcon="check_circle" 
                defaultValue="Validato correttamente" 
              />
            </div>
          </div>

          <div>
            <Typography variant="h3" className="mb-2">Text Area</Typography>
            <p className="text-desc mb-4">Area di testo multiriga con conteggio caratteri.</p>
            <Textarea 
              label="Note o Descrizione" 
              placeholder="Scrivi una descrizione dettagliata qui..." 
              maxLength={200}
              showCount={true}
            />
          </div>
        </section>

        <Divider variant="gradient" label="2. SELEZIONE & INTERRUTTORI" />

        {/* 2. SELEZIONE */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Toggle */}
            <div className="space-y-4">
              <Typography variant="h3">Toggle Switch</Typography>
              <div className="flex flex-col gap-4 bg-surface p-6 rounded-2xl border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-title font-bold">Impostazione Attiva</span>
                  <Toggle checked={toggleState} onChange={setToggleState} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-desc">Impostazione Disabilitata</span>
                  {/* Fix: Added missing onChange handler kha */}
                  <Toggle checked={true} disabled={true} onChange={() => {}} />
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-4">
              <Typography variant="h3">Slider (Range)</Typography>
              <div className="bg-surface p-6 rounded-2xl border border-border space-y-6">
                <Slider 
                  value={sliderValue} 
                  onChange={setSliderValue} 
                  min={0} 
                  max={100} 
                  label={`Intensità: ${sliderValue}%`} 
                  showValue 
                />
                <Slider value={25} onChange={() => {}} label="Statico (25%)" />
              </div>
            </div>
          </div>

          {/* Chips */}
          <div className="space-y-4">
            <Typography variant="h3">Chips Interattive</Typography>
            <div className="flex flex-wrap gap-3">
              <Chip label="Tutto" active={activeChip === 'chip1'} onClick={() => setActiveChip('chip1')} />
              <Chip label="Vegano" active={activeChip === 'chip2'} onClick={() => setActiveChip('chip2')} />
              <Chip label="Senza Glutine" active={activeChip === 'chip3'} onClick={() => setActiveChip('chip3')} />
              <Chip label="Piccante" active={false} />
            </div>
          </div>
        </section>

        <Divider variant="gradient" label="3. PULSANTI & NAVIGAZIONE" />

        {/* 3. PULSANTI */}
        <section className="space-y-8">
          <div>
            <Typography variant="h3" className="mb-4">Buttons Variants</Typography>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary</Button>
              <Button variant="brand" icon="star">Brand</Button>
              <Button variant="action" icon="check">Action</Button>
              <Button variant="mineral">Mineral</Button>
            </div>
          </div>

          <div>
            <Typography variant="h3" className="mb-4">Button States & Sizes</Typography>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm" variant="mineral">Small</Button>
              <Button size="md" variant="brand">Medium</Button>
              <Button size="lg" variant="action">Large</Button>
              <Button size="xl" variant="primary" icon="rocket_launch">Extra Large</Button>
              <Button variant="brand" isLoading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </div>
        </section>

        <Divider variant="gradient" label="4. NAVIGAZIONE COMPLESSA" />

        {/* 4. TABS & PAGINATION */}
        <section className="space-y-8">
          <div>
            <Typography variant="h3" className="mb-4">Tabs (Mineral Style)</Typography>
            <Tabs 
              items={TAB_ITEMS} 
              value={activeTabMineral} 
              onChange={setActiveTabMineral} 
              variant="mineral" 
            />
          </div>

          <div>
            <Typography variant="h3" className="mb-4">Tabs (Pills Style)</Typography>
            <Tabs 
              items={TAB_ITEMS} 
              value={activeTabPills} 
              onChange={setActiveTabPills} 
              variant="pills" 
            />
          </div>

          <div>
            <Typography variant="h3" className="mb-4">Pagination</Typography>
            <div className="flex justify-center bg-surface p-4 rounded-3xl border border-border">
              <Pagination 
                currentPage={currentPage} 
                totalPages={10} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </div>
        </section>

        <Divider variant="gradient" label="5. FEEDBACK & DISPLAY" />

        {/* 5. FEEDBACK UI */}
        <section className="space-y-8">
          
          {/* Badges */}
          <div>
            <Typography variant="h3" className="mb-4">Badges</Typography>
            <div className="flex flex-wrap gap-4">
              <Badge variant="solid" icon="verified">Solid Action</Badge>
              <Badge variant="brand" icon="local_fire_department" pulse>Brand Pulse</Badge>
              <Badge variant="mineral" icon="diamond">Mineral</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          {/* Tooltips & Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Typography variant="h3" className="mb-4">Tooltips</Typography>
              <div className="flex gap-4 items-center">
                <Tooltip content="Informazione utile qui" position="top">
                  <Button variant="mineral" icon="info">Hover Me (Top)</Button>
                </Tooltip>
                <Tooltip content="Dettagli aggiuntivi" position="bottom">
                  <Button variant="mineral" icon="help">Hover Me (Bottom)</Button>
                </Tooltip>
              </div>
            </div>

            <div>
              <Typography variant="h3" className="mb-4">Icons (Material Symbols)</Typography>
              <div className="flex gap-4 p-4 bg-surface rounded-2xl border border-border text-title">
                <Icon name="home" size="lg" />
                <Icon name="person" size="lg" className="text-primary" />
                <Icon name="settings" size="lg" className="text-action animate-spin-slow" />
                <Icon name="favorite" size="lg" className="text-red-500" />
                <Icon name="menu_book" size="lg" />
              </div>
            </div>
          </div>

          {/* Dividers */}
          <div>
            <Typography variant="h3" className="mb-4">Dividers Styles</Typography>
            <div className="space-y-6 bg-surface p-6 rounded-2xl border border-border">
               <p className="text-desc">Default:</p>
               <Divider />
               <p className="text-desc">Brand:</p>
               <Divider variant="brand" />
               <p className="text-desc">Con Label:</p>
               <Divider label="Section Title" labelPosition="center" />
               <p className="text-desc">Con Label Sinistra:</p>
               <Divider label="Start Here" labelPosition="left" variant="action" />
            </div>
          </div>

        </section>

      </div>
    </PageLayout>
  );
};

export default DisplayPage;
