import React, { useState, useEffect } from "react";
import Footer from "../Components/Footer";

function RevCalculator() {
  const [itemPrice, setItemPrice] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [months, setMonths] = useState("");
  const [payment, setPayment] = useState("");
  const [initialP, setInitialP] = useState("");
  const [monthsP, setMonthsP] = useState("");
  const [value, setValue] = useState("");
  const [depreciation, setDepreciation] = useState("");
  const [carName, setCarName] = useState("");

  // helper formatter
  const fmt = (n) =>
    new Intl.NumberFormat("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  // Handle Loan Calculation
  const computeLoan = () => {
    const price = parseFloat(itemPrice);
    const rate = parseFloat(interestRate);
    const term = parseFloat(months);

    if (!price || !term || isNaN(price) || isNaN(rate) || isNaN(term)) {
      setPayment("Please enter valid price, interest rate and months");
      return;
    }

    // simple interest distributed across term: interest per period = (price * rate%) / term
    const interestPerPeriod = (price * (rate * 0.01)) / term;
    const monthly = (price / term + interestPerPeriod);
    setPayment(`Monthly Installment = R${fmt(monthly)}`);
  };

  // Handle Depreciation Calculation (compounded yearly by provided rates)
  const computeDepreciation = () => {
    const price = parseFloat(initialP);
    const term = parseInt(monthsP, 10);

    if (!price || !term || isNaN(price) || isNaN(term)) {
      setValue("Please enter valid initial price and years");
      setDepreciation("");
      return;
    }

    let currentValue = price;
    const yearlyRates = [0.15, 0.13, 0.10, 0.09, 0.08];

    for (let i = 0; i < term && i < yearlyRates.length; i++) {
      currentValue = currentValue * (1 - yearlyRates[i]); // compound depreciation
    }

    const lost = price - currentValue;

    setValue(`Current Value: R${fmt(currentValue)}`);
    setDepreciation(`Amount Lost: R${fmt(lost)}`);
  };

  // Extract URL parameters on load (simulate CarStats.html behavior)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const carNameParam = params.get("name");
    const carPriceParam = params.get("price");

    if (carNameParam) setCarName(carNameParam);
    if (carPriceParam) {
      const cleaned = carPriceParam.replace(/[^0-9.]/g, "");
      if (cleaned) setItemPrice(cleaned);
    }
  }, []);

  return (
    <>
      <div style={{ textAlign: "center", justifyContent: "center", padding: "1rem" }}>
        <div className="Calculator" style={{ marginBottom: "2.5rem" }}>
          {carName && (
            <p>
              <strong>Car Model:</strong> {carName}
            </p>
          )}

          <p>
            Car Price: R{" "}
            <input
              type="number"
              min="1"
              max="10000000"
              placeholder="R"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
            />
          </p>

          <p>
            Interest Rate:
            <input
              type="number"
              min="0"
              max="100"
              step=".01"
              placeholder="%"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </p>

          <p>
            Number of Months:
            <input
              type="number"
              min="1"
              max="720"
              placeholder="months"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
            />
          </p>

          <button onClick={computeLoan}>Calculate Loan</button>
          <h4 style={{ marginTop: 12 }}>{payment || "Monthly Installment"}</h4>
        </div>

        <div className="depreciation" style={{ marginTop: "2rem" }}>
          <p>
            Vehicle Price: R{" "}
            <input
              type="number"
              min="1"
              max="10000000"
              placeholder="R"
              value={initialP}
              onChange={(e) => setInitialP(e.target.value)}
            />
          </p>

          <p>
            Number of Years:
            <input
              type="number"
              min="1"
              max="5"
              placeholder="years"
              value={monthsP}
              onChange={(e) => setMonthsP(e.target.value)}
            />
          </p>

          <button onClick={computeDepreciation}>Calculate Depreciation</button>
          <h4 style={{ marginTop: 12 }}>{value || "Answer"}</h4>
          <p style={{ fontStyle: "italic", color: "red" }}>{depreciation || "Amount Lost"}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default RevCalculator;