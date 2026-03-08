import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import {
    DataExplorerLayout,
    DataExplorerToolbar,
    DataExplorerInspector,
} from '../../components/data-explorer';
import { Plus } from 'lucide-react';
import { PRIMARY_BTN } from '../../components/data-explorer/DataExplorerToolbar';

// Modular Components
import HotelsSidebar from '../../components/admin/hotels/HotelsSidebar';
import HotelsContent from '../../components/admin/hotels/HotelsContent';
import HotelsInspector from '../../components/admin/hotels/HotelsInspector';
import HotelsInspectorActions from '../../components/admin/hotels/HotelsInspectorActions';

// Logic Hook
import { useAdminHotels } from '../../hooks/useAdminHotels';

const AdminHotels: React.FC = () => {
    const { data, ui, inspector } = useAdminHotels();

    return (
        <>
            <PageMeta title="Admin Hotels" description="Manage hotel locations and pickup zones" />

            <DataExplorerLayout
                viewMode={ui.viewMode}
                inspectorOpen={!!inspector.selectedHotel || inspector.isCreating || !!inspector.selectedMeetingPoint}
                onInspectorClose={inspector.closeInspector}
                sidebar={
                    <HotelsSidebar
                        hotels={data.hotels}
                        zones={data.zones}
                        meetingPoints={data.meetingPoints}
                        selectedZone={ui.selectedZone}
                        activeTab={ui.activeTab}
                        onSelect={ui.handleSidebarSelect}
                    />
                }
                toolbar={
                    <DataExplorerToolbar
                        viewMode={ui.viewMode}
                        onViewModeChange={ui.setViewMode}
                        searchValue={ui.searchQuery}
                        onSearchChange={ui.setSearchQuery}
                        searchPlaceholder={ui.activeTab === 'meeting_points' ? "Search meeting points..." : "Search hotels..."}
                        onRefresh={data.fetchData}
                        isRefreshing={data.loading}
                        primaryAction={
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={ui.activeTab === 'meeting_points' ? inspector.startCreateMeetingPoint : inspector.startCreate}
                                    className={PRIMARY_BTN}
                                >
                                    <Plus className="w-4 h-4" />
                                    {ui.activeTab === 'meeting_points' ? 'NUOVO PUNTO' : 'NUOVO HOTEL'}
                                </button>
                            </div>
                        }
                    />
                }
                inspector={
                    <DataExplorerInspector
                        isEditing={inspector.isEditing}
                        onClose={inspector.closeInspector}
                        headerActions={
                            <HotelsInspectorActions
                                selectedHotel={inspector.selectedHotel}
                                selectedMeetingPoint={inspector.selectedMeetingPoint}
                                isCreating={inspector.isCreating}
                                isEditing={inspector.isEditing}
                                setIsEditing={inspector.setIsEditing}
                                saving={inspector.saving}
                                onSave={inspector.handleSave}
                                onSaveMeetingPoint={inspector.handleSaveMeetingPoint}
                            />
                        }
                    >
                        <HotelsInspector
                            selectedHotel={inspector.selectedHotel}
                            selectedMeetingPoint={inspector.selectedMeetingPoint}
                            isEditing={inspector.isEditing}
                            isCreating={inspector.isCreating}
                            saving={inspector.saving}
                            form={inspector.form}
                            zones={data.zones}
                            onFormChange={(update) => inspector.setForm((prev: any) => ({ ...prev, ...update }))}
                            onMapLinkChange={inspector.handleMapLinkChange}
                            onManualGPSChange={inspector.handleManualGPSChange}
                            onSelectedMeetingPointChange={inspector.setSelectedMeetingPoint}
                            onSaveMeetingPoint={inspector.handleSaveMeetingPoint}
                        />
                    </DataExplorerInspector>
                }
            >
                <HotelsContent
                    loading={data.loading}
                    viewMode={ui.viewMode}
                    activeTab={ui.activeTab}
                    searchQuery={ui.searchQuery}
                    filteredHotels={data.filteredHotels}
                    filteredMeetingPoints={data.filteredMeetingPoints}
                    selectedHotel={inspector.selectedHotel}
                    selectedMeetingPoint={inspector.selectedMeetingPoint}
                    zones={data.zones}
                    onSelectHotel={inspector.selectHotel}
                    onSelectMeetingPoint={inspector.selectMeetingPoint}
                />
            </DataExplorerLayout>
        </>
    );
};

export default AdminHotels;
