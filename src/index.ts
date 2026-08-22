import type { App } from 'vue';

// Components
import ResultViewer from './vue/ResultViewer.vue';
import BarChart from './vue/BarChart.vue';
import SqlReportBuilder from './vue/SqlReportBuilder.vue';
import TelegramConfig from './vue/TelegramConfig.vue';
import ScheduleForm from './vue/ScheduleForm.vue';
import AiSummary from './vue/AiSummary.vue';

// Core (framework-neutral)
export { createInsightsApi, type InsightsApi } from './core/api';
export { numericColumns, toBarData, type BarDatum } from './core/charts';
export { errorMessage } from './vue/errors';
export * from './core/types';

export { ResultViewer, BarChart, SqlReportBuilder, TelegramConfig, ScheduleForm, AiSummary };

const components = { ResultViewer, BarChart, SqlReportBuilder, TelegramConfig, ScheduleForm, AiSummary };

/** Optional global registration: `app.use(InsightsUi)`. Tree-shaking-friendly named
 *  imports are preferred; this is a convenience for apps that want them global. */
export const InsightsUi = {
  install(app: App) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component);
    }
  },
};
