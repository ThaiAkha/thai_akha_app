import React from "react";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import { LanguageSwitcher } from "../../components/header/LanguageSwitcher";
import { LogoAuth } from "@thaiakha/shared";
import { useTranslation } from "react-i18next";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation("auth");

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-gray-800 dark:bg-white/5 lg:grid relative overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: 'url("https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/LadyPadThai.webp")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(8px)',
            }}
          />
          <div className="relative flex items-center justify-center z-10">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <div className="block mb-4">
                <img
                  width={180}
                  height={180}
                  src={LogoAuth}
                  alt={t("layout.logoAlt")}
                />
              </div>
              <p className="text-center text-gray-500 dark:text-white/80 text-base md:text-lg font-medium leading-relaxed mt-4">
                {t("layout.tagline1")} <br className="hidden md:block" />
                {t("layout.tagline2")}
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
