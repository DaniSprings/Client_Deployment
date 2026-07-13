import BrandGrid from '../Components/BrandGrid.jsx';
import PopUpModal from '../Components/Pop-upModal.jsx';
import './Brands.css';

//all constant and declared variables have been to moved to the BrandGrid component
function Brands() {
  return (
    <section className="GridContainer">
      <main className="GridLayout" style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: 16 }}>Brands</h1>
        <BrandGrid />
      </main>
    </section>
  );
}

export default Brands;
