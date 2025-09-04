export interface ChangeTracker<T> {
  originalData: T;
  changes: Partial<T>;
  hasChanges: boolean;
  getChangedFields: () => Partial<T>;
  reset: () => void;
}

export function createChangeTracker<T>(originalData: T): ChangeTracker<T> {
  let changes: Partial<T> = {};
  
  const hasChanges = () => Object.keys(changes).length > 0;
  
  const getChangedFields = () => ({ ...changes });
  
  const reset = () => {
    changes = {};
  };
  
  return {
    originalData,
    get changes() { return changes; },
    get hasChanges() { return hasChanges(); },
    getChangedFields,
    reset,
  };
}

export function trackChanges<T>(originalData: T, currentData: T): Partial<T> {
  const changes: Partial<T> = {};
  
  for (const key in currentData) {
    if (currentData.hasOwnProperty(key)) {
      const originalValue = (originalData as any)[key];
      const currentValue = (currentData as any)[key];
      
      // Skip undefined values
      if (currentValue === undefined) continue;
      
      // Handle null values
      if (currentValue === null && originalValue !== null) {
        (changes as any)[key] = currentValue;
        continue;
      }
      
      // Deep comparison for objects and arrays
      if (typeof currentValue === 'object' && currentValue !== null) {
        // Handle arrays
        if (Array.isArray(currentValue)) {
          if (!Array.isArray(originalValue) || JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
            (changes as any)[key] = currentValue;
          }
        } else {
          // Handle objects - for nested objects, we need to merge with original to ensure completeness
          if (typeof originalValue !== 'object' || originalValue === null || JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
            // For nested objects like contactInfo, address, operatingHours, merge with original to ensure all required fields are present
            if (originalValue && typeof originalValue === 'object') {
              (changes as any)[key] = { ...originalValue, ...currentValue };
            } else {
              (changes as any)[key] = currentValue;
            }
          }
        }
      } else if (originalValue !== currentValue) {
        (changes as any)[key] = currentValue;
      }
    }
  }
  
  return changes;
}

export function getOnlyChangedFields<T>(originalData: T, currentData: T): Partial<T> {
  const changes = trackChanges(originalData, currentData);
  
  // Filter out empty objects and undefined values
  const filteredChanges: Partial<T> = {};
  for (const key in changes) {
    if (changes.hasOwnProperty(key)) {
      const value = (changes as any)[key];
      if (value !== undefined && value !== null) {
        // Skip empty objects
        if (typeof value === 'object' && !Array.isArray(value)) {
          const keys = Object.keys(value);
          if (keys.length > 0) {
            (filteredChanges as any)[key] = value;
          }
        } else {
          (filteredChanges as any)[key] = value;
        }
      }
    }
  }
  
  return filteredChanges;
}
