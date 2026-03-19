import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Trash2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@thaiakha/shared/lib/utils";
import { ProfileCard, ProfileRow } from "./components/ProfileUI";
import Button from "../ui/button/Button";
import { useTranslation } from "react-i18next";

/**
 * UserSecurityCard - Extreme DRY Refactoring.
 * Focus: Account protection, password management, and English translation.
 */
export default function UserSecurityCard() {
    const { t } = useTranslation("profile");
    const { changePassword, updateProfile, signOut, user } = useAuth();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Step for double confirmation: 0 = idle, 1 = first click, 2 = confirmed
    const [deactivateStep, setDeactivateStep] = useState(0);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password !== confirmPassword) {
            setMessage({ type: "error", text: t("security.errorMismatch") });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: "error", text: t("security.errorMinLength") });
            return;
        }

        setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await changePassword(password);
            setMessage({ type: "success", text: t("security.successUpdated") });
            setPassword("");
            setConfirmPassword("");
            setTimeout(() => setMessage({ type: "", text: "" }), 5000);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || t("security.errorFailed") });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await updateProfile(user.id, { is_active: false });
            await signOut();
        } catch (error) {
            console.error("Deactivation failed:", error);
            setDeactivateStep(0);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <ProfileCard>

                <form onSubmit={handlePasswordChange} className="space-y-8">
                    <div className="grid grid-cols-1 gap-6">
                        <ProfileRow
                            label={t("security.fieldNewPassword")}
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            isEditing={true}
                            placeholder="••••••••"
                        />

                        <ProfileRow
                            label={t("security.fieldConfirmPassword")}
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            isEditing={true}
                            placeholder="••••••••"
                        />
                    </div>

                    {message.text && (
                        <div className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border animate-in fade-in slide-in-from-top-1",
                            message.type === "success"
                                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400"
                        )}>
                            {message.type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            <span className="text-xs font-bold uppercase tracking-widest leading-none">{message.text}</span>
                        </div>
                    )}

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/10 hover:shadow-primary-500/25 transition-all active:scale-95 group",
                                isLoading && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? t("security.btnUpdating") : t("security.btnUpdate")}
                        </Button>
                    </div>
                </form>
            </ProfileCard>

            <div className="p-6 lg:p-8 rounded-3xl border border-red-100/30 dark:border-red-500/10 bg-red-50/10 dark:bg-red-500/[0.01] backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                        <Trash2 size={20} />
                    </div>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter text-red-600 dark:text-red-400">
                        {t("security.dangerZoneTitle")}
                    </h4>
                </div>

                <p className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-widest font-black mb-8 leading-relaxed">
                    {t("security.dangerZoneDesc")}
                </p>

                <div className="flex flex-col gap-4">
                    {deactivateStep === 0 ? (
                        <button
                            onClick={() => setDeactivateStep(1)}
                            className="w-full px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-red-500 border-2 border-red-500/10 bg-white/50 dark:bg-red-900/5 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-all active:scale-95"
                        >
                            {t("security.btnDeactivate")}
                        </button>
                    ) : (
                        <div className="flex flex-col gap-4 bg-white/80 dark:bg-red-950/20 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 animate-in zoom-in-95">
                            <div className="flex items-center gap-3 text-red-600 font-black text-[10px] uppercase tracking-widest">
                                <AlertTriangle className="w-5 h-5 animate-bounce" />
                                <span>{t("security.confirmRequired")}</span>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setDeactivateStep(0)}
                                    className="flex-1 py-3 rounded-xl text-[10px] font-black border-gray-200"
                                >
                                    {t("security.btnCancel", { defaultValue: "Cancel" })}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleDeactivate}
                                    disabled={isLoading}
                                    className="flex-1 py-3 rounded-xl text-[10px] font-black bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-500/20"
                                >
                                    {isLoading ? "..." : t("security.btnConfirm", { defaultValue: "Confirm" })}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
