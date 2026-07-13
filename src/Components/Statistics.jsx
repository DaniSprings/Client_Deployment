import React, { useEffect, useRef, useState } from "react";
import "./Statistics.css";

const statsData = [
  {
    label: "ACTIVE MODELS",
    value: 1527,
    suffix: "",
  },
  {
    label: "MANUFACTURERS",
    value: 62,
    suffix: "",
  },
  {
    label: "SPEC PARAMETERS",
    value: 85,
    suffix: "+",
  },
  {
    label: "DATA REFRESH",
    value: 0,
    display: "REAL-TIME",
  },
];

function CountUp({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      const value = Math.floor(progress * end);

      setCount(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

function Statistics() {
  const sectionRef = useRef(null);
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartAnimation(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.3,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="statistics-section">
      <div className="statistics-container">
        {statsData.map((item, index) => (
          <div
            key={index}
            className="stat-card"
          >
            <p className="stat-label">
              {item.label}
            </p>

            <h2 className="stat-value">
              {item.display ? (
                item.display
              ) : startAnimation ? (
                <CountUp
                  end={item.value}
                  suffix={item.suffix}
                />
              ) : (
                "0"
              )}
            </h2>
          </div>
        ))}
      </div>
    </section>
  );
}
export default Statistics;