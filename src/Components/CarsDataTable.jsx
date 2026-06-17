import PropTypes from 'prop-types';

const EMPTY_FIELD = <span className="empty-field">-</span>;

const formatPrice = (price) => {
    if (!price || price <= 0) {
        return 'N/A';
    }

    return `$${price.toLocaleString()}`;
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
            <h2>Current Selections & Data</h2>
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
                            <th>width_excl_mirrors_incl_mirrors</th>
                            <th>length</th>
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
                                        <td>{index + 1}</td>
                                        <td>{details.brand}</td>
                                        <td>{details.model}</td>
                                        <td><span className="price-cell">{formatPrice(details.price)}</span></td>
                                        <td>{details.engine || 'N/A'}</td>
                                        <td>{details.cylinders || 'N/A'}</td>
                                        <td>{details.power || 'N/A'}</td>
                                        <td>{details.torque || 'N/A'}</td>
                                        <td>{details.topSpeed || 'N/A'}</td>
                                        <td>{details.acceleration || 'N/A'}</td>
                                        <td>{details.fuelConsumption || 'N/A'}</td>
                                        <td>{details.fuelRange || 'N/A'}</td>
                                        <td>{details.widthExclMirrorsInclMirrors || 'N/A'}</td>
                                        <td>{details.length || 'N/A'}</td>
                                        <td>
                                            {renderStatus(car, lookupState, true)}
                                            {lookupState?.message && <div>{lookupState.message}</div>}
                                        </td>
                                    </tr>
                                );
                            }

                            return (
                                <tr key={car.id} className="incomplete">
                                    <td>{index + 1}</td>
                                    <td>{car.brand || EMPTY_FIELD}</td>
                                    <td>{car.model || EMPTY_FIELD}</td>
                                    <td>{EMPTY_FIELD}</td>
                                    <td>{EMPTY_FIELD}</td>
                                    <td>{EMPTY_FIELD}</td>
                                    <td>{EMPTY_FIELD}</td>
                                    <td>{EMPTY_FIELD}</td>
                                    <td>{EMPTY_FIELD}</td>
                                    <td>{EMPTY_FIELD}</td>
                                    <td>{EMPTY_FIELD}</td>
                                    <td>{EMPTY_FIELD}</td>
                                    <td>{EMPTY_FIELD}</td>
                                    <td>{EMPTY_FIELD}</td>
                                    <td>
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