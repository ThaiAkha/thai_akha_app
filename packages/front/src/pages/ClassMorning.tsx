import React, { useState, useEffect } from 'react';
import { contentService } from '@thaiakha/shared/services';
import { PageLayout, SmartHeaderSection, HeaderMenu } from '../components/layout';
import { Button, AkhaPixelLine } from '../components/ui/index';
import { CookingClassDB } from '@thaiakha/shared';
import { t } from '@thaiakha/shared/lib/ui-strings';
import { HeroContent } from '../components/classes/HeroContent';
import ClassDetails from '../components/classes/ClassDetails';
import ClassSectionBlock, { ClassSection } from '../components/classes/ClassSectionBlock';

interface MorningClassPageProps {
  onNavigate: (page: string, topic?: string) => void;
}

const MorningClassPage: React.FC<MorningClassPageProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<CookingClassDB | null>(null);
  const [session, setSession] = useState<any>(null);
  const [sections, setSections] = useState<ClassSection[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [classes, sessionData, sectionData] = await Promise.all([
          contentService.getCookingClasses(),
          contentService.getClassSession('morning_class'),
          contentService.getClassSections('morning_class'),
        ]);
        const found = classes.find((c: CookingClassDB) => c.id === 'morning_class');
        setClassData(found ?? null);
        setSession(sessionData);
        setSections(sectionData.filter((s: ClassSection) => !s.assigned_classes?.includes('evening_class')));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);


  return (
    <PageLayout
      slug="morning-class"
      loading={loading}
      showPatterns={true}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug="morning-class" />}
    >
      <div className="w-full flex flex-col space-y-12 pb-16">

        <HeroContent
          activeTab="morning"
          currentClass={classData}
        />

        {classData && (
          <ClassDetails
            color="primary"
            tags={classData.tags ?? []}
            inclusions={classData.inclusions ?? []}
            schedule={(classData.schedule_items ?? []) as any[]}
            tagline={classData.tagline}
            meetingPoints={session?.meeting_points ?? []}
            classSections={sections}
          />
        )}

        {sections.length > 0 && (
          <div className="space-y-3">
            {sections.map((section, idx) => (
              <ClassSectionBlock
                key={section.id}
                section={section}
                color="primary"
                isLast={idx === sections.length - 1}
              />
            ))}
          </div>
        )}

        <AkhaPixelLine />

        <SmartHeaderSection
          sectionId="class-02"
          variant="section"
          align="center"
        />

        <div className="flex justify-center pt-4">
          <Button
            variant="brand"
            size="lg"
            icon="calendar_month"
            onClick={() => onNavigate('booking')}
          >
            {t.classes.bookMorning}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default MorningClassPage;
