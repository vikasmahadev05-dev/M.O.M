import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  parseISO,
  isToday,
  getHours,
  getMinutes
} from 'date-fns';

export const getMonthDays = (date) => {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  return eachDayOfInterval({ start, end });
};

export const getWeekDays = (date) => {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  return eachDayOfInterval({ start, end });
};

export const formatEventTime = (date) => {
  return format(new Date(date), 'h:mm a');
};

export const getTimeSlotPosition = (date) => {
  const hours = getHours(new Date(date));
  const minutes = getMinutes(new Date(date));
  return (hours * 60 + minutes); // Minutes from start of day
};

export const getEventDurationMinutes = (start, end) => {
  const diff = new Date(end) - new Date(start);
  return Math.floor(diff / (1000 * 60));
};

export { 
  format, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  addDays, 
  subDays,
  parseISO,
  startOfDay,
  endOfDay
};
