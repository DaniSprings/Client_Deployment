import PropTypes from 'prop-types';

const EMPTY_FIELD = <span className="empty-field">-</span>;

{/* Utility functions to format specific fields */}
const formatPrice = (price) => {
    if (!price || price <= 0) {
        return 'N/A';
    }

    return `R${price.toLocaleString()}`;
};

const formatPower = (power) => {
    if (power === null || power === undefined || power === '') {
        return 'N/A';
    }

    if (power === 'TBA') {
        return 'TBA';
    }

    return `${power} kW`;
};

const formatTorque = (torque) => {
    if (torque === null || torque === undefined || torque === '') {
        return 'N/A';
    }

    if (torque === 'TBA') {
        return 'TBA';
    }
    return `${torque} Nm`;
};
const formatTopSpeed = (speed) => {
    if (speed === null || speed === undefined || speed === '') {
        return 'N/A';
    }

    if (speed === 'TBA') {
        return 'TBA';
    }

    return `${speed} km/h`;
};

const formatAcceleration = (acceleration) => {
    if (acceleration === null || acceleration === undefined || acceleration === '') {
        return 'N/A';
    }

    if (acceleration === 'TBA') {
        return 'TBA';
    }

    return `${acceleration} s`;
};

const formatFuelConsumption = (consumption) => {
    if (consumption === null || consumption === undefined || consumption === '') {
        return 'N/A';
    }
    if (consumption === 'TBA') {
        return 'TBA';
    }
    return `${consumption} L/100km`;
};

const formatFuelRange = (range) => {
    if (range === null || range === undefined || range === '') {
        return 'N/A';
    }
    if (range === 'TBA') {
        return 'TBA';
    }
    return `${range} km`;
};

const formatWidth = (dimension) => {
    if (dimension === null || dimension === undefined || dimension === '') {
        return 'N/A';
    }
    if (dimension === 'TBA') {
        return 'TBA';
    }
    return `${dimension} mm`;
};

const formatLength = (dimension) => {
    if (dimension === null || dimension === undefined || dimension === '') {
        return 'N/A';
    }
    if (dimension === 'TBA') {
        return 'TBA';
    }
    return `${dimension} mm`;
};

const renderStatus = (car, lookupState, hasDetails) => {
    if (hasDetails) {
        return <span className="status-complete">Loaded</span>;
    }

    if (lookupState?.status === 'loading') {
        return <span className="status-ready">Searching...</span>;
    }

    if (lookupState?.status === 'not-found') {
        return <span className="status-incomplete">No match found</span>;
    }

    if (lookupState?.status === 'error') {
        return <span className="status-incomplete">Lookup failed</span>;
    }

    if (car.brand && car.model) {
        return <span className="status-ready">Ready</span>;
    }

    return <span className="status-incomplete">Incomplete</span>;
};

function CarsDataTable({ cars, carDetailsData, carLookupStatus }) {
    if (!cars.some((car) => car.brand || car.model)) {
        return null;
    }

    return (
        <div className="cars-data-table-section">
            <h2>Compared Data</h2>
            <div className="table-wrapper">
                <table className="cars-data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Brand</th>
                            <th>Model</th>
                            <th>Price</th>
                            <th>Engine</th>
                            <th>Cylinders</th>
                            <th>Power</th>
                            <th>Torque</th>
                            <th>Top Speed</th>
                            <th>0-60 km/h</th>
                            <th>Fuel Consumption</th>
                            <th>Fuel Range</th>
                            <th>Width (excl. mirrors / incl. mirrors)</th>
                            <th>Length</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cars.map((car, index) => {
                            const details = carDetailsData[car.id];
                            const lookupState = carLookupStatus[car.id];

                            if (details) {
                                return (
                                    <tr key={car.id} className="complete">
                                        <td data-label="#">{index + 1}</td>
                                        <td data-label="Brand">{details.brand}</td>
                                        <td data-label="Model">{details.model}</td>
                                        <td data-label="Price"><span className="price-cell">{formatPrice(details.price)}</span></td>
                                        <td data-label="Engine">{details.engine || 'N/A'}</td>
                                        <td data-label="Cylinders">{details.cylinders || 'N/A'}</td>
                                        <td data-label="Power">{formatPower(details.power)}</td>
                                        <td data-label="Torque">{formatTorque(details.torque)}</td>
                                        <td data-label="Top Speed">{formatTopSpeed(details.topSpeed)}</td>
                                        <td data-label="0-60 km/h">{formatAcceleration(details.acceleration)}</td>
                                        <td data-label="Fuel Consumption">{formatFuelConsumption(details.fuelConsumption)}</td>
                                        <td data-label="Fuel Range">{formatFuelRange(details.fuelRange)}</td>
                                        <td data-label="Width">{formatWidth(details.widthExclMirrorsInclMirrors)}</td>
                                        <td data-label="Length">{formatLength(details.length)}</td>
                                        <td data-label="Status">
                                            {renderStatus(car, lookupState, true)}
                                            {lookupState?.message && <div>{lookupState.message}</div>}
                                        </td>
                                    </tr>
                                );
                            }

                            return (
                                <tr key={car.id} className="incomplete">
                                    <td data-label="#">{index + 1}</td>
                                    <td data-label="Brand">{car.brand || EMPTY_FIELD}</td>
                                    <td data-label="Model">{car.model || EMPTY_FIELD}</td>
                                    <td data-label="Price">{EMPTY_FIELD}</td>
                                    <td data-label="Engine">{EMPTY_FIELD}</td>
                                    <td data-label="Cylinders">{EMPTY_FIELD}</td>
                                    <td data-label="Power">{EMPTY_FIELD}</td>
                                    <td data-label="Torque">{EMPTY_FIELD}</td>
                                    <td data-label="Top Speed">{EMPTY_FIELD}</td>
                                    <td data-label="0-60 km/h">{EMPTY_FIELD}</td>
                                    <td data-label="Fuel Consumption">{EMPTY_FIELD}</td>
                                    <td data-label="Fuel Range">{EMPTY_FIELD}</td>
                                    <td data-label="Width">{EMPTY_FIELD}</td>
                                    <td data-label="Length">{EMPTY_FIELD}</td>
                                    <td data-label="Status">
                                        {renderStatus(car, lookupState, false)}
                                        {lookupState?.message && <div>{lookupState.message}</div>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="cars-data-actions">
                <button type="button" className="cars-data-action-button">
                    PDF & Send via email
                </button>
            </div>
        </div>
    );
}

CarsDataTable.propTypes = {
    cars: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        brand: PropTypes.string,
        model: PropTypes.string,
    })).isRequired,
    carDetailsData: PropTypes.objectOf(PropTypes.shape({
        brand: PropTypes.string,
        model: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        engine: PropTypes.string,
        cylinders: PropTypes.string,
        power: PropTypes.string,
        torque: PropTypes.string,
        topSpeed: PropTypes.string,
        acceleration: PropTypes.string,
        fuelConsumption: PropTypes.string,
        fuelRange: PropTypes.string,
        widthExclMirrorsInclMirrors: PropTypes.string,
        length: PropTypes.string,
    })).isRequired,
    carLookupStatus: PropTypes.objectOf(PropTypes.shape({
        status: PropTypes.string,
        message: PropTypes.string,
    })).isRequired,
};

export default CarsDataTable;