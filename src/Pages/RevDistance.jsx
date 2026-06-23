import React, { useState } from 'react';
import Footer from '../Components/Footer';
import Navbar from '../Components/Navbar';
import './RevDistance.css';

function RevDistance() {
  const [fuelType, setFuelType] = useState('unleaded93');
  const [region, setRegion] = useState('inland');
  const [tankSize, setTankSize] = useState('');
  const [result, setResult] = useState(null);

  const fuelPrices = {
    inland: {
      unleaded93: 21.79,
      unleaded95: 22.19,
      diesel: 19.69
    },
    coastal: {
      unleaded93: 21.00,
      unleaded95: 21.40,
      diesel: 18.93
    }
  };

  const handleCalculate = () => {
    const price = fuelPrices[region][fuelType];
    const cost = price * parseFloat(tankSize);
    setResult(cost.toFixed(2));
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="calculator-page">
        <h1>Rev Calculator</h1>
        <div className="petrol-calculator">
          {/* Unleaded 93 Container */}
          <div className="container">
            <h2>Unleaded 93</h2>
            <div className="input-group">
              <label>Select Region</label>
              <select 
                className="option"
                value={fuelType === 'unleaded93' ? region : ''}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setFuelType('unleaded93');
                }}
              >
                <option value="coastal">Coastal</option>
                <option value="inland">Inland</option>
              </select>
            </div>
            <div className="input-group">
              <label>Tank Capacity (Liters)</label>
              <input
                className="tank-size"
                type="number"
                placeholder="Enter tank size"
                value={fuelType === 'unleaded93' ? tankSize : ''}
                onChange={(e) => {
                  setTankSize(e.target.value);
                  setFuelType('unleaded93');
                }}
              />
            </div>
          </div>

          {/* Unleaded 95 Container */}
          <div className="container">
            <h2>Unleaded 95</h2>
            <div className="input-group">
              <label>Select Region</label>
              <select 
                className="option"
                value={fuelType === 'unleaded95' ? region : ''}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setFuelType('unleaded95');
                }}
              >
                <option value="coastal">Coastal</option>
                <option value="inland">Inland</option>
              </select>
            </div>
            <div className="input-group">
              <label>Tank Capacity (Liters)</label>
              <input
                className="tank-size"
                type="number"
                placeholder="Enter tank size"
                value={fuelType === 'unleaded95' ? tankSize : ''}
                onChange={(e) => {
                  setTankSize(e.target.value);
                  setFuelType('unleaded95');
                }}
              />
            </div>
          </div>

          {/* Diesel Container */}
          <div className="container">
            <h2>Diesel</h2>
            <div className="input-group">
              <label>Select Region</label>
              <select 
                className="option"
                value={fuelType === 'diesel' ? region : ''}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setFuelType('diesel');
                }}
              >
                <option value="coastal">Coastal</option>
                <option value="inland">Inland</option>
              </select>
            </div>
            <div className="input-group">
              <label>Tank Capacity (Liters)</label>
              <input
                className="tank-size"
                type="number"
                placeholder="Enter tank size"
                value={fuelType === 'diesel' ? tankSize : ''}
                onChange={(e) => {
                  setTankSize(e.target.value);
                  setFuelType('diesel');
                }}
              />
            </div>
          </div>

          <div className="answer">
            <button className="calculate" onClick={handleCalculate}>
              Calculate Cost
            </button>
            <h3 id="answer">
              {result ? `Total Cost: R ${result}` : 'Select fuel type and enter values'}
            </h3>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default RevDistance;