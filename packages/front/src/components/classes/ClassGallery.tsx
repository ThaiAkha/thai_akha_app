import React, { useState } from 'react';
import { GalleryModal, GalleryItem, Photo } from '../modal';

interface ClassGalleryProps {
  items: GalleryItem[];
}

/**
 * Photo grid + fullscreen GalleryModal for the class detail pages.
 * Owns its own modal state so Morning/Evening no longer duplicate it.
 * Renders nothing until items are loaded (preserves previous behavior).
 */
const ClassGallery: React.FC<ClassGalleryProps> = ({ items }) => {
  const [modal, setModal] = useState({ isOpen: false, startIndex: 0 });

  if (items.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 [gap:var(--space-fluid-m)]">
        {items.map((item, idx) => (
          <Photo
            key={item.asset_id}
            item={item}
            variant="video"
            onClick={() => setModal({ isOpen: true, startIndex: idx })}
          />
        ))}
      </div>
      <GalleryModal
        isOpen={modal.isOpen}
        onClose={() => setModal(m => ({ ...m, isOpen: false }))}
        items={items}
        startIndex={modal.startIndex}
      />
    </>
  );
};

export default ClassGallery;
