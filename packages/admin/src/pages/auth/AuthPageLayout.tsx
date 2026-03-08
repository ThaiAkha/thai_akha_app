import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              <Link to="/" className="block mb-4">
                <img
                  width={231}
                  height={231}
                  src="/images/logo/auth-logo.svg"
                  alt="Logo"
                />
              </Link>
   <p className="text-center text-gray-500 dark:text-white/80 text-base md:text-lg font-medium leading-relaxed mt-4">
    Step into the heritage of the Akha tribe. <br className="hidden md:block" /> 
    Your culinary journey begins here.
  </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
