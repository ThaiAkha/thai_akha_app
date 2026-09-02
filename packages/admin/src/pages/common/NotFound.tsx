import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { Heading, Paragraph } from "../../components/typography";
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
          <Heading level="h1" className="mb-8 text-title-md leading-[44px] xl:text-title-2xl xl:leading-[90px] tracking-normal">
            {t("notFound.errorLabel")}
          </Heading>

          <div className="text-8xl font-display font-black text-primary-500 opacity-20 my-12 tracking-tighter">
            {t("notFound.code")}
          </div>

          <Paragraph className="mt-10 mb-6 sm:text-lg leading-6 sm:leading-7">
            {t("notFound.message")}
          </Paragraph>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-surface px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("notFound.backHome")}
          </Link>
        </div>
        {/* <!-- Footer --> */}
        <Paragraph size="sm" color="secondary" className="absolute text-center -translate-x-1/2 bottom-6 left-1/2 leading-5">
          &copy; {t("notFound.copyright", { year: new Date().getFullYear() })}
        </Paragraph>
      </div>
    </>
  );
}
