import { getAnalyticsData } from '@/lib/actions/analytics';
import AnalyticsView from '@/components/analytics/AnalyticsView';

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    return (
        <AnalyticsView
            monthlyTrend={data.monthlyTrend}
            monthlyExpenseByCategory={data.monthlyExpenseByCategory}
            yearlyExpenseByCategory={data.yearlyExpenseByCategory}
            yearlyExpenseByAccount={data.yearlyExpenseByAccount}
            yearlyTotals={data.yearlyTotals}
            currentYear={data.currentYear}
            currentMonth={data.currentMonth}
        />
    );
}
