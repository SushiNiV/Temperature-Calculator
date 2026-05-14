import './App.css';
import { BsMoon, BsClockHistory } from 'react-icons/bs';
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
    handleCalculate
  } = useCalculator();

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
              <div className="calculator-buttons-grid">
                <button className="calculator-button c1" onClick={() => appendToInput('.')}><span className="big">.</span></button>  
                <button className="calculator-button c2" onClick={() => appendToInput('°C')}>°C</button>
                <button className="calculator-button c2" onClick={() => appendToInput('°F')}>°F</button>
                <button className="calculator-button c2" onClick={() => appendToInput('K')}>K</button>
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