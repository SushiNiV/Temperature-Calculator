import { useState, useEffect, useCallback } from 'react';
import { 
  toCelsius, 
  fromCelsius, 
  calculateAllTemperatures,
  getSliderPercentageFromCelsius,
  calculateMercuryHeight
} from '../utils/temperatureUtils';
import { 
  parseTemperature, 
  sanitizeInput, 
  evaluateExpression, 
  parseInput 
} from '../utils/expressionParser';
import { MIN_MERCURY, MAX_MERCURY, MAX_MERCURY_HEIGHT } from '../utils/constants';

export const useCalculator = () => {
  const [inputValue, setInputValue] = useState('');
  const [displayValue, setDisplayValue] = useState('Enter input...');
  const [celsius, setCelsius] = useState(null);
  const [fahrenheit, setFahrenheit] = useState(null);
  const [kelvin, setKelvin] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [lastAnswerUnit, setLastAnswerUnit] = useState(null);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [history, setHistory] = useState([]);
  const [shouldReplace, setShouldReplace] = useState(false);

  // wrapper functions to pass dependencies
  const toCelsiusWrapper = useCallback((value, unit) => toCelsius(value, unit), []);
  const fromCelsiusWrapper = useCallback((celsius, unit) => fromCelsius(celsius, unit), []);
  const parseTemperatureWrapper = useCallback((token) => parseTemperature(token), []);
  const sanitizeInputWrapper = useCallback((input) => sanitizeInput(input), []);
  const evaluateExpressionWrapper = useCallback((expression) => 
    evaluateExpression(expression, toCelsiusWrapper, fromCelsiusWrapper), 
  [toCelsiusWrapper, fromCelsiusWrapper]);

  const handleInput = useCallback((input) => {
    setInputValue(input);
    
    const parsed = parseInput(input, toCelsiusWrapper, fromCelsiusWrapper, parseTemperatureWrapper, sanitizeInputWrapper, evaluateExpressionWrapper);
    
    if (!parsed.valid) {
      setIsValid(false);
      setDisplayValue(parsed.message || "Invalid input");
      setCelsius(null);
      setFahrenheit(null);
      setKelvin(null);
      setShouldReplace(true); 
      return;
    }
    
    setIsValid(true);
    const celsiusValue = parsed.celsius;
    setCelsius(celsiusValue);
    
    const { celsius, fahrenheit, kelvin } = calculateAllTemperatures(celsiusValue);
    setFahrenheit(fahrenheit);
    setKelvin(kelvin);
    
    setLastAnswer(parsed.value);
    setLastAnswerUnit(parsed.unit);
    addToHistory(input, parsed.value, parsed.unit);
    
    setDisplayValue(input);
    setShouldReplace(true);
  }, [toCelsiusWrapper, fromCelsiusWrapper, parseTemperatureWrapper, sanitizeInputWrapper, evaluateExpressionWrapper]);

  const handleCalculate = useCallback(() => {
    if (inputValue) {
      handleInput(inputValue);
    } else {
      setDisplayValue("Please enter a temperature or expression");
      setIsValid(false);
    }
  }, [inputValue, handleInput]);

  const appendToInput = useCallback((value) => {
    let newInput;
  
  if (shouldReplace) {
    newInput = value;
    setShouldReplace(false);
  } else {
    newInput = inputValue + value;
  }
  
  setInputValue(newInput);
  setDisplayValue(newInput);
  setIsValid(true);
}, [inputValue, shouldReplace]);

  const clearInput = useCallback(() => {
    setInputValue('');
    setDisplayValue('Enter input...');
    setCelsius(null);
    setFahrenheit(null);
    setKelvin(null);
    setIsValid(true);
    setShouldReplace(false);  
  }, []);

  const deleteLastChar = useCallback(() => {
    const newInput = inputValue.slice(0, -1);
    setInputValue(newInput);
    if (newInput === '') {
      setDisplayValue('Enter input...');
    } else {
      setDisplayValue(newInput);
    }
  }, [inputValue]);

  const toggleSign = useCallback(() => {
    const match = inputValue.match(/^(-?\d+(?:\.\d+)?)/);
    if (match) {
      let num = parseFloat(match[1]);
      num = -num;
      const newInput = inputValue.replace(/^-?\d+(?:\.\d+)?/, num.toString());
      setInputValue(newInput);
      setDisplayValue(newInput);
    }
  }, [inputValue]);

  const insertANS = useCallback(() => {
    if (lastAnswer !== null && lastAnswerUnit !== null) {
      const ansString = `${lastAnswer}°${lastAnswerUnit}`;
      let newInput;
      
      if (shouldReplace) {
        newInput = ansString;
        setShouldReplace(false);
      } else {
        newInput = inputValue + ansString;
      }
      
      setInputValue(newInput);
      setDisplayValue(newInput);
    } else {
      const tempDisplay = displayValue;
      setDisplayValue("No previous answer");
      setIsValid(false);
      setTimeout(() => {
        setDisplayValue(tempDisplay);
        setIsValid(true);
      }, 1500);
    }
  }, [lastAnswer, lastAnswerUnit, inputValue, displayValue, shouldReplace]);

  const addToHistory = useCallback((input, result, unit) => {
    const historyEntry = {
      id: Date.now(),
      input: input,
      result: `${result.toFixed(2)}°${unit}`,
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString()
    };
    setHistory(prev => [historyEntry, ...prev].slice(0, 20));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  // keyboard handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', '+', '(', ')'];
      const unitKeys = ['c', 'C', 'f', 'F', 'k', 'K'];
      
      if (allowedKeys.includes(e.key)) {
        e.preventDefault();
        appendToInput(e.key);
      } else if (unitKeys.includes(e.key)) {
        e.preventDefault();
        const unit = e.key.toUpperCase();
        appendToInput(`°${unit}`);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clearInput();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLastChar();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [appendToInput, handleCalculate, clearInput, deleteLastChar]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  // mercury calculations
  const sliderPercentage = celsius !== null ? getSliderPercentageFromCelsius(celsius) : 50;
  const mercuryHeight = calculateMercuryHeight(sliderPercentage, MIN_MERCURY, MAX_MERCURY, MAX_MERCURY_HEIGHT);

  return {
    // state
    inputValue,
    displayValue,
    celsius,
    fahrenheit,
    kelvin,
    isValid,
    mercuryHeight,
    theme,
    history,
    shouldReplace,
    // actions
    appendToInput,
    clearInput,
    deleteLastChar,
    toggleSign,
    insertANS,
    handleCalculate,
    toggleTheme,
    clearHistory,
    addToHistory,
    handleInput, 
  };
};