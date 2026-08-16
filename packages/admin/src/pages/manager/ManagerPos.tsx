import React from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '../../components/common/PageMeta';
import { DataExplorerLayout } from '../../components/data-explorer';

// Modular Components
import PosClassSidebar from '../../components/manager/pos/PosClassSidebar';
import PosClassToolbar from '../../components/manager/pos/PosClassToolbar';
import PosContent from '../../components/manager/pos/PosContent';
import PosInspector from '../../components/manager/pos/PosInspector';

// Logic Hook
import { useManagerPos } from '../../hooks/useManagerPos';

const ManagerPos: React.FC = () => {
    const { t } = useTranslation('pos');
    const {
        guests,
        displayedProducts,
        mainCategories,
        subCategoryTabs,
        activeGuest,
        currentTab,
        classFee,
        totalDue,
        loading,
        isProcessing,
        activeCategory,
        activeSubCategory,
        activeGuestId,
        selectedSession,
        setSelectedSession,
        setActiveGuestId,
        setActiveCategory,
        setActiveSubCategory,
        addToTab,
        handleRemoveItem,
        handleSaveConfirmed,
        handlePayCash,
        handlePayCard,
        closeInspector,
        doSplit,
        doMergeChild,
    } = useManagerPos();
    const sessionKey = selectedSession.includes('evening') ? 'evening' : 'morning';

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
                    <PosClassSidebar
                        guests={guests}
                        session={sessionKey}
                        activeGuestId={activeGuestId}
                        onSelectGuest={setActiveGuestId}
                        onSplit={doSplit}
                        onMerge={doMergeChild}
                    />
                }
                toolbar={
                    <PosClassToolbar selectedSession={selectedSession} onSessionChange={setSelectedSession} />
                }
                inspector={
                    <PosInspector
                        activeGuest={activeGuest}
                        activeGuestId={activeGuestId}
                        currentTab={currentTab}
                        classFee={classFee}
                        totalDue={totalDue}
                        isProcessing={isProcessing}
                        onRemoveItem={handleRemoveItem}
                        onSave={handleSaveConfirmed}
                        onPayCash={handlePayCash}
                        onPayCard={handlePayCard}
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
