import { toCelsius, fromCelsius } from './temperatureUtils';

// single temperature token
export const parseTemperature = (token) => {
  token = token.trim();
  const regex = /^(-?\d+(?:\.\d+)?)\s*°?\s*([CcFfKk]|°C|°F)$/;
  const match = token.match(regex);
  
  if (!match) return null;
  
  const value = parseFloat(match[1]);
  let unit = match[2] ? match[2].toUpperCase() : '';
  if (unit === '°C') unit = 'C';
  if (unit === '°F') unit = 'F';
  
  if (!unit) return null;
  
  return { value, unit };
};

// sanitize input
export const sanitizeInput = (input) => {
  let sanitized = input.replace(/([+\-*/])\1+/g, '$1');
  
  if (sanitized.match(/\d+°[CFK]\d+$/i)) {
    return { valid: false, error: "Invalid format: Missing operator between numbers" };
  }
  
  return { valid: true, sanitized };
};

// evaluate mathematical expression with temperatures
export const evaluateExpression = (expression, toCelsiusFn, fromCelsiusFn) => {
  if (expression.includes('*') || expression.includes('/') || expression.includes('×') || expression.includes('÷')) {
    return { valid: false, error: "Multiplication and division are not supported. Use + or - only." };
  }
  
  const invalidPattern = /\d+°[CFK]\s*\d+°[CFK]/i;
  if (invalidPattern.test(expression)) {
    return { valid: false, error: "Invalid format: Numbers must be separated by operators" };
  }
  
  const multipleUnits = /\d+°[CFK]\s*°[CFK]/i;
  if (multipleUnits.test(expression)) {
    return { valid: false, error: "Invalid format: Multiple units detected" };
  }

  let processed = expression.replace(/×/g, '*').replace(/÷/g, '/');
  
  const tempRegex = /(-?\d+(?:\.\d+)?)\s*°?\s*([CcFfKk]|°C|°F)/g;
  const tokens = [];
  let match;
  
  while ((match = tempRegex.exec(processed)) !== null) {
    const fullMatch = match[0];
    const value = parseFloat(match[1]);
    let unit = match[2].toUpperCase();
    if (unit === '°C') unit = 'C';
    if (unit === '°F') unit = 'F';
    
    tokens.push({
      start: match.index,
      end: match.index + fullMatch.length,
      value,
      unit,
      celsius: toCelsiusFn(value, unit)
    });
  }
  
  if (tokens.length === 0) {
    return { valid: false, error: "No valid temperature units found" };
  }
  
  let calculationString = processed;
  let offset = 0;
  
  for (const token of tokens) {
    const start = token.start + offset;
    const end = token.end + offset;
    calculationString = calculationString.slice(0, start) + token.celsius + calculationString.slice(end);
    offset += token.celsius.toString().length - (token.end - token.start);
  }
  
  try {
    const result = Function('"use strict";return (' + calculationString + ')')();
    
    if (isNaN(result) || !isFinite(result)) {
      return { valid: false, error: "Invalid calculation" };
    }
    
    const resultUnit = tokens[0].unit;
    const resultValue = fromCelsiusFn(result, resultUnit);
    
    return {
      valid: true,
      celsius: result,
      value: resultValue,
      unit: resultUnit,
      expression: expression
    };
  } catch (error) {
    return { valid: false, error: "Invalid expression" };
  }
};

// full input (expression or single value)
export const parseInput = (input, toCelsiusFn, fromCelsiusFn, parseTemperatureFn, sanitizeInputFn, evaluateExpressionFn) => {
  const sanitized = sanitizeInputFn(input);
  if (!sanitized.valid) {
    return { valid: false, message: sanitized.error };
  }
  input = sanitized.sanitized;
  input = input.trim();
  
  const evaluated = evaluateExpressionFn(input, toCelsiusFn, fromCelsiusFn);
  if (evaluated.valid) {
    return {
      valid: true,
      value: evaluated.value,
      unit: evaluated.unit,
      celsius: evaluated.celsius,
      isExpression: true
    };
  }
  
  const singleToken = parseTemperatureFn(input);
  if (singleToken) {
    const celsiusValue = toCelsiusFn(singleToken.value, singleToken.unit);
    return {
      valid: true,
      value: singleToken.value,
      unit: singleToken.unit,
      celsius: celsiusValue,
      isExpression: false
    };
  }
  
  return { valid: false, message: "Invalid input. Use format: 25°C, 32°F, or expressions like 25°C + 30°C" };
};