import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PopUpModal from './Pop-upModal.jsx';
import { getBrandModelFamilies } from '../utils/brandModelCatalog.js';
import './BrandGrid.css';

const brands = [
  // Row 1
  [
    { name: "Alfa Romeo", src: "https://i.ibb.co/YTPn1VMF/ALFA-ROMEO-1.png" },
    { name: "Ashok Leyland", src: "https://i.ibb.co/2yW1RdB/ASHOKLEY-NS.png" },
    { name: "Aston Martin", src: "https://i.ibb.co/NrxWq4b/Aston-Martin-Logo-960x540.png" },
    { name: "Audi", src: "https://i.ibb.co/jJfx3t5/AUDI.jpg" },
  ],
  // Row 2
  [
    { name: "BAIC", src: "https://i.ibb.co/2dwg9Bv/BAIC-Logo-Vector-svg.png" },
    { name: "Bentley", src: "https://i.ibb.co/jR5Vbkp/bentley-logo-png-transparent.png" },
    { name: "BMW", src: "https://i.ibb.co/YBrwh0Kg/BMW-1.png" },
    { name: "BYD", src: "https://i.ibb.co/3SYqML6/BYD-Logo.png" },
  ],
  // Row 3
  [
    { name: "Cherry", src: "https://i.ibb.co/Y0tYmKQ/Cherry-1.jpg" },
    { name: "Citroen", src: "https://i.ibb.co/0DkLvzR/Citroen-Logo.png" },
    { name: "Dayun", src: "https://i.ibb.co/M8tLGqz/Dayun.png" },
    { name: "Ferrari", src: "https://i.ibb.co/NmkSm7x/Ferrari-Logo.png" },
  ],
  // Row 4
  [
    { name: "Fiat", src: "https://i.ibb.co/1Lkwkx1/Fiat-Logo.png" },
    { name: "Ford", src: "https://i.ibb.co/ZCs6MxW/Ford-1.png" },
    { name: "Foton", src: "https://i.ibb.co/TtykNPv/Foton-Motor-Logo.png" },
    { name: "GAC", src: "https://i.ibb.co/bgb36Rt8/GAC-1.png" },
  ],
  // Row 5
  [
    { name: "GWM", src: "https://i.ibb.co/3vCg8hL/GWM.png" },
    { name: "Haval", src: "https://i.ibb.co/KbYMg5m/Haval.png" },
    { name: "Honda", src: "https://i.ibb.co/rHpQ7tM/Honda-Logo.png" },
    { name: "Hyundai", src: "https://i.ibb.co/Yp05cBw/Hyundai.png" },
  ],
  // Row 6
  [
    { name: "Ineos", src: "https://i.ibb.co/GvTqv50/INEOS.png" },
    { name: "Isuzu", src: "https://i.ibb.co/ctKG71G/Isuzu-logo.png" },
    { name: "JAC", src: "https://i.ibb.co/N3Q655G/JAC-logo.jpg" },
    { name: "Jaecoo", src: "https://i.ibb.co/6R1yGVR/Jaecoo-wordmark-svg.png" },
  ],
  // Row 7
  [
    { name: "Jaguar", src: "https://i.ibb.co/XZXLwRT/Jaguar.jpg" },
    { name: "Jeep", src: "https://i.ibb.co/CtXTQpP/Jeep-logo-svg.png" },
    { name: "Jetour", src: "https://i.ibb.co/LCKZN0y/Jetour-logo-svg.png" },
    { name: "KIA", src: "https://i.ibb.co/yFDJ4CFr/KIA-1.jpg" },
  ],
  // Row 8
  [
    { name: "Lamborghini", src: "https://i.ibb.co/Jk6LZ72/Lamborghini-Logo-svg.png" },
    { name: "Land-Rover", src: "https://i.ibb.co/ZHWs6Mc/Land-rover-logo-carbone.jpg" },
    { name: "Lexus", src: "https://i.ibb.co/vs52wn5/LEXUS.jpg" },
    { name: "Mahindra", src: "https://i.ibb.co/YjB5Mc3/mahindra-new-logo-png-image.png" },
  ],
  // Row 9
  [
    { name: "Maserati", src: "https://i.ibb.co/qrSBRCY/Maserati-Logo-768x432.png" },
    { name: "Mazda", src: "https://i.ibb.co/FVgsT9S/Mazda.png" },
    { name: "Mclaren", src: "https://i.ibb.co/Z27SYj3/Mc-Laren-Logo.png" },
    { name: "Mercedes-Benz AMG", src: "https://i.ibb.co/G46Pz2rx/mercedes-benz-amg-white-logo-1.png" },
  ],
  // Row 10
  [
    { name: "Mercedes-Benz", src: "https://i.ibb.co/R9sHTMy/Mercedes-Benz-logo-2-svg.png" },
    { name: "Mercedes-Benz-Maybach", src: "https://i.ibb.co/7tMK8px/Mercedes-Benz-Maybach.png" },
    { name: "Mini", src: "https://i.ibb.co/TghGLPP/MINI.png" },
    { name: "Mitsubishi", src: "https://i.ibb.co/RDN2dx7/Mitsubishi-logo.png" },
  ],
  // Row 11
  [
    { name: "Nissan", src: "https://i.ibb.co/0pnFVZhj/Nissan-1.png" },
    { name: "Omoda", src: "https://i.ibb.co/x39mgKp/Omoda.png" },
    { name: "Opel", src: "https://i.ibb.co/sCVx9vr/Opel.jpg" },
    { name: "Peugeot", src: "https://i.ibb.co/3Tqw9S2/Peugeot.jpg" },
  ],
  // Row 12
  [
    { name: "Porsche", src: "https://i.ibb.co/zHPHfHK/Porsche-Monochrome-icon.png" },
    { name: "Proton", src: "https://i.ibb.co/PYJh4Lc/PROTON.png" },
    { name: "Renault", src: "https://i.ibb.co/yk3mTKd/Renault.png" },
    { name: "Rolls Royce", src: "https://i.ibb.co/gDQ7nZC/Rolls-Royce.png" },
  ],
  // Row 13
  [
    { name: "Subaru", src: "https://i.ibb.co/fMHCGNs/SUBARU.png" },
    { name: "Suzuki", src: "https://i.ibb.co/RBSMDWt/Suzuki.png" },
    { name: "Toyota", src: "https://i.ibb.co/3R3jy9x/Toyota.png" },
    { name: "Volkswagen", src: "https://i.ibb.co/4fnrRZ6/VW.png" },
  ],
  // Row 14
  [{ name: "Volvo", src: "https://i.ibb.co/JFLVrqb/VOLVO.png" }],
];

