import UserMetaCard from "../../components/UserProfile/UserMetaCard";
import UserAddressCard from "../../components/UserProfile/UserAddressCard";
import UserSecurityCard from "../../components/UserProfile/UserSecurityCard";
import PageMeta from "../../components/common/PageMeta";
import PageContainer from "../../components/layout/PageContainer";

export default function UserProfiles() {
  return (
    <>
      <PageMeta
        title="Profile Dashboard | Cherry Admin"
        description="Manage your personal details, agency identity, and security settings."
      />
      <PageContainer className="min-h-screen pb-20">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">

          {/* Top Card: Personal Details (Avatar, Name, Demographics) */}
          <UserMetaCard />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

            {/* Bottom Left: Identity & Agency (2/3 Width) */}
            <UserAddressCard />

            {/* Bottom Right: Security & Access (1/3 Width) */}
            <UserSecurityCard />

          </div>
        </div>
      </PageContainer>
    </>
  );
}
