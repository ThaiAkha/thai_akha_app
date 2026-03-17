import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation("pages");

  return (
    <>
      <PageMeta
        title={t("notFound.pageTitle")}
        description={t("notFound.pageDesc")}
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <GridShape />
        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
            {t("notFound.errorLabel")}
          </h1>

          <div className="text-8xl font-display font-black text-brand-500 opacity-20 my-12 tracking-tighter">
            {t("notFound.code")}
          </div>

          <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            {t("notFound.message")}
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("notFound.backHome")}
          </Link>
        </div>
        {/* <!-- Footer --> */}
        <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
          &copy; {t("notFound.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </>
  );
}
