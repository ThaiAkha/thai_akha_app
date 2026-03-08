import { Trash2 } from 'lucide-react';
import Button from './button/Button';

interface DeleteZoneProps {
    label: string;
    onDelete: () => void;
}

const DeleteZone = ({ label, onDelete }: DeleteZoneProps) => {
    return (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 shrink-0">
            <div className="flex flex-col gap-2 max-w-sm mx-auto">
                <Button
                    type="button"
                    variant="olive"
                    size="sm"
                    className="w-full justify-center h-11 text-[11px] font-black border-none uppercase tracking-widest shadow-lg shadow-red-500/20"
                    startIcon={<Trash2 className="w-5 h-5 text-white" />}
                    onClick={onDelete}
                >
                    {label}
                </Button>
            </div>
        </div>
    );
};

export default DeleteZone;
