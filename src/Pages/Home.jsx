import React from 'react'; 
import './Home.css';
import AboutBanner from '../Components/AboutBanner.jsx'
import Statistics from '../Components/Statistics.jsx'
import AdBanner from '../Components/AdBanner.jsx'
import Forms from '../Components/Forms.jsx'
import { Form } from 'react-router-dom';

function Home() {

  return (
    <>
    <Statistics />
    <AboutBanner />
    </>
  );
}
export default Home;