// add caption for each brand (fallback to name) so a name appears below every brand image
brands.forEach(row => row.forEach(brand => { if (!brand.caption) brand.caption = brand.name; }));

/**
 * Renders the full grid of brand logos, along with the brand/model
 * selection modal. Fully self-contained — no props required.
 */
function BrandGrid() {
  const navigate = useNavigate();
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [currentBrandLabel, setCurrentBrandLabel] = useState("");
  const [selectedFamilyLabel, setSelectedFamilyLabel] = useState('');

  const currentBrandFamilies = useMemo(
    () => getBrandModelFamilies(currentBrandLabel),
    [currentBrandLabel]
  );

  const activeFamily = currentBrandFamilies.find(
    ({ familyLabel }) => familyLabel === selectedFamilyLabel
  ) || null;

  const modalItems = selectedFamilyLabel
    ? (activeFamily?.models || [])
    : currentBrandFamilies;

  const modalTitle = selectedFamilyLabel
    ? `${currentBrandLabel} ${selectedFamilyLabel}`
    : `Car Models - ${currentBrandLabel}`;

  function showModelModal(brandKey) {
    // Convert underscores and hyphens to spaces for database query
    const brandName = brandKey.replace(/[_-]/g, " ");
    setCurrentBrandLabel(brandName);
    setSelectedFamilyLabel('');
    setModelModalOpen(true);
  }

  function closeAll() {
    setSelectedFamilyLabel('');
    setModelModalOpen(false);
  }

  function showModelFamily(familyLabel) {
    setSelectedFamilyLabel(familyLabel);
  }

  function backToFamilyList() {
    setSelectedFamilyLabel('');
  }

  function handleModalItemClick(item) {
    if (selectedFamilyLabel) {
      navigate(`/CarStats?make=${encodeURIComponent(currentBrandLabel)}&model=${encodeURIComponent(item)}`);
      closeAll();
      return;
    }

    showModelFamily(item.familyLabel);
  }

  function renderModalItem(item) {
    if (selectedFamilyLabel) {
      return <strong>{item}</strong>;
    }

    return (
      <>
        <strong>{item.familyLabel}</strong>
        <span style={{ float: 'right', color: '#999' }}>{item.models.length}</span>
      </>
    );
  }

  function getModalItemKey(item, index) {
    if (selectedFamilyLabel) {
      return `${item}-${index}`;
    }

    return `${item.familyLabel}-${index}`;
  }

  return (
    <>
      <div className="brands-wrapper">
        {brands.map((row, rowIndex) => (
          <div key={rowIndex} className="brand-row">
            {row.map((brand) => {
              const key = brand.name.replace(/\s+/g, "_");
              return (
                <div
                  key={brand.name}
                  className="brand-block"
                  data-brand={key}
                  onClick={() => showModelModal(key)}
                >
                  <img
                    src={brand.src}
                    alt={brand.name}
                    className="brand-logo img-brand"
                  />
                  <p className="brand-name">{brand.name}</p>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <PopUpModal
        isOpen={modelModalOpen}
        title={modalTitle}
        items={modalItems}
        emptyMessage="No models available"
        onClose={closeAll}
        onBack={selectedFamilyLabel ? backToFamilyList : undefined}
        onItemClick={handleModalItemClick}
        renderItem={renderModalItem}
        getItemKey={getModalItemKey}
      />
    </>
  );
}

export default BrandGrid;
