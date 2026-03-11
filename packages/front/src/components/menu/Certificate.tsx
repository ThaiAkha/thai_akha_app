
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Icon } from '../ui/index';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';
import { cn } from '../../lib/utils';

export interface CertificateDish {
  name: string;
  image: string;
  variantLabel?: string;
}

interface CertificateProps {
  name: string;
  date: string;
  classType: string;
  dishes: CertificateDish[];
  dietLabel?: string;
  onClose: () => void;
}

export const Certificate: React.FC<CertificateProps> = ({ 
  name, 
  date, 
  classType, 
  dishes, 
  dietLabel = "REGULAR", 
  onClose 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const isSpecialDiet = dietLabel && dietLabel !== 'REGULAR';

  const content = (
    <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center overflow-y-auto print:bg-white print:static print:block print:overflow-visible p-4 md:p-8">
      
      {/* ACTIONS BAR */}
      <div className="fixed top-6 right-6 flex gap-4 print:hidden z-[1001]">
        <Button variant="action" icon="print" onClick={handlePrint} className="shadow-xl">Print Certificate</Button>
        <button 
          onClick={onClose}
          className="size-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <Icon name="close" />
        </button>
      </div>

      {/* A4 PAPER */}
      <div className="certificate-container relative w-[210mm] min-h-[297mm] bg-white text-[#1a1a1a] shadow-2xl flex flex-col justify-between overflow-hidden print:shadow-none print:m-0 print:border-none">
        
        <div className="absolute top-0 left-0 w-full pt-4 z-10 flex justify-center opacity-80">
             <AkhaPixelPattern variant="line" size={10} columns={40} className="w-full" />
        </div>
        <div className="absolute bottom-0 left-0 w-full pb-4 z-10 flex justify-center opacity-80 rotate-180">
             <AkhaPixelPattern variant="line" size={10} columns={40} className="w-full" />
        </div>

        <div className="absolute top-6 left-6 size-16 border-t-4 border-l-4 border-[#C0C0C0] z-20"></div>
        <div className="absolute top-6 right-6 size-16 border-t-4 border-r-4 border-[#C0C0C0] z-20"></div>
        <div className="absolute bottom-6 left-6 size-16 border-b-4 border-l-4 border-[#C0C0C0] z-20"></div>
        <div className="absolute bottom-6 right-6 size-16 border-b-4 border-r-4 border-[#C0C0C0] z-20"></div>

        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
             <img src="https://www.thaiakhakitchen.com/wp-content/uploads/2018/11/tak-logo-new.png" className="w-[500px] grayscale" alt="" />
        </div>

        <div className="relative z-30 flex-1 flex flex-col items-center pt-24 px-16">
            <img src="https://www.thaiakhakitchen.com/wp-content/uploads/2018/11/tak-logo-new.png" alt="Logo" className="h-24 mb-6" />
            
            <div className="text-center mb-10">
                <h1 className="text-6xl font-display font-black uppercase tracking-[0.15em] text-[#1a1a1a] leading-none mb-2">
                    Certificate
                </h1>
                <h2 className="text-lg font-display font-bold uppercase tracking-[0.4em] text-[#E31F33]">
                    Of Culinary Mastery
                </h2>
            </div>

            <div className="w-24 h-1 bg-[#E31F33] mb-10 rounded-full"></div>

            <div className="text-center w-full mb-10">
                <p className="text-xl italic text-gray-500 font-serif mb-4">This certifies that</p>
                <div className="relative inline-block px-12 py-2 border-b-2 border-gray-200">
                    <h3 className="text-5xl font-display font-black uppercase text-[#1a1a1a] tracking-tight whitespace-nowrap">
                        {name || 'Distinguished Guest'}
                    </h3>
                </div>
                <p className="text-lg text-gray-600 mt-8 max-w-xl mx-auto leading-relaxed">
                    Has successfully mastered the authentic techniques of the <strong>Akha Heritage</strong> during the <strong className="text-[#E31F33] uppercase">{classType}</strong>.
                </p>
            </div>

            <div className="w-full bg-gray-50 border border-gray-200 rounded-3xl p-8 mb-auto print:bg-white print:border-gray-300">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Mastered Menu</span>
                    {isSpecialDiet && (
                        <span className="bg-[#98C93C] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider print:text-black print:border print:border-black">
                            {dietLabel} Edition
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {dishes.map((dish, i) => (
                        <div key={i} className="flex flex-col items-center text-center">
                            <div className="size-24 rounded-full overflow-hidden border-2 border-[#E31F33] mb-3 shadow-md bg-white">
                                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                            </div>
                            <p className="font-display font-bold text-sm uppercase text-[#1a1a1a]">{dish.name}</p>
                            {dish.variantLabel && (
                                <p className="text-[10px] text-gray-500 italic mt-0.5">{dish.variantLabel}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="relative z-30 pb-16 px-20 flex justify-between items-end">
            <div className="text-center">
                <p className="text-xl font-display font-bold text-gray-800 mb-2">{date}</p>
                <div className="w-40 h-px bg-gray-300 mx-auto"></div>
                <p className="text-[10px] uppercase font-black text-gray-400 mt-2 tracking-widest">Date Completed</p>
            </div>

            <div className="text-center">
                <div className="h-8 flex items-end justify-center">
                     <span className="font-display font-black text-xl text-gray-300 uppercase tracking-widest opacity-50">Akha Family</span>
                </div>
                <div className="w-48 h-px bg-gray-300 mx-auto"></div>
                <p className="text-[10px] uppercase font-black text-gray-400 mt-2 tracking-widest">Master Chef</p>
            </div>
        </div>

        <style>{`
          @media print {
            @page { size: A4 portrait; margin: 0; }
            body * { visibility: hidden !important; }
            .certificate-container, .certificate-container * { visibility: visible !important; }
            .certificate-container {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </div>
    </div>
  );

  return mounted ? createPortal(content, document.body) : null;
};
