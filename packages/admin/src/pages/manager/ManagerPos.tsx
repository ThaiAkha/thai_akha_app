import React from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '../../components/common/PageMeta';
import { DataExplorerLayout } from '../../components/data-explorer';
import ClassPicker from '../../components/common/ClassPicker';

// Modular Components
import PosSidebar from '../../components/manager/pos/PosSidebar';
import PosContent from '../../components/manager/pos/PosContent';
import PosInspector from '../../components/manager/pos/PosInspector';

// Logic Hook
import { useManagerPos } from '../../hooks/useManagerPos';

const ManagerPos: React.FC = () => {
    const { t } = useTranslation('pos');
    const {
        filteredGuests,
        displayedProducts,
        mainCategories,
        subCategoryTabs,
        activeGuest,
        currentTab,
        totalDue,
        loading,
        isProcessing,
        selectedDate,
        selectedSession,
        activeCategory,
        activeSubCategory,
        activeGuestId,
        setSelectedDate,
        setSelectedSession,
        setActiveGuestId,
        setActiveCategory,
        setActiveSubCategory,
        addToTab,
        handleRemoveItem,
        handleSaveConfirmed,
        handlePayCash,
        closeInspector,
    } = useManagerPos();

    return (
        <>
            <PageMeta
                title={t('meta.title')}
                description={t('meta.description')}
            />

            <DataExplorerLayout
                viewMode="table"
                inspectorOpen={true}
                onInspectorClose={closeInspector}
                sidebar={
                    <PosSidebar
                        filteredGuests={filteredGuests}
                        activeGuestId={activeGuestId}
                        onSelectGuest={setActiveGuestId}
                    />
                }
                toolbar={
                    <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50 shadow-sm shrink-0">
                        <ClassPicker
                            date={selectedDate}
                            onDateChange={setSelectedDate}
                            session={selectedSession}
                            onSessionChange={setSelectedSession}
                        />
                        <div className="flex-1" />
                    </div>
                }
                inspector={
                    <PosInspector
                        activeGuest={activeGuest}
                        activeGuestId={activeGuestId}
                        currentTab={currentTab}
                        totalDue={totalDue}
                        isProcessing={isProcessing}
                        onRemoveItem={handleRemoveItem}
                        onSave={handleSaveConfirmed}
                        onPayCash={handlePayCash}
                        onClose={closeInspector}
                    />
                }
            >
                <PosContent
                    loading={loading}
                    displayedProducts={displayedProducts}
                    mainCategories={mainCategories}
                    subCategoryTabs={subCategoryTabs}
                    activeCategory={activeCategory}
                    activeSubCategory={activeSubCategory}
                    onCategoryChange={setActiveCategory}
                    onSubCategoryChange={setActiveSubCategory}
                    onAddToTab={addToTab}
                />
            </DataExplorerLayout>
        </>
    );
};

export default ManagerPos;
