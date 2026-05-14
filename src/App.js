import './App.css';
import { BsMoon, BsClockHistory, BsSun } from 'react-icons/bs';
import { useCalculator } from './hooks/useCalculator';

function App() {
  const {
    inputValue,
    displayValue,
    celsius,
    fahrenheit,
    kelvin,
    isValid,
    mercuryHeight,
    appendToInput,
    clearInput,
    deleteLastChar,
    toggleSign,
    insertANS,
    handleCalculate,
    theme,
    toggleTheme,
  } = useCalculator();

  const getMercuryColor = (celsius) => {
    if (celsius === null) return 'var(--mercury-default)';
    if (celsius <= 0) return '#6B9FD9';
    if (celsius >= 50) return '#D75353';
    return 'var(--mercury-default)';
  };

  const getLightBGColor = (celsius, theme) => {
    if (celsius === null) return theme === 'light' ? '#D1D5DB' : '#a2a9b5';
    if (celsius <= 0) return theme === 'light' ? '#AAC6DC' : '#1E3A5F';
    if (celsius >= 50) return theme === 'light' ? '#D79F93' : '#5C2E2E';
    return '#D1D5DB';
  };

  const getButtonColor = (celsius, theme) => {
    if (celsius === null) return 'var(--side-button)';
    if (celsius <= 0) return theme === 'light' ? '#D9E4ED' : '#4A8BCE';
    if (celsius >= 50) return theme === 'light' ? '#EDEBD9' : '#C23B3B';
    return 'var(--side-button)';
  };

  return (
    <div className="background">
      <div className="div-container">
        <div className="left-div">
          <div className="thermometer-container">
            <div className="thermometer-glass"
              style={{ borderColor: getLightBGColor(celsius, theme),
               }}
            >
              <div className="mercury">
                <div 
                  className="mercury-tube" 
                  style={{
                    height: `${mercuryHeight}px`,
                    backgroundColor: getMercuryColor(celsius)
                  }}
                ></div>
                <div
                  className="mercury-bulb"
                  style={{
                    backgroundColor: getMercuryColor(celsius),
                    borderColor: getLightBGColor(celsius, theme)
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="calculator-div"
            style={{ backgroundColor: getLightBGColor((celsius), theme) }}>
            <div className="calculator-upper-div">
              <div className="calculator-title">
                <h1>Temperature Calculator</h1>
              </div>
              <div className="calculator-input-screen">
                <p style={{ color: isValid ? 'var(--text-secondary)' : '#D75353' }}>
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
              <div className="calculator-buttons-grid">
                <button className="calculator-button c1" onClick={() => appendToInput('.')}><span className="big">.</span></button>  
                <button className="calculator-button c2" onClick={() => appendToInput('°C')}
                  style={{ backgroundColor: getButtonColor(celsius, theme) }}>°C</button>
                <button className="calculator-button c2" onClick={() => appendToInput('°F')} 
                  style={{ backgroundColor: getButtonColor(celsius, theme) }}>°F</button>
                <button className="calculator-button c2" onClick={() => appendToInput('K')} 
                  style={{ backgroundColor: getButtonColor(celsius, theme) }}>K</button>
                <button className="calculator-button c1" onClick={toggleSign}><span className="big">+/–</span></button>  
                <button className="calculator-button c3" onClick={insertANS}>ANS</button>
                <button className="calculator-button c3" onClick={deleteLastChar}>DEL</button>
                <button className="calculator-button c3" onClick={clearInput}>CLR</button>
                <button className="calculator-button c4" onClick={() => appendToInput('7')}>7</button>  
                <button className="calculator-button c4" onClick={() => appendToInput('8')}>8</button>
                <button className="calculator-button c4" onClick={() => appendToInput('9')}>9</button>
                <button className="calculator-button c5 double" onClick={() => appendToInput('-')}><span className="big">–</span></button>
                <button className="calculator-button c4" onClick={() => appendToInput('4')}>4</button>  
                <button className="calculator-button c4" onClick={() => appendToInput('5')}>5</button>
                <button className="calculator-button c4" onClick={() => appendToInput('6')}>6</button>
                <button className="calculator-button c4" onClick={() => appendToInput('1')}>1</button>  
                <button className="calculator-button c4" onClick={() => appendToInput('2')}>2</button>
                <button className="calculator-button c4" onClick={() => appendToInput('3')}>3</button>
                <button className="calculator-button c5 double" onClick={() => appendToInput('+')}><span className="big">+</span></button>
                <button className="calculator-button c1" onClick={() => appendToInput('(')}>(</button>  
                <button className="calculator-button c4" onClick={() => appendToInput('0')}>0</button>
                <button className="calculator-button c1" onClick={() => appendToInput(')')}>)</button>
              </div>
              <button className="calculate-button" onClick={handleCalculate}>Calculate</button>
            </div>
          </div>
          <div className="button-div">
            <button className="side-button theme"
              onClick={toggleTheme}
              style={{ backgroundColor: getMercuryColor(celsius) }}
            > 
              {theme === 'light' ? <BsMoon /> : <BsSun />}
            </button>
            <button className="side-button history"
              style={{ backgroundColor: getMercuryColor(celsius) }}
            > 
              <BsClockHistory /> 
            </button>
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