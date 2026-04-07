import { getYearFromDate } from './dateRange';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const transformDiamondData = (rawData, period) => {
  if (period === 'weekly') {
    return transformWeeklyData(rawData);
  } else if (period === 'monthly') {
    return transformMonthlyData(rawData);
  } else if (period === 'yearly') {
    return transformYearlyData(rawData);
  }

  return [];
};

const transformWeeklyData = (rawData) => {
  const grouped = {};

  if (Array.isArray(rawData) && rawData.length > 0) {
    rawData.forEach(dayData => {
      if (!dayData || !dayData.date) return;

      const date = new Date(dayData.date);
      const dayIndex = (date.getDay() + 6) % 7;
      const dayKey = String(dayIndex);

      if (!grouped[dayKey]) {
        grouped[dayKey] = {
          day: dayIndex,
          amount: 0,
          cashout: 0,
          profit: 0
        };
      }

      if (Array.isArray(dayData.entries)) {
        dayData.entries.forEach(entry => {
          const status = entry.status?.toUpperCase();
          const diamonds = entry.diamonds || 0;

          if (status === 'CREDIT') {
            grouped[dayKey].amount += diamonds;
          } else if (status === 'CASHOUT') {
            grouped[dayKey].cashout += diamonds;
          } else if (status === 'PROFIT') {
            grouped[dayKey].profit += diamonds;
          }
        });
      }
    });
  }

  return DAYS.map((dayName, index) => ({
    name: dayName,
    amount: grouped[String(index)]?.amount || 0,
    cashout: grouped[String(index)]?.cashout || 0,
    profit: grouped[String(index)]?.profit || 0,
    isCurrentPeriod: index === (new Date().getDay() + 6) % 7
  }));
};

const transformMonthlyData = (rawData) => {
  const grouped = {};

  if (Array.isArray(rawData) && rawData.length > 0) {
    rawData.forEach(entry => {
      const { diamonds, date, status } = entry;
      if (!date) return;

      const monthIndex = new Date(date).getMonth();
      const monthKey = String(monthIndex);

      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthIndex,
          amount: 0,
          cashout: 0,
          profit: 0
        };
      }

      if (status?.toUpperCase() === 'CREDIT') {
        grouped[monthKey].amount += diamonds || 0;
      } else if (status?.toUpperCase() === 'CASHOUT') {
        grouped[monthKey].cashout += diamonds || 0;
      } else if (status?.toUpperCase() === 'PROFIT') {
        grouped[monthKey].profit += diamonds || 0;
      }
    });
  }

  return MONTHS.map((monthName, index) => ({
    name: monthName,
    amount: grouped[String(index)]?.amount || 0,
    cashout: grouped[String(index)]?.cashout || 0,
    profit: grouped[String(index)]?.profit || 0,
    isCurrentPeriod: index === new Date().getMonth()
  }));
};

const transformYearlyData = (rawData) => {
  const grouped = {};
  const currentYear = new Date().getFullYear();
  const startYear = Math.max(2020, currentYear - 4);

  if (Array.isArray(rawData) && rawData.length > 0) {
    rawData.forEach(entry => {
      const { diamonds, date, status } = entry;
      if (!date) return;

      const year = getYearFromDate(date);
      const yearKey = String(year);

      if (!grouped[yearKey]) {
        grouped[yearKey] = {
          year: yearKey,
          amount: 0,
          cashout: 0,
          profit: 0
        };
      }

      if (status?.toUpperCase() === 'CREDIT') {
        grouped[yearKey].amount += diamonds || 0;
      } else if (status?.toUpperCase() === 'CASHOUT') {
        grouped[yearKey].cashout += diamonds || 0;
      } else if (status?.toUpperCase() === 'PROFIT') {
        grouped[yearKey].profit += diamonds || 0;
      }
    });
  }

  const years = [];
  for (let year = startYear; year <= currentYear; year++) {
    years.push(year);
  }

  return years.map(year => {
    const yearKey = String(year);
    return {
      name: yearKey,
      amount: grouped[yearKey]?.amount || 0,
      cashout: grouped[yearKey]?.cashout || 0,
      profit: grouped[yearKey]?.profit || 0,
      isCurrentPeriod: isCurrentYear(year)
    };
  });
};

const isCurrentDate = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const entryDate = new Date(dateStr);
  entryDate.setHours(0, 0, 0, 0);
  return entryDate.getTime() === today.getTime();
};

const isCurrentYear = (year) => {
  const today = new Date();
  return year === today.getFullYear();
};
