/**
 * Market Runner - lista in corso: toolbar totali+tab negozio (LINE/chiamata), righe da spuntare
 * con prezzo, footer salva/conferma, keypad. Estratto da MarketRunner.tsx (#16), DOM invariato.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/button/Button';
import Badge from '../../../components/ui/badge/Badge';
import { Modal } from '../../../components/ui/modal';
import NumericKeypad from '../../../components/common/NumericKeypad';
import PageContainer from '../../../components/layout/PageContainer';
import { Heading, SectionTitle } from '../../../components/typography';
import { cn } from '@thaiakha/shared/lib/utils';
import { ShoppingCart, Store, Phone, MessageCircle, CheckCircle2, Circle, Plus, Check, Save, Lock } from 'lucide-react';
import { getShopIcon, type ShoppingItem } from './types';
import type { MarketRunnerState } from './useMarketRunner';

export const RunShoppingView: React.FC<{ r: MarketRunnerState }> = ({ r }) => {
    const { t } = useTranslation('market');
    const { items, setItems, activeTab, setActiveTab, keypadOpen, setKeypadOpen, tempPrice, isSaving, isConfirming, locked, backToList, shopTabs, itemName, handleSendLine, handleCall, persistItems, toggleBought, openKeypad, handleKeypadPress, handleKeypadDelete, handleKeypadConfirm, handleSave, handleConfirm, filteredItems, liveTotal, activeContact } = r;
    return (
    <PageContainer className="h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex flex-col h-full relative bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">

            {/* ================= TOTALS & TABS TOOLBAR ================= */}
            <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 items-center">
                        <button
                            onClick={backToList}
                            className="shrink-0 inline-flex items-center gap-1 px-3 h-8 rounded-full text-xs font-bold uppercase text-sub border border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                            ← {t('buttons.lists', { defaultValue: 'Lists' })}
                        </button>
                        {shopTabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all border",
                                    activeTab === tab.value
                                        ? "bg-primary-600 text-white border-primary-600"
                                        : "bg-gray-50 dark:bg-gray-800 text-sub border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                )}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="text-right flex items-center gap-4 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 ml-auto">
                        <div className="text-xs font-black uppercase text-sub tracking-widest text-left">
                            {t('labels.liveTotal')}
                        </div>
                        <div className="text-2xl font-mono font-black text-primary-600 dark:text-primary-400 leading-none">
                            {liveTotal.toLocaleString()} <span className="text-xs font-sans text-sub font-normal">THB</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= SCROLLABLE CONTENT ================= */}
            <div className="flex-1 overflow-y-auto pb-32">
                {/* VENDOR CONTACT BANNER */}
                {activeTab !== 'all' && (
                    <div className="px-4 pt-4 animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-surface border border-gray-200 dark:border-gray-700 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20">
                                    {typeof activeContact === 'undefined' ? <Store className="w-5 h-5" /> : getShopIcon(activeTab)}
                                </div>
                                <div>
                                    <Heading level="h5" className="uppercase font-black leading-none mb-1 truncate max-w-[120px]">
                                        {activeTab}
                                    </Heading>
                                    <SectionTitle className="text-sub font-bold mb-0">{t('labels.vendorContact')}</SectionTitle>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {activeContact?.phone_number && (
                                    <button
                                        onClick={() => handleCall(activeContact.phone_number!)}
                                        className="size-10 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center text-sub transition-all border border-gray-200 dark:border-gray-600"
                                    >
                                        <Phone className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleSendLine(activeTab)}
                                    className="px-4 h-10 rounded-xl bg-[#06C755]/10 border border-[#06C755]/30 flex items-center gap-2 text-[#06C755] font-black uppercase text-xs tracking-widest transition-all active:scale-95 hover:bg-[#06C755]/20"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {t('buttons.sendOrder')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ITEM LIST */}
                <div className="p-4 space-y-3">
                    {filteredItems.length === 0 ? (
                        <div className="py-20 text-center text-muted flex flex-col items-center gap-3">
                            <ShoppingCart className="w-12 h-12 opacity-50" />
                            <SectionTitle className="font-bold mb-0">{t('empty.noItemsForStall')}</SectionTitle>
                        </div>
                    ) : (
                        filteredItems.map(item => (
                            <div
                                key={item.id}
                                className={cn(
                                    "relative flex items-stretch min-h-24 bg-surface rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm",
                                    item.is_bought
                                        ? "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60"
                                        : "border-gray-200 dark:border-gray-700"
                                )}
                            >
                                {/* LEFT: INFO */}
                                <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-xs font-black uppercase text-sub tracking-widest truncate max-w-[100px]">{item.target_shop}</span>
                                        {item.is_bought && <Badge variant="solid" color="success" size="sm" className="text-xs h-4 px-1.5">BOUGHT</Badge>}
                                    </div>
                                    <Heading level="h5" className={cn(
                                        "uppercase font-bold leading-tight truncate",
                                        item.is_bought ? "text-sub line-through" : "text-title"
                                    )}>
                                        {itemName(item)}
                                    </Heading>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-1.5 py-0.5 rounded">{t('labels.qty', { quantity: item.quantity })}</span>
                                        <span className="text-xs font-medium text-sub uppercase border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded">{item.unit}</span>
                                    </div>
                                </div>

                                {/* RIGHT: ACTIONS */}
                                <div className="w-[120px] flex items-stretch border-l border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => openKeypad(item.id)}
                                        disabled={locked}
                                        className="flex-1 flex flex-col items-center justify-center p-1 bg-gray-50 dark:bg-gray-900/50 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-60 disabled:hover:bg-gray-50 dark:disabled:hover:bg-gray-900/50"
                                    >
                                        <span className="font-mono font-black text-lg text-title">{item.actual_price ? item.actual_price.toLocaleString() : '0'}</span>
                                        <span className="text-xs font-black text-sub uppercase tracking-widest">THB</span>
                                    </button>
                                    <button
                                        onClick={() => toggleBought(item.id)}
                                        disabled={locked}
                                        className={cn(
                                            "w-12 flex items-center justify-center transition-all active:scale-95 border-l border-gray-100 dark:border-gray-700 disabled:opacity-60",
                                            item.is_bought
                                                ? "bg-green-500 text-white"
                                                : "bg-surface text-gray-300 hover:text-success hover:bg-green-50 dark:hover:bg-green-900/20"
                                        )}
                                    >
                                        {item.is_bought ? <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-300" /> : <Circle className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ================= FIXED FOOTER ================= */}
            <div className="absolute bottom-4 left-4 right-4 z-40 bg-surface rounded-2xl border border-gray-200 dark:border-gray-700 p-2 shadow-xl flex gap-2">
                {locked ? (
                    <div className="flex-1 h-12 flex items-center justify-center gap-2 text-success font-black uppercase text-xs tracking-widest">
                        <Lock className="w-4 h-4" /> {t('labels.confirmedLocked', { defaultValue: 'Shopping confirmed — locked' })}
                    </div>
                ) : (
                    <>
                        {/* Emergency add */}
                        <Button
                            variant="outline"
                            className="aspect-square h-12 rounded-xl border-dashed border-2 shrink-0 justify-center p-0 w-12"
                            onClick={() => {
                                const name = prompt(t('messages.emergencyItemName'));
                                if (name) {
                                    const newItem: ShoppingItem = { id: crypto.randomUUID(), name, unit: 'units', quantity: 1, target_shop: 'Emergency', is_bought: false };
                                    const next = [...items, newItem];
                                    setItems(next);
                                    persistItems(next, { silent: true });
                                }
                            }}
                        >
                            <Plus className="w-5 h-5 text-gray-400" />
                        </Button>
                        {/* Salva — salva progresso, no email */}
                        <Button variant="outline" size="md" startIcon={<Save className="w-5 h-5" />} onClick={handleSave} disabled={isSaving || isConfirming} className="h-12 rounded-xl">
                            {t('buttons.save', { defaultValue: 'Save' })}
                        </Button>
                        {/* Conferma — chiude + email */}
                        <Button variant="primary" size="md" startIcon={<Check className="w-5 h-5" />} onClick={handleConfirm} disabled={isSaving || isConfirming} className="flex-1 h-12 rounded-xl shadow-lg justify-center">
                            {t('buttons.confirmClose', { defaultValue: 'Confirm & close' })}
                        </Button>
                    </>
                )}
            </div>

            {/* Numeric keypad (price entry) */}
            <Modal isOpen={keypadOpen} onClose={() => setKeypadOpen(false)} className="bg-transparent border-none shadow-none max-w-sm p-0">
                <div className="space-y-4">
                    <div className="bg-surface p-6 rounded-3xl border-2 border-primary-500 text-center shadow-2xl">
                        <span className="uppercase font-black text-primary-600 tracking-widest mb-1 block text-xs">{t('labels.inputThb', { defaultValue: 'Price (THB)' })}</span>
                        <div className="font-mono text-title text-4xl font-bold flex items-center justify-center gap-2">
                            {tempPrice}<span className="text-xl opacity-50">฿</span>
                        </div>
                    </div>
                    <NumericKeypad onKeyPress={handleKeypadPress} onDelete={handleKeypadDelete} onConfirm={handleKeypadConfirm} />
                </div>
            </Modal>

        </div>
    </PageContainer>
    );
};
