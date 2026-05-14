import { useState, useEffect, useRef } from 'react';
import './App.css';
import { BsMoon, BsClockHistory } from 'react-icons/bs';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [displayValue, setDisplayValue] = useState('Enter input...');
  const [celsius, setCelsius] = useState(null);
  const [fahrenheit, setFahrenheit] = useState(null);
  const [kelvin, setKelvin] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [lastAnswerUnit, setLastAnswerUnit] = useState(null);
  
  const inputRef = useRef(null);

  const parseTemperature = (token) => {
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

  const toCelsius = (value, unit) => {
    switch(unit) {
      case 'C': return value;
      case 'F': return (value - 32) * 5/9;
      case 'K': return value - 273.15;
      default: return null;
    }
  };

  const fromCelsius = (celsius, targetUnit) => {
    switch(targetUnit) {
      case 'C': return celsius;
      case 'F': return (celsius * 9/5) + 32;
      case 'K': return celsius + 273.15;
      default: return null;
    }
  };

  const evaluateExpression = (expression) => {
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
    let lastIndex = 0;
    
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
        celsius: toCelsius(value, unit)
      });
    }
    
    if (tokens.length === 0) {
      return { valid: false, error: "No valid temperature units found" };
    }
    
    const hasUnits = tokens.length > 0;
    if (!hasUnits) {
      return { valid: false, error: "All numbers must have units (°C, °F, or K)" };
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
      const resultValue = fromCelsius(result, resultUnit);
      
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

  const sanitizeInput = (input) => {
    let sanitized = input.replace(/([+\-*/])\1+/g, '$1');
    
    if (sanitized.match(/\d+°[CFK]\d+$/i)) {
      return { valid: false, error: "Invalid format: Missing operator between numbers" };
    }
    
    return { valid: true, sanitized };
  };

  const parseInput = (input) => {
    const sanitized = sanitizeInput(input);
    if (!sanitized.valid) {
      return { valid: false, message: sanitized.error };
    }
    input = sanitized.sanitized;
    input = input.trim();
    
    const evaluated = evaluateExpression(input);
    if (evaluated.valid) {
      return {
        valid: true,
        value: evaluated.value,
        unit: evaluated.unit,
        celsius: evaluated.celsius,
        isExpression: true
      };
    }
    
    const singleToken = parseTemperature(input);
    if (singleToken) {
      const celsiusValue = toCelsius(singleToken.value, singleToken.unit);
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

    const calculateAllTemperatures = (celsiusValue) => {
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

  const handleInput = (input) => {
    setInputValue(input);
    
    const parsed = parseInput(input);
    
    if (!parsed.valid) {
      setIsValid(false);
      setDisplayValue(parsed.message || "Invalid input");
      setCelsius(null);
      setFahrenheit(null);
      setKelvin(null);
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
    
    const formattedValue = parseFloat(parsed.value).toFixed(2);

    setDisplayValue(input);  
  };

  const handleCalculate = () => {
    if (inputValue) {
      handleInput(inputValue);
    } else {
      setDisplayValue("Please enter a temperature or expression");
      setIsValid(false);
    }
  };

  const appendToInput = (value) => {
    let newInput = inputValue + value;
    setInputValue(newInput);
    setDisplayValue(newInput);
    setIsValid(true);
  };

  const clearInput = () => {
    setInputValue('');
    setDisplayValue('Enter input...');
    setCelsius(null);
    setFahrenheit(null);
    setKelvin(null);
    setIsValid(true);
  };

  const deleteLastChar = () => {
    const newInput = inputValue.slice(0, -1);
    setInputValue(newInput);
    if (newInput === '') {
      setDisplayValue('Enter input...');
    } else {
      setDisplayValue(newInput);
    }
  };

  const toggleSign = () => {
    const match = inputValue.match(/^(-?\d+(?:\.\d+)?)/);
    if (match) {
      let num = parseFloat(match[1]);
      num = -num;
      const newInput = inputValue.replace(/^-?\d+(?:\.\d+)?/, num.toString());
      setInputValue(newInput);
      setDisplayValue(newInput);
    }
  };

  const insertANS = () => {
    if (lastAnswer !== null && lastAnswerUnit !== null) {
      const ansString = `${lastAnswer}°${lastAnswerUnit}`;
      const newInput = inputValue + ansString;
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
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', '+', '*', '/', '(', ')'];
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
  }, [inputValue]);

  const getSliderPercentageFromCelsius = (celsiusValue) => {
    if (celsiusValue === null) return 50;
    
    let percentage = ((celsiusValue - 0) / 100) * 95 + 3;
    percentage = Math.min(Math.max(percentage, 3), 98);
    
    return ((percentage - 3) / 95) * 100;
  };

  

  const sliderPercentage = celsius !== null ? getSliderPercentageFromCelsius(celsius) : 50;
  
  const MIN_MERCURY = 3;
  const MAX_MERCURY = 98;
  const mercuryPercent = MIN_MERCURY + (sliderPercentage / 100) * (MAX_MERCURY - MIN_MERCURY);
  const maxMercuryHeight = 550;
  const mercuryHeight = (mercuryPercent / 100) * maxMercuryHeight;

  return (
    <div className="background">
      <div className="div-container">
        <div className="left-div">
          <div className="thermometer-container">
            <div className="thermometer-glass">
              <div className="mercury">
                <div 
                  className="mercury-tube" 
                  style={{ height: `${mercuryHeight}px` }}
                ></div>
                <div className="mercury-bulb"></div>
              </div>
            </div>
          </div>
          
          <div className="calculator-div">
            <div className="calculator-upper-div">
              <div className="calculator-title">
                <h1>Temperature Calculator</h1>
              </div>
              <div className="calculator-input-screen">
                <p style={{ color: isValid ? '#000' : '#D75353' }}>
                  {displayValue}
                </p>
              </div>
              <div className="calculator-output-div">
                <div className="output-div celsius">
                  <span className="output-value">{celsius !== null ? celsius.toFixed(2) : ''}</span>
                  <span className="output-unit">°C</span>
                </div>
                <div className="output-div fahrenheit">
                  <span className="output-value">{fahrenheit !== null ? fahrenheit.toFixed(2) : ''}</span>
                  <span className="output-unit">°F</span>
                </div>
                <div className="output-div kelvin">
                  <span className="output-value">{kelvin !== null ? kelvin.toFixed(2) : ''}</span>
                  <span className="output-unit">K</span>
                </div>
              </div>
            </div>
            <div className="calculator-lower-div">
              <div className="calculator-button-row">
                <button className="calculator-button c1" onClick={() => appendToInput('.')}><span className="big">.</span></button>  
                <button className="calculator-button c2" onClick={() => appendToInput('°C')}>°C</button>
                <button className="calculator-button c2" onClick={() => appendToInput('°F')}>°F</button>
                <button className="calculator-button c2" onClick={() => appendToInput('K')}>K</button>
              </div>
              <div className="calculator-button-row">
                <button className="calculator-button c1" onClick={toggleSign}><span className="big">+/–</span></button>  
                <button className="calculator-button c3" onClick={insertANS}>ANS</button>
                <button className="calculator-button c3" onClick={deleteLastChar}>DEL</button>
                <button className="calculator-button c3" onClick={clearInput}>CLR</button>
              </div>
              <div className="calculator-button-row">
                <button className="calculator-button c4" onClick={() => appendToInput('7')}>7</button>  
                <button className="calculator-button c4" onClick={() => appendToInput('8')}>8</button>
                <button className="calculator-button c4" onClick={() => appendToInput('9')}>9</button>
                <button className="calculator-button c5" onClick={() => appendToInput('÷')}><span className="big">÷</span></button>
              </div>
              <div className="calculator-button-row">
                <button className="calculator-button c4" onClick={() => appendToInput('4')}>4</button>  
                <button className="calculator-button c4" onClick={() => appendToInput('5')}>5</button>
                <button className="calculator-button c4" onClick={() => appendToInput('6')}>6</button>
                <button className="calculator-button c5" onClick={() => appendToInput('×')}><span className="big">×</span></button>
              </div>
              <div className="calculator-button-row">
                <button className="calculator-button c4" onClick={() => appendToInput('1')}>1</button>  
                <button className="calculator-button c4" onClick={() => appendToInput('2')}>2</button>
                <button className="calculator-button c4" onClick={() => appendToInput('3')}>3</button>
                <button className="calculator-button c5" onClick={() => appendToInput('-')}><span className="big">–</span></button>
              </div>
              <div className="calculator-button-row">
                <button className="calculator-button c1" onClick={() => appendToInput('(')}>(</button>  
                <button className="calculator-button c4" onClick={() => appendToInput('0')}>0</button>
                <button className="calculator-button c1" onClick={() => appendToInput(')')}>)</button>
                <button className="calculator-button c5" onClick={() => appendToInput('+')}><span className="big">+</span></button>
              </div>
              <button className="calculate-button" onClick={handleCalculate}>Calculate</button>
            </div>
          </div>
          <div className="button-div">
            <button className="side-button theme"> <BsMoon /> </button>
            <button className="side-button history"> <BsClockHistory /> </button>
          </div>
        </div>

        <div className="right-div">
          <div className="inner-right-div">
            {/* History will go here later */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;