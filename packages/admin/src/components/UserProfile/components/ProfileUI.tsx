import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@thaiakha/shared/lib/utils";
import Button from "../../ui/button/Button";
import InputField from "../../form/input/InputField";
import { Heading } from '../../typography';
import { LucideIcon } from "lucide-react";

/**
 * ProfileCard - Shared Glassmorphism container for Profile tabs.
 */
export const ProfileCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        "p-6 lg:p-8 rounded-3xl border border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl shadow-sm h-full flex flex-col transition-all duration-300 hover:shadow-md",
        className
    )}>
        {children}
    </div>
);

/**
 * ProfileHeader - Standardized title with icon.
 */
export const ProfileHeader = ({ title, icon: Icon }: { title: string; icon: LucideIcon }) => (
    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-5 mb-8">
        <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
            <Icon size={20} />
        </div>
        <Heading level="h4" className="italic tracking-tighter text-title uppercase">
            {title}
        </Heading>
    </div>
);

/**
 * ProfileRow - A single data row with standardized input wrapper to prevent jumps.
 */
export const ProfileRow = ({
    label,
    value,
    isEditing,
    onChange,
    name,
    type = "text",
    placeholder,
    className
}: {
    label: string;
    value?: string | number | null;
    isEditing?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    type?: string;
    placeholder?: string;
    className?: string;
}) => {
    const { t } = useTranslation('profile');
    return (
        <div className={cn("group/row w-full", className)}>
            <InputField
                label={label}
                name={name}
                type={type}
                value={value || ""}
                onChange={onChange}
                disabled={!isEditing}
                placeholder={placeholder || (value ? "" : t('personal.notSpecified'))}
            />
        </div>
    );
};

/**
 * ProfileFooter - Standardized action buttons area.
 */
export const ProfileFooter = ({
    isEditing,
    isLoading,
    onSave,
    onCancel,
    onEdit,
    editLabel = "Edit Details",
    saveLabel = "Save Changes"
}: {
    isEditing: boolean;
    isLoading: boolean;
    onSave: () => void;
    onCancel: () => void;
    onEdit: () => void;
    editLabel?: string;
    saveLabel?: string;
}) => {
    const { t } = useTranslation(['profile', 'common']);
    return (
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/5">
            <div className="flex flex-col sm:flex-row gap-3">
                {isEditing ? (
                    <>
                        <Button
                            onClick={onCancel}
                            variant="outline"
                            className="flex-1 sm:flex-none px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                        >
                            {t('common:buttons.cancel')}
                        </Button>
                        <Button
                            onClick={onSave}
                            disabled={isLoading}
                            className={cn(
                                "flex-1 sm:flex-none px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20 transition-all active:scale-95",
                                isLoading && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? t('common:feedback.saving') : saveLabel}
                        </Button>
                    </>
                ) : (
                    <Button
                        onClick={onEdit}
                        variant="outline"
                        className="w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm hover:shadow-md hover:bg-primary-500 hover:text-white hover:border-primary-500 dark:hover:bg-primary-500 transition-all active:scale-95"
                    >
                        {editLabel}
                    </Button>
                )}
            </div>
        </div>
    );
};
