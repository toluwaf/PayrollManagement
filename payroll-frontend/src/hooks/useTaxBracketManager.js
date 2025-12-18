// src/hooks/useTaxBracketManager.js
import { useCallback } from 'react';

export const useTaxBracketManager = (settings, updateSettings, setHasChanges) => {
  // Validate bracket updates
  const validateTaxBracketUpdate = useCallback((brackets, index, field, value) => {
    const errors = [];
    
    if (field === 'min') {
      const numValue = parseFloat(value);
      
      if (index === 0 && numValue !== 0) {
        errors.push('First bracket must start from 0');
      }
      
      if (index > 0 && numValue <= brackets[index - 1].max) {
        errors.push(`Minimum must be greater than previous bracket's maximum (${brackets[index - 1].max})`);
      }
      
      if (numValue > brackets[index].max && brackets[index].max !== Infinity) {
        errors.push(`Minimum cannot be greater than maximum (${brackets[index].max})`);
      }
    }
    
    if (field === 'max' && value !== Infinity) {
      const numValue = parseFloat(value);
      
      if (numValue <= brackets[index].min) {
        errors.push(`Maximum must be greater than minimum (${brackets[index].min})`);
      }
      
      if (index < brackets.length - 1 && numValue >= brackets[index + 1].min) {
        errors.push(`Maximum must be less than next bracket's minimum (${brackets[index + 1].min})`);
      }
    }
    
    if (field === 'rate') {
      const numValue = parseFloat(value) / 100;
      
      if (numValue < 0 || numValue > 1) {
        errors.push('Rate must be between 0% and 100%');
      }
      
      // Progressive tax validation (optional)
      if (index > 0 && numValue < brackets[index - 1].rate) {
        errors.push(`Rate should not be less than previous bracket's rate (${brackets[index - 1].rate * 100}%)`);
      }
    }
    
    return errors;
  }, []);

  // Safe number parsing
  const safeParseNumber = useCallback((value, defaultValue = 0) => {
    if (value === '' || value === null || value === undefined) {
      return defaultValue;
    }
    
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }, []);

  // Add tax bracket
  const addTaxBracket = useCallback(() => {
    updateSettings(prev => {
      const currentBrackets = [...prev.taxSettings.taxBrackets];
      const lastBracket = currentBrackets[currentBrackets.length - 1];
      
      // Handle Infinity case
      if (lastBracket.max === Infinity) {
        // Find the first finite bracket from the end
        let finiteBracket = null;
        let finiteBracketIndex = -1;
        
        for (let i = currentBrackets.length - 2; i >= 0; i--) {
          if (currentBrackets[i].max !== Infinity) {
            finiteBracket = currentBrackets[i];
            finiteBracketIndex = i;
            break;
          }
        }
        
        if (finiteBracket) {
          const newMin = finiteBracket.max + 1;
          const newMax = finiteBracket.max + 1000000;
          
          // Update the bracket before Infinity to have a finite max
          currentBrackets[finiteBracketIndex] = {
            ...finiteBracket,
            max: finiteBracket.max
          };
          
          // Add new finite bracket
          currentBrackets.splice(finiteBracketIndex + 1, 0, {
            min: newMin,
            max: newMax,
            rate: finiteBracket.rate + 0.01,
            description: `Additional Bracket ${finiteBracketIndex + 2}`
          });
          
          // Update the Infinity bracket's min value
          currentBrackets[currentBrackets.length - 1] = {
            ...lastBracket,
            min: newMax + 1
          };
        } else {
          // Fallback
          const newMin = 50000001;
          const newMax = newMin + 1000000;
          
          currentBrackets[currentBrackets.length - 1] = {
            ...lastBracket,
            min: newMax + 1
          };
          
          currentBrackets.splice(currentBrackets.length - 1, 0, {
            min: newMin,
            max: newMax,
            rate: lastBracket.rate - 0.01,
            description: `Additional Bracket ${currentBrackets.length}`
          });
        }
      } else {
        // Original logic for finite last bracket
        const newMin = lastBracket.max + 1;
        const newMax = lastBracket.max + 1000000;
        
        currentBrackets[currentBrackets.length - 1] = {
          ...lastBracket,
          max: lastBracket.max
        };
        
        currentBrackets.push({
          min: newMin,
          max: newMax,
          rate: lastBracket.rate + 0.01,
          description: `Additional Bracket ${currentBrackets.length}`
        });
        
        currentBrackets.push({
          ...lastBracket,
          min: newMax + 1,
          max: Infinity,
          description: 'Top Bracket'
        });
      }
      
      return {
        ...prev,
        taxSettings: {
          ...prev.taxSettings,
          taxBrackets: currentBrackets
        }
      };
    });
    setHasChanges(true);
  }, [updateSettings, setHasChanges]);

  // Remove tax bracket
  const removeTaxBracket = useCallback((index) => {
    if (settings.taxSettings.taxBrackets.length <= 2) {
      return false;
    }
    
    updateSettings(prev => {
      const newBrackets = [...prev.taxSettings.taxBrackets];
      newBrackets.splice(index, 1);
      
      // Ensure the last bracket has Infinity
      if (index === newBrackets.length) {
        newBrackets[newBrackets.length - 1] = {
          ...newBrackets[newBrackets.length - 1],
          max: Infinity,
          description: 'Top Bracket'
        };
      }
      
      return {
        ...prev,
        taxSettings: {
          ...prev.taxSettings,
          taxBrackets: newBrackets
        }
      };
    });
    setHasChanges(true);
    return true;
  }, [settings, updateSettings, setHasChanges]);

  // Update tax bracket
  const updateTaxBracket = useCallback((index, field, value, setMessage) => {
    const currentBrackets = [...settings.taxSettings.taxBrackets];
    const validationErrors = validateTaxBracketUpdate(currentBrackets, index, field, value);
    
    if (validationErrors.length > 0) {
      setMessage({
        type: 'error',
        text: `Invalid bracket update: ${validationErrors.join(', ')}`
      });
      return false;
    }
    
    updateSettings(prev => {
      let processedValue = value;
      
      if (field === 'rate') {
        processedValue = safeParseNumber(value, 0) / 100;
      } else if (field === 'min' || field === 'max') {
        processedValue = safeParseNumber(value);
        
        if (field === 'max' && (value === '' || value === 'Infinity' || value === Infinity)) {
          processedValue = Infinity;
        }
      }
      
      const newTaxBrackets = [...prev.taxSettings.taxBrackets];
      newTaxBrackets[index] = {
        ...newTaxBrackets[index],
        [field]: processedValue
      };
      
      // Ensure bracket continuity
      if (field === 'max' && index < newTaxBrackets.length - 1 && processedValue !== Infinity) {
        newTaxBrackets[index + 1] = {
          ...newTaxBrackets[index + 1],
          min: processedValue + 1
        };
      }
      
      return {
        ...prev,
        taxSettings: {
          ...prev.taxSettings,
          taxBrackets: newTaxBrackets
        }
      };
    });
    
    setHasChanges(true);
    return true;
  }, [settings, validateTaxBracketUpdate, safeParseNumber, updateSettings, setHasChanges]);

  return {
    addTaxBracket,
    removeTaxBracket,
    updateTaxBracket,
    validateTaxBracketUpdate
  };
};