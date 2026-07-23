import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import './VehicleSpecsTable.css';

const COLLAPSIBLE_SECTIONS = new Set([
    'Performance',
    'Dimensions',
    'Towing',
    'Safety',
    'Extras',
    'Service',
]);

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
        currency: 'ZAR',
    }).format(numeric);
};

const SPEC_SECTIONS = [
    {
        key: 'Overview',
        title: 'Overview',
        rows: [
            { label: 'Brand',   getValue: (v) => formatValue(v.brand) },
            { label: 'Model',   getValue: (v) => formatValue(v.model) },
            { label: 'Price',   getValue: (v) => formatCurrency(v.price) },
            { label: 'Engine',  getValue: (v) => formatValue(v.engine) },
        ],
    },
    {
        key: 'Performance',
        title: 'Performance',
        rows: [
            { label: 'Cylinders',        getValue: (v) => formatValue(v.cylinders) },
            { label: 'Fuel Type',        getValue: (v) => formatValue(v.fuel) },
            { label: 'Power',            getValue: (v) => formatValue(v.power) },
            { label: 'Torque',           getValue: (v) => formatValue(v.torque) },
            { label: 'Top Speed',        getValue: (v) => formatValue(v.topSpeed) },
            { label: 'Acceleration',     getValue: (v) => formatValue(v.acceleration) },
            { label: 'Fuel Consumption', getValue: (v) => formatValue(v.fuelConsumption) },
            { label: 'Fuel Range',       getValue: (v) => formatValue(v.fuelRange) },
        ],
    },
    {
        key: 'Dimensions',
        title: 'Dimensions',
        rows: [
            { label: 'Length',           getValue: (v) => formatValue(v.length) },
            { label: 'Width (excl/incl mirrors)', getValue: (v) => formatValue(v.widthExclMirrorsInclMirrors) },
            { label: 'Height',           getValue: (v) => formatValue(v.height) },
            { label: 'Wheelbase',        getValue: (v) => formatValue(v.wheelbase) },
            { label: 'Ground Clearance', getValue: (v) => formatValue(v.groundClearance) },
        ],
    },
    {
        key: 'Towing',
        title: 'Towing & Mass',
        rows: [
            { label: 'Kerb Weight (EU)',      getValue: (v) => formatValue(v.kerbWeight) },
            { label: 'Dry Weight (DIN)',      getValue: (v) => formatValue(v.dryWeight) },
            { label: 'GVM',                   getValue: (v) => formatValue(v.gvm) },
            { label: 'Payload Capacity',      getValue: (v) => formatValue(v.payloadCapacity) },
            { label: 'Load Volume',           getValue: (v) => formatValue(v.loadVolume) },
            { label: 'Towing (Braked)',       getValue: (v) => formatValue(v.towingBraked) },
            { label: 'Towing (Unbraked)',     getValue: (v) => formatValue(v.towingUnbraked) },
            { label: 'Towbar Fitted',         getValue: (v) => formatValue(v.towbarFitted) },
            { label: 'Wading Depth',          getValue: (v) => formatValue(v.wadingDepth) },
        ],
    },
    {
        key: 'Safety',
        title: 'Safety',
        rows: [
            { label: 'Airbag Quantity',          getValue: (v) => formatValue(v.airbagQuantity) },
            { label: 'Driver Airbag',            getValue: (v) => formatValue(v.driverAirbag) },
            { label: 'Front Passenger Airbag',   getValue: (v) => formatValue(v.frontPassengerAirbag) },
            { label: 'Front Side Airbags',       getValue: (v) => formatValue(v.frontSideAirbags) },
            { label: 'Rear Side Airbags',        getValue: (v) => formatValue(v.rearSideAirbags) },
            { label: 'Curtain Airbags',          getValue: (v) => formatValue(v.curtainAirbags) },
            { label: 'Driver Knee Airbag',       getValue: (v) => formatValue(v.driverKneeAirbag) },
            { label: 'ISOFIX Mountings',         getValue: (v) => formatValue(v.isofixMountings) },
            { label: 'Collision Warning',        getValue: (v) => formatValue(v.collisionWarning) },
        ],
    },
    {
        key: 'Extras',
        title: 'Features & Extras',
        rows: [
            { label: 'Air Conditioning',         getValue: (v) => formatValue(v.airConditioning) },
            { label: 'Navigation',               getValue: (v) => formatValue(v.navigation) },
            { label: 'Cruise Control',           getValue: (v) => formatValue(v.cruiseControl) },
            { label: 'Adaptive Cruise Control',  getValue: (v) => formatValue(v.adaptiveCruiseControl) },
            { label: 'Bluetooth',                getValue: (v) => formatValue(v.bluetooth) },
            { label: 'USB Port',                 getValue: (v) => formatValue(v.usbPort) },
            { label: 'Leather Upholstery',       getValue: (v) => formatValue(v.leatherUpholstery) },
            { label: 'Electric Driver Seat',     getValue: (v) => formatValue(v.electricDriverSeat) },
            { label: 'Head-Up Display',          getValue: (v) => formatValue(v.headUpDisplay) },
            { label: 'Lane Departure Warning',   getValue: (v) => formatValue(v.laneDepartureWarning) },
            { label: 'Heated Rear Screen',       getValue: (v) => formatValue(v.heatedRearScreen) },
        ],
    },
    {
        key: 'Service',
        title: 'Service & Warranty',
        rows: [
            { label: 'Warranty',            getValue: (v) => formatValue(v.warrantyYears) && formatValue(v.warrantyDistance) !== 'N/A'
                ? `${formatValue(v.warrantyYears)} yrs / ${formatValue(v.warrantyDistance)} km`
                : formatValue(v.warrantyYears) },
            { label: 'Service Plan',        getValue: (v) => formatValue(v.servicePlanYears) !== 'N/A' || formatValue(v.servicePlanDistance) !== 'N/A'
                ? `${formatValue(v.servicePlanYears)} yrs / ${formatValue(v.servicePlanDistance)} km`
                : 'N/A' },
            { label: 'Maintenance Plan',    getValue: (v) => formatValue(v.maintenancePlanYears) !== 'N/A' || formatValue(v.maintenancePlanDistance) !== 'N/A'
                ? `${formatValue(v.maintenancePlanYears)} yrs / ${formatValue(v.maintenancePlanDistance)} km`
                : 'N/A' },
            { label: 'Service Interval',    getValue: (v) => formatValue(v.serviceIntervalDistance) },
        ],
    },
];

