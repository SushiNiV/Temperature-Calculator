// convert to Celsius
export const toCelsius = (value, unit) => {
  switch(unit) {
    case 'C': return value;
    case 'F': return (value - 32) * 5/9;
    case 'K': return value - 273.15;
    default: return null;
  }
};

// convert from Celsius
export const fromCelsius = (celsius, targetUnit) => {
  switch(targetUnit) {
    case 'C': return celsius;
    case 'F': return (celsius * 9/5) + 32;
    case 'K': return celsius + 273.15;
    default: return null;
  }
};

// calculate all temperatures
export const calculateAllTemperatures = (celsiusValue) => {
  if (celsiusValue === null || isNaN(celsiusValue)) {
    return { celsius: null, fahrenheit: null, kelvin: null };
  }
  
  const f = (celsiusValue * 9/5) + 32;
  const k = celsiusValue + 273.15;

  const roundToTwo = (num) => Math.round(num * 100) / 100;
  
  return {
    celsius: roundToTwo(celsiusValue),
    fahrenheit: roundToTwo(f),
    kelvin: roundToTwo(k)
  };
};

// slider percentage from Celsius
export const getSliderPercentageFromCelsius = (celsiusValue) => {
  if (celsiusValue === null) return 50;
  
  let percentage = ((celsiusValue - 0) / 100) * 95 + 3;
  percentage = Math.min(Math.max(percentage, 3), 98);
  
  return ((percentage - 3) / 95) * 100;
};

// mercury height
export const calculateMercuryHeight = (sliderPercentage, minMercury, maxMercury, maxHeight) => {
  const mercuryPercent = minMercury + (sliderPercentage / 100) * (maxMercury - minMercury);
  return (mercuryPercent / 100) * maxHeight;
};