import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import './VehicleSpecsTable.css';

const COLLAPSIBLE_SECTIONS = new Set(['Performance', 'Dimensions']);

const formatValue = (value) => {
    if (value === null || value === undefined || value === '') {
        return 'N/A';
    }

    return String(value);
};

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') {
        return 'N/A';
    }

    const numeric = Number(value);

    if (Number.isNaN(numeric)) {
        return String(value);
    }

    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR'
    }).format(numeric);
};

const SPEC_SECTIONS = [
    {
        key: 'Overview',
        title: 'Overview',
        rows: [
            { label: 'Brand', getValue: (vehicle) => formatValue(vehicle.brand) },
            { label: 'Model Name', getValue: (vehicle) => formatValue(vehicle.model) },
            { label: 'Price', getValue: (vehicle) => formatCurrency(vehicle.price) },
            { label: 'Price Status', getValue: (vehicle) => formatValue(vehicle.priceStatus) },
            { label: 'price_excl_emissions_tax', getValue: (vehicle) => formatValue(vehicle.priceExclEmissionsTax) },
            { label: 'Engine', getValue: (vehicle) => formatValue(vehicle.engine) },
        ]
    },
    {
        key: 'Performance',
        title: 'Performance',
        rows: [
            { label: 'Cylinders', getValue: (vehicle) => formatValue(vehicle.cylinders) },
            { label: 'Power', getValue: (vehicle) => formatValue(vehicle.power) },
            { label: 'Torque', getValue: (vehicle) => formatValue(vehicle.torque) },
            { label: 'Top Speed', getValue: (vehicle) => formatValue(vehicle.topSpeed) },
            { label: 'Acceleration', getValue: (vehicle) => formatValue(vehicle.acceleration) },
            { label: 'Fuel Consumption', getValue: (vehicle) => formatValue(vehicle.fuelConsumption) },
            { label: 'Fuel Range', getValue: (vehicle) => formatValue(vehicle.fuelRange) },
        ]
    },
    {
        key: 'Dimensions',
        title: 'Dimensions',
        rows: [
            { label: 'length', getValue: (vehicle) => formatValue(vehicle.length) },
            { label: 'width_excl_mirrors_incl_mirrors', getValue: (vehicle) => formatValue(vehicle.widthExclMirrorsInclMirrors) },
            { label: 'Height', getValue: (vehicle) => formatValue(vehicle.height) },
            { label: 'Wheelbase', getValue: (vehicle) => formatValue(vehicle.wheelbase) },
            { label: 'Ground Clearance', getValue: (vehicle) => formatValue(vehicle.groundClearance) },
        ]
    }
];

function VehicleSpecsTable({ vehicles = [] }) {
    const [collapsedSections, setCollapsedSections] = useState({
        Performance: false,
        Dimensions: false
    });

    const visibleSections = useMemo(() => SPEC_SECTIONS.filter((section) => section.rows.some((row) => (
        vehicles.some((vehicle) => row.getValue(vehicle) !== 'N/A')
    ))), [vehicles]);

    const toggleSection = (sectionKey) => {
        if (!COLLAPSIBLE_SECTIONS.has(sectionKey)) {
            return;
        }

        setCollapsedSections((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    if (!vehicles.length) {
        return null;
    }

    return (
        <div className="vehicle-specs-table-shell">
            <div className="vehicle-specs-table-wrapper">
                <table className="vehicle-specs-table">
                    <thead>
                        <tr>
                            <th>Specification</th>
                            {vehicles.map((vehicle, index) => (
                                <th key={`${vehicle.brand}-${vehicle.model}-${index}`}>
                                    <div className="vehicle-specs-column-heading">
                                        <span>{vehicle.brand || 'Unknown Brand'}</span>
                                        <strong>{vehicle.model || 'Unknown Model'}</strong>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleSections.map((section) => {
                            const isCollapsed = Boolean(collapsedSections[section.key]);
                            const isCollapsible = COLLAPSIBLE_SECTIONS.has(section.key);

                            return (
                                <FragmentSection
                                    key={section.key}
                                    section={section}
                                    vehicles={vehicles}
                                    isCollapsed={isCollapsed}
                                    isCollapsible={isCollapsible}
                                    onToggle={toggleSection}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FragmentSection({ section, vehicles, isCollapsed, isCollapsible, onToggle }) {
    return (
        <>
            <tr className="vehicle-specs-section-row">
                <th colSpan={vehicles.length + 1}>
                    {isCollapsible ? (
                        <button
                            type="button"
                            className="vehicle-specs-section-toggle"
                            onClick={() => onToggle(section.key)}
                            aria-expanded={!isCollapsed}
                        >
                            <span>{section.title}</span>
                            <span>{isCollapsed ? 'Show' : 'Hide'}</span>
                        </button>
                    ) : (
                        <span className="vehicle-specs-section-label">{section.title}</span>
                    )}
                </th>
            </tr>
            {!isCollapsed && section.rows.map((row) => (
                <tr key={`${section.key}-${row.label}`} className="vehicle-specs-data-row">
                    <th scope="row" className="vehicle-specs-label-cell">{row.label}</th>
                    {vehicles.map((vehicle, index) => (
                        <td key={`${section.key}-${row.label}-${vehicle.brand}-${vehicle.model}-${index}`} className="vehicle-specs-value-cell">
                            {row.getValue(vehicle)}
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

FragmentSection.propTypes = {
    section: PropTypes.shape({
        key: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        rows: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string.isRequired,
            getValue: PropTypes.func.isRequired,
        })).isRequired,
    }).isRequired,
    vehicles: PropTypes.arrayOf(PropTypes.object).isRequired,
    isCollapsed: PropTypes.bool.isRequired,
    isCollapsible: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
};

VehicleSpecsTable.propTypes = {
    vehicles: PropTypes.arrayOf(PropTypes.shape({
        brand: PropTypes.string,
        model: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        priceStatus: PropTypes.string,
        priceExclEmissionsTax: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        engine: PropTypes.string,
        cylinders: PropTypes.string,
        power: PropTypes.string,
        torque: PropTypes.string,
        topSpeed: PropTypes.string,
        acceleration: PropTypes.string,
        fuelConsumption: PropTypes.string,
        fuelRange: PropTypes.string,
        length: PropTypes.string,
        widthExclMirrorsInclMirrors: PropTypes.string,
        height: PropTypes.string,
        wheelbase: PropTypes.string,
        groundClearance: PropTypes.string,
    })),
};

export default VehicleSpecsTable;