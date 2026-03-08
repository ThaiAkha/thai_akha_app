import React from 'react';
import { User, Search, Briefcase } from 'lucide-react';
import { cn } from '../../../lib/utils';
import Card from '../../ui/Card';
import { UserMode, NewUser } from '../../../hooks/useAdminBooking';
import BookingNewUserForm from './BookingNewUserForm';
import BookingUserSearchForm from './BookingUserSearchForm';
import BookingLogisticsForm from './BookingLogisticsForm';

interface BookingContentProps {
    userMode: UserMode;
    onUserModeChange: (m: UserMode) => void;
    newUser: NewUser;
    onNewUserChange: (u: NewUser) => void;
    searchTerm: string;
    onSearchTermChange: (s: string) => void;
    searchResults: any[];
    selectedUser: any | null;
    onSelectedUserChange: (u: any) => void;
    hotelSearchQuery: string;
    onHotelSearchQueryChange: (q: string) => void;
    hotelSearchResults: any[];
    onHotelSelect: (h: any) => void;
    pickupZone: any | null;
    notes: string;
    onNotesChange: (n: string) => void;
    hasLuggage: boolean;
    onHasLuggageChange: (l: boolean) => void;
    meetingPoints: any[];
    meetingPoint: string;
    onMeetingPointChange: (m: string) => void;
    onSetHotel: (h: any) => void;
    session: 'morning_class' | 'evening_class';
}

const BookingContent: React.FC<BookingContentProps> = ({
    userMode,
    onUserModeChange,
    newUser,
    onNewUserChange,
    searchTerm,
    onSearchTermChange,
    searchResults,
    selectedUser,
    onSelectedUserChange,
    hotelSearchQuery,
    onHotelSearchQueryChange,
    hotelSearchResults,
    onHotelSelect,
    pickupZone,
    notes,
    onNotesChange,
    hasLuggage,
    onHasLuggageChange,
    meetingPoints,
    meetingPoint,
    onMeetingPointChange,
    onSetHotel,
    session
}) => {
    return (
        <div className="lg:col-span-6 space-y-6">
            <Card className="relative min-h-[400px] !p-0 overflow-hidden">

                {/* HEADER WITH TABS */}
                <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 rounded-t-xl overflow-hidden">
                    <div className="flex overflow-x-auto no-scrollbar">
                        {[
                            { id: 'new', label: 'New Guest', icon: User },
                            { id: 'existing', label: 'Existing User', icon: Search },
                            { id: 'agency', label: 'Agency', icon: Briefcase },
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => onUserModeChange(mode.id as UserMode)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-4 py-4 text-md font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap",
                                    userMode === mode.id
                                        ? "border-green-500 text-green-600 dark:text-green-400 bg-white dark:bg-gray-800"
                                        : "border-transparent text-gray-800 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800/20"
                                )}
                            >
                                <mode.icon className={cn("w-4 h-4", userMode === mode.id && "text-green-500")} />
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* Dynamic Title based on Mode */}
                    <div className="mb-6 pb-3 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            {userMode === 'new' && <><User className="w-5 h-5 text-green-500" /> New Guest</>}
                            {userMode === 'existing' && <><Search className="w-5 h-5 text-green-500" /> Existing User</>}
                            {userMode === 'agency' && <><Briefcase className="w-5 h-5 text-green-500" /> Agency</>}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                            {userMode === 'new' && 'Create a new user profile and booking.'}
                            {userMode === 'existing' && 'Search database for returning guests.'}
                            {userMode === 'agency' && 'Book on behalf of a partner/agency.'}
                        </p>
                    </div>

                    {/* MODE: NEW */}
                    {userMode === 'new' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                            <BookingNewUserForm
                                newUser={newUser}
                                onNewUserChange={onNewUserChange}
                            />
                        </div>
                    )}

                    {/* MODE: EXISTING & AGENCY */}
                    {(userMode === 'existing' || userMode === 'agency') && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                            <BookingUserSearchForm
                                userMode={userMode as 'existing' | 'agency'}
                                searchTerm={searchTerm}
                                onSearchTermChange={onSearchTermChange}
                                searchResults={searchResults}
                                selectedUser={selectedUser}
                                onSelectedUserChange={onSelectedUserChange}
                            />
                        </div>
                    )}

                    {/* LOGISTICS & NOTES */}
                    <BookingLogisticsForm
                        hotelSearchQuery={hotelSearchQuery}
                        onHotelSearchQueryChange={onHotelSearchQueryChange}
                        hotelSearchResults={hotelSearchResults}
                        onHotelSelect={onHotelSelect}
                        pickupZone={pickupZone}
                        notes={notes}
                        onNotesChange={onNotesChange}
                        hasLuggage={hasLuggage}
                        onHasLuggageChange={onHasLuggageChange}
                        meetingPoints={meetingPoints}
                        meetingPoint={meetingPoint}
                        onMeetingPointChange={onMeetingPointChange}
                        onSetHotel={onSetHotel}
                        session={session}
                    />
                </div>

            </Card>
        </div>
    );
};

export default BookingContent;