function VehicleSpecsTable({ vehicles = [] }) {
    const [collapsedSections, setCollapsedSections] = useState({
        Performance: false,
        Dimensions:  false,
        Towing:      false,
        Safety:      false,
        Extras:      false,
        Service:     false,
    });

    const visibleSections = useMemo(
        () =>
            SPEC_SECTIONS.filter((section) =>
                section.rows.some((row) =>
                    vehicles.some((vehicle) => row.getValue(vehicle) !== 'N/A'),
                ),
            ),
        [vehicles],
    );

    const toggleSection = (sectionKey) => {
        if (!COLLAPSIBLE_SECTIONS.has(sectionKey)) return;
        setCollapsedSections((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey],
        }));
    };

    if (!vehicles.length) return null;

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
                        {visibleSections.map((section) => (
                            <FragmentSection
                                key={section.key}
                                section={section}
                                vehicles={vehicles}
                                isCollapsed={Boolean(collapsedSections[section.key])}
                                isCollapsible={COLLAPSIBLE_SECTIONS.has(section.key)}
                                onToggle={toggleSection}
                            />
                        ))}
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
            {!isCollapsed &&
                section.rows.map((row) => (
                    <tr
                        key={`${section.key}-${row.label}`}
                        className="vehicle-specs-data-row"
                    >
                        <th scope="row" className="vehicle-specs-label-cell">
                            {row.label}
                        </th>
                        {vehicles.map((vehicle, index) => (
                            <td
                                key={`${section.key}-${row.label}-${vehicle.brand}-${vehicle.model}-${index}`}
                                className="vehicle-specs-value-cell"
                            >
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
        rows: PropTypes.arrayOf(
            PropTypes.shape({
                label: PropTypes.string.isRequired,
                getValue: PropTypes.func.isRequired,
            }),
        ).isRequired,
    }).isRequired,
    vehicles: PropTypes.arrayOf(PropTypes.object).isRequired,
    isCollapsed: PropTypes.bool.isRequired,
    isCollapsible: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
};

VehicleSpecsTable.propTypes = {
    vehicles: PropTypes.arrayOf(
        PropTypes.shape({
            brand: PropTypes.string,
            model: PropTypes.string,
            price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            engine: PropTypes.string,
            cylinders: PropTypes.string,
            fuel: PropTypes.string,
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
            // Towing
            towingBraked: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            towingUnbraked: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            kerbWeight: PropTypes.string,
            gvm: PropTypes.string,
            loadVolume: PropTypes.string,
            dryWeight: PropTypes.string,
            payloadCapacity: PropTypes.string,
            towbar: PropTypes.string,
            waterdepth: PropTypes.string,
            // Safety
            airbagQuantity: PropTypes.string,
            driverAirbag: PropTypes.string,
            frontPassengerAirbag: PropTypes.string,
            frontSideAirbags: PropTypes.string,
            rearSideAirbags: PropTypes.string,
            curtainAirbags: PropTypes.string,
            driverKneeAirbag: PropTypes.string,
            isofixMountings: PropTypes.string,
            collisionWarning: PropTypes.string,
            // Extras
            airConditioning: PropTypes.string,
            navigation: PropTypes.string,
            cruiseControl: PropTypes.string,
            adaptiveCruiseControl: PropTypes.string,
            bluetooth: PropTypes.string,
            usbPort: PropTypes.string,
            leatherUpholstery: PropTypes.string,
            electricDriverSeat: PropTypes.string,
            headUpDisplay: PropTypes.string,
            laneDepartureWarning: PropTypes.string,
            heatedRearScreen: PropTypes.string,
            // Service
            warrantyYears: PropTypes.string,
            warrantyDistance: PropTypes.string,
            servicePlanYears: PropTypes.string,
            servicePlanDistance: PropTypes.string,
            maintenancePlanYears: PropTypes.string,
            maintenancePlanDistance: PropTypes.string,
            serviceIntervalDistance: PropTypes.string,
        }),
    ),
};

export default VehicleSpecsTable;
