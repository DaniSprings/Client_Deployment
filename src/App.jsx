import './App.css';
import { lazy, Suspense } from 'react';
import { Analytics } from "@vercel/analytics/react";
import Navbar from './Components/Navbar.jsx';
import Footer from './Components/Footer.jsx';
import AdBanner from './Components/AdBanner.jsx';
import NotFound from './Pages/NotFound.jsx';
import { Routes, Route } from 'react-router-dom';
import { useWindowSize } from './hooks/useWindowSize.js';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Forms from './Components/Forms.jsx';

const Home = lazy(() => import('./Pages/Home.jsx'));
const CarStats = lazy(() => import('./Pages/CarStats.jsx'));
const RevCalculator = lazy(() => import('./Pages/RevCalculator.jsx'));
const Revdistance = lazy(() => import('./Pages/RevDistance.jsx'));
const Brands = lazy(() => import('./Pages/Brands.jsx'));
const SearchResults = lazy(() => import('./Pages/SearchResults.jsx'));
const Login = lazy(() => import('./Pages/Login.jsx'));

const PrivacyPolicy = lazy(() => import('./Pages/PrivacyPolicy.jsx'));

function App() {
  const { width } = useWindowSize();
  const viewportClass = width <= 760 ? 'app-mobile' : width <= 1024 ? 'app-tablet' : 'app-desktop';
  return (
    <>
      <Navbar />
      <div className={`App ${viewportClass}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element element={<Home/>} />
            <Route path="/Home" element={<Home />} />
            <Route path="/Brands" element={<Brands />} />
            <Route path="/CarStats" element={<CarStats />} />
            <Route path="/Results" element={<SearchResults />} />
            <Route path="/login" element={<Login />} />
            <Route path="/RevCalculator" element={<RevCalculator />} />
            <Route path="/Revdistance" element={<Revdistance />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
          </Routes>
        </Suspense>
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
