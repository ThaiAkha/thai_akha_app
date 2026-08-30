import {
  ArrowDown,
  ArrowUp,
  Box,
  Users,
} from "lucide-react";
import Badge from "../ui/badge/Badge";
import { Heading } from '../typography';
import { useTranslation } from "react-i18next";

export default function EcommerceMetrics() {
  const { t } = useTranslation('dashboard');
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Users className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-sub">
              {t('metrics.customers')}
            </span>
            <Heading level="h2" className="mt-2">
              3,782
            </Heading>
          </div>
          <Badge color="success">
            <ArrowUp />
            11.01%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Box className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-sub">
              {t('metrics.orders')}
            </span>
            <Heading level="h2" className="mt-2">
              5,359
            </Heading>
          </div>

          <Badge color="error">
            <ArrowDown />
            9.05%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
