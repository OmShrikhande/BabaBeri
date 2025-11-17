export const getDateRange = (period) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let fromDate = new Date(today);
  let toDate = new Date(today);

  switch (period) {
    case 'weekly': {
      const dayOfWeek = today.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      fromDate.setDate(today.getDate() - daysFromMonday);
      toDate.setDate(today.getDate() + (6 - daysFromMonday));
      break;
    }
    case 'monthly': {
      fromDate.setDate(1);
      toDate.setMonth(today.getMonth() + 1, 0);
      break;
    }
    case 'yearly': {
      fromDate.setFullYear(Math.max(2020, today.getFullYear() - 4));
      fromDate.setMonth(0, 1);
      toDate.setFullYear(today.getFullYear());
      toDate.setMonth(11, 31);
      break;
    }
    default:
      break;
  }

  return {
    from: formatDateISO(fromDate),
    to: formatDateISO(toDate)
  };
};

export const formatDateISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getMonthName = (date) => {
  return new Date(date).toLocaleString('en-US', { month: 'short' });
};

export const getYearFromDate = (dateStr) => {
  return new Date(dateStr).getFullYear();
};

export const getWeeklyDates = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() - daysFromMonday);
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
    dates.push(formatDateISO(date));
  }
  
  return dates;
};
