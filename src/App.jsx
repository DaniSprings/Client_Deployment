import './App.css';
import Home from './Pages/Home.jsx';
import CarStats from './Pages/CarStats.jsx';
import RevCalculator from './Pages/RevCalculator.jsx';
import Revdistance from './Pages/RevDistance.jsx';
import Brands from './Pages/Brands.jsx';
import { Analytics } from "@vercel/analytics/react";
import Navbar from './Components/Navbar.jsx';
import Footer from './Components/Footer.jsx';
import AdBanner from './Components/AdBanner.jsx';
import SearchResults from './Pages/SearchResults.jsx';
import NotFound from './Pages/NotFound.jsx';
import { Routes, Route } from 'react-router-dom';
import { useWindowSize } from './hooks/useWindowSize.js';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Forms from './Components/Forms.jsx';

function App() {
  const { width } = useWindowSize();
  const viewportClass = width <= 760 ? 'app-mobile' : width <= 1024 ? 'app-tablet' : 'app-desktop';

  return (
    <>
      <Navbar />
      <div className={`App ${viewportClass}`}>
        <Routes>
          <Route exact path="/Home" element={<Home />} />
          <Route path="/Brands" element={<Brands />} />
          <Route path="/CarStats" element={<CarStats />} />
          <Route path="/Results" element={<SearchResults />} />
          <Route path="/RevCalculator" element={<RevCalculator />} />
          <Route path="/Revdistance" element={<Revdistance />} />
          <Route exact path="*" element={<NotFound />} />
        </Routes>     
        <Analytics />
        <AdBanner />
        <Forms />
        <Footer />
        <SpeedInsights />
      </div>
    </>
  );
}

export default App;
