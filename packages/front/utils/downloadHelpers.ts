import html2canvas from 'html2canvas';
import saveAs from 'file-saver';

export const generateDesktopImage = async (
  elementId: string, 
  fileName: string = 'Thai-Akha-Menu.png'
) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Sincronizzato con lo standard di 85rem (1360px @ 16px root) kha
  const DESKTOP_WIDTH = 1360;
  
  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 3, // Alta qualità per la stampa kha
      backgroundColor: null,
      logging: false,
      windowWidth: DESKTOP_WIDTH, // Forza il layout a 1360px durante la cattura
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.width = `${DESKTOP_WIDTH}px`;
          clonedEl.style.maxWidth = `${DESKTOP_WIDTH}px`;
          clonedEl.style.height = 'auto';
          clonedEl.style.borderRadius = '4rem';
          clonedEl.style.padding = '5rem';
          
          const grids = clonedEl.querySelectorAll('.grid');
          grids.forEach((grid: any) => {
            if (grid.classList.contains('lg:grid-cols-3')) {
              grid.style.display = 'grid';
              grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            }
            if (grid.classList.contains('lg:grid-cols-4')) {
              grid.style.display = 'grid';
              grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            }
          });
        }
      }
    });

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, fileName);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error generating high-res image:', error);
  }
};