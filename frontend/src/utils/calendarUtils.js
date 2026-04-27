import { 
  isWithinInterval, 
  areIntervalsOverlapping, 
  addDays, 
  addWeeks, 
  addMonths, 
  isAfter, 
  startOfDay,
  parseISO,
  format,
  getDay
} from 'date-fns';

/**
 * Detect conflicts (overlaps) between a new/edited item and existing items.
 */
export const detectConflicts = (newItem, allItems) => {
  const newStart = new Date(newItem.startTime);
  const newEnd = new Date(newItem.endTime);
  
  return allItems.filter(item => {
    // Ignore self and parent if this is an instance
    const parentId = newItem.originalId || newItem.parentId;
    if (item._id === newItem._id || item._id === parentId) return false;
    
    const itemStart = new Date(item.startTime);
    const itemEnd = new Date(item.endTime);
    
    try {
      return areIntervalsOverlapping(
        { start: newStart, end: newEnd },
        { start: itemStart, end: itemEnd }
      );
    } catch (e) {
      return false;
    }
  });
};

const DAY_MAP = {
  'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
};

/**
 * Advanced Recurrence Generation
 */
export const generateRecurrenceInstances = (items, viewStart, viewEnd) => {
  const expandedItems = [];
  
  items.forEach(item => {
    expandedItems.push(item);
    if (item.recurrence === 'none') return;
    
    let currentStart = new Date(item.startTime);
    const duration = new Date(item.endTime) - currentStart;
    const limitDate = item.recurrenceEndDate ? new Date(item.recurrenceEndDate) : addMonths(viewEnd, 1);
    const interval = item.recurrenceInterval || 1;
    
    let iterations = 0;
    while (isAfter(limitDate, currentStart) && iterations < 500) {
      iterations++;
      
      if (item.recurrence === 'daily') {
        currentStart = addDays(currentStart, interval);
      } else if (item.recurrence === 'weekly') {
        if (item.recurrenceDays && item.recurrenceDays.length > 0) {
          // Complex weekly logic: find next day in the set
          let found = false;
          let tempDate = currentStart;
          for (let i = 1; i <= 7 * interval; i++) {
            tempDate = addDays(tempDate, 1);
            const dayName = format(tempDate, 'EEEE');
            if (item.recurrenceDays.includes(dayName)) {
              currentStart = tempDate;
              found = true;
              break;
            }
          }
          if (!found) break;
        } else {
          currentStart = addWeeks(currentStart, interval);
        }
      } else if (item.recurrence === 'monthly') {
        currentStart = addMonths(currentStart, interval);
      } else {
        break;
      }
      
      if (isAfter(currentStart, viewEnd)) break;
      
      const instanceStartTime = currentStart.toISOString();
      
      // Skip if this date is excluded
      const currentDateStr = format(currentStart, 'yyyy-MM-dd');
      if (item.excludedDates && item.excludedDates.some(ed => {
        try {
          return format(new Date(ed), 'yyyy-MM-dd') === currentDateStr;
        } catch (e) {
          return false;
        }
      })) {
        continue;
      }
      
      expandedItems.push({
        ...item,
        _id: `${item._id}_${currentStart.getTime()}`, // Use timestamp for unique virtual ID
        startTime: instanceStartTime,
        endTime: new Date(currentStart.getTime() + duration).toISOString(),
        isInstance: true,
        originalId: item._id
      });
    }
  });
  
  return expandedItems;
};

export const calculateDuration = (start, end) => {
  return Math.round((new Date(end) - new Date(start)) / (1000 * 60));
};

export const suggestTags = (title) => {
  const keywords = {
    'meeting': ['work', 'collab'],
    'call': ['work', 'communication'],
    'gym': ['health', 'personal'],
    'workout': ['health', 'personal'],
    'dinner': ['personal', 'social'],
    'party': ['social'],
    'deadline': ['work', 'urgent'],
    'project': ['work'],
    'doctor': ['health', 'appointment'],
    'dentist': ['health', 'appointment']
  };

  const suggestions = [];
  const lowerTitle = title.toLowerCase();
  
  Object.keys(keywords).forEach(key => {
    if (lowerTitle.includes(key)) {
      suggestions.push(...keywords[key]);
    }
  });

  return Array.from(new Set(suggestions));
};
