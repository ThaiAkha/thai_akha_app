
import React from 'react';
import { AdminPageLayout } from '../components/layout/AdminPageLayout'; // [Source 196]
import { AdminCalendarManager } from '../components/admin/AdminCalendarManager'; // [Source 89]

interface AdminCalendarProps {
  onNavigate: (page: string) => void;
}

const AdminCalendar: React.FC<AdminCalendarProps> = ({ onNavigate }) => {
  return (
    // Fix: Removed non-existent 'title' and 'subtitle' props kha
    <AdminPageLayout loading={false}>
      {/* 
         Impostiamo un'altezza fissa calcolata per garantire che il calendario 
         occupi tutto lo spazio verticale disponibile senza scroll di pagina doppio.
      */}
      <div className="h-[calc(100vh-140px)] w-full pb-6">
        <AdminCalendarManager />
      </div>
    </AdminPageLayout>
  );
};

export default AdminCalendar;
