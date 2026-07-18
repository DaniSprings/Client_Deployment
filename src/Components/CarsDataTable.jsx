import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

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

const COMPARISON_FIELDS = [
    { key: 'price', preference: 'min' },
    { key: 'cylinders', preference: 'max' },
    { key: 'power', preference: 'max' },
    { key: 'torque', preference: 'max' },
    { key: 'topSpeed', preference: 'max' },
    { key: 'acceleration', preference: 'min' },
    { key: 'fuelConsumption', preference: 'min' },
    { key: 'fuelRange', preference: 'max' },
    { key: 'widthExclMirrorsInclMirrors', preference: 'max' },
    { key: 'length', preference: 'max' },
];

const toComparableNumber = (value) => {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    const raw = String(value).trim();
    if (!raw || raw.toUpperCase() === 'N/A' || raw.toUpperCase() === 'TBA') {
        return null;
    }

    const normalized = raw.replace(/,/g, '');
    const match = normalized.match(/-?\d+(\.\d+)?/);
    if (!match) {
        return null;
    }

    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
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

function CarsDataTable({ cars, carDetailsData, carLookupStatus, comparisonRequested }) {
    const navigate = useNavigate();
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailStatusMessage, setEmailStatusMessage] = useState('');
    const hasCarSelection = cars.some((car) => car.brand || car.model);

    const loadedCars = cars
        .map((car) => ({
            id: car.id,
            brand: car.brand,
            model: car.model,
            details: carDetailsData[car.id],
        }))
        .filter((item) => item.details);

    const comparisonSummary = useMemo(() => {
        if (!comparisonRequested) {
            return { fieldWinners: {}, overallBest: new Set(), overallWorst: new Set(), scoreByCarId: {} };
        }

        const fieldWinners = {};
        const scoreByCarId = {};

        loadedCars.forEach((car) => {
            scoreByCarId[car.id] = 0;
        });

        COMPARISON_FIELDS.forEach(({ key, preference }) => {
            const comparableEntries = loadedCars
                .map((car) => ({
                    carId: car.id,
                    value: toComparableNumber(car.details?.[key]),
                }))
                .filter((entry) => entry.value !== null);

            if (comparableEntries.length < 2) {
                return;
            }

            const values = comparableEntries.map((entry) => entry.value);
            const bestValue = preference === 'min' ? Math.min(...values) : Math.max(...values);
            const worstValue = preference === 'min' ? Math.max(...values) : Math.min(...values);

            if (bestValue === worstValue) {
                return;
            }

            const best = new Set(
                comparableEntries
                    .filter((entry) => entry.value === bestValue)
                    .map((entry) => entry.carId),
            );
            const worst = new Set(
                comparableEntries
                    .filter((entry) => entry.value === worstValue)
                    .map((entry) => entry.carId),
            );

            fieldWinners[key] = { best, worst };

            best.forEach((carId) => {
                scoreByCarId[carId] = (scoreByCarId[carId] ?? 0) + 1;
            });
            worst.forEach((carId) => {
                scoreByCarId[carId] = (scoreByCarId[carId] ?? 0) - 1;
            });
        });

        const scoredIds = Object.keys(scoreByCarId).map((id) => Number(id));
        if (scoredIds.length < 2) {
            return { fieldWinners, overallBest: new Set(), overallWorst: new Set(), scoreByCarId };
        }

        const allScores = scoredIds.map((id) => scoreByCarId[id] ?? 0);
        const bestOverallScore = Math.max(...allScores);
        const worstOverallScore = Math.min(...allScores);

        const overallBest = bestOverallScore === worstOverallScore
            ? new Set()
            : new Set(scoredIds.filter((id) => scoreByCarId[id] === bestOverallScore));

        const overallWorst = bestOverallScore === worstOverallScore
            ? new Set()
            : new Set(scoredIds.filter((id) => scoreByCarId[id] === worstOverallScore));

        return { fieldWinners, overallBest, overallWorst, scoreByCarId };
    }, [comparisonRequested, loadedCars]);

    const getComparisonClass = (carId, fieldKey) => {
        const fieldResult = comparisonSummary.fieldWinners[fieldKey];
        if (!fieldResult) {
            return '';
        }
        if (fieldResult.best.has(carId)) {
            return 'comparison-best';
        }
        if (fieldResult.worst.has(carId)) {
            return 'comparison-worst';
        }
        return '';
    };

    const getRowComparisonClass = (carId) => {
        if (comparisonSummary.overallBest.has(carId)) {
            return 'comparison-overall-best';
        }
        if (comparisonSummary.overallWorst.has(carId)) {
            return 'comparison-overall-worst';
        }
        return '';
    };

    const getOverallLabel = (carId) => {
        if (comparisonSummary.overallBest.has(carId)) {
            return 'Best Overall Value';
        }
        if (comparisonSummary.overallWorst.has(carId)) {
            return 'Least Desirable Overall';
        }
        return '';
    };

    if (!hasCarSelection) {
        return null;
    }

    const handleSendEmail = async () => {
        const hasAuthToken = Boolean(localStorage.getItem('authToken'));
        const hasUserId = Boolean(localStorage.getItem('userId'));

        if (!hasAuthToken || !hasUserId) {
            navigate('/login?redirect=%2FCarStats');
            return;
        }

        if (loadedCars.length === 0) {
            setEmailStatusMessage('No compared data is available to email yet.');
            return;
        }

        setIsSendingEmail(true);
        setEmailStatusMessage('Sending compared data to your email...');

        try {
            await auth.sendComparisonEmail(loadedCars);
            setEmailStatusMessage('Compared data was emailed to your registered account.');
        } catch (error) {
            const message =
                error?.data?.message ||
                error?.message ||
                'Could not send email right now. Please try again later.';
            setEmailStatusMessage(message);
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <div className="cars-data-table-section">
            <h2>Compared Data</h2>
            {comparisonRequested && loadedCars.length >= 2 && (
                <p className="comparison-summary-message">
                    Green cells show the best value for that stat, red cells show the least desirable value.
                </p>
            )}
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
                                const rowComparisonClass = comparisonRequested ? getRowComparisonClass(car.id) : '';
                                const overallLabel = comparisonRequested ? getOverallLabel(car.id) : '';
                                return (
                                    <tr key={car.id} className={`complete ${rowComparisonClass}`.trim()}>
                                        <td data-label="#">{index + 1}</td>
                                        <td data-label="Brand">{details.brand}</td>
                                        <td data-label="Model">{details.model}</td>
                                        <td data-label="Price" className={getComparisonClass(car.id, 'price')}><span className="price-cell">{formatPrice(details.price)}</span></td>
                                        <td data-label="Engine">{details.engine || 'N/A'}</td>
                                        <td data-label="Cylinders" className={getComparisonClass(car.id, 'cylinders')}>{details.cylinders || 'N/A'}</td>
                                        <td data-label="Power" className={getComparisonClass(car.id, 'power')}>{formatPower(details.power)}</td>
                                        <td data-label="Torque" className={getComparisonClass(car.id, 'torque')}>{formatTorque(details.torque)}</td>
                                        <td data-label="Top Speed" className={getComparisonClass(car.id, 'topSpeed')}>{formatTopSpeed(details.topSpeed)}</td>
                                        <td data-label="0-60 km/h" className={getComparisonClass(car.id, 'acceleration')}>{formatAcceleration(details.acceleration)}</td>
                                        <td data-label="Fuel Consumption" className={getComparisonClass(car.id, 'fuelConsumption')}>{formatFuelConsumption(details.fuelConsumption)}</td>
                                        <td data-label="Fuel Range" className={getComparisonClass(car.id, 'fuelRange')}>{formatFuelRange(details.fuelRange)}</td>
                                        <td data-label="Width" className={getComparisonClass(car.id, 'widthExclMirrorsInclMirrors')}>{formatWidth(details.widthExclMirrorsInclMirrors)}</td>
                                        <td data-label="Length" className={getComparisonClass(car.id, 'length')}>{formatLength(details.length)}</td>
                                        <td data-label="Status">
                                            {renderStatus(car, lookupState, true)}
                                            {overallLabel && <div className="overall-comparison-note">{overallLabel}</div>}
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
                <button
                    type="button"
                    className="cars-data-action-button"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                >
                    {isSendingEmail ? 'Sending...' : 'Email PDF'}
                </button>
            </div>
            {emailStatusMessage && (
                <p role="status" aria-live="polite">{emailStatusMessage}</p>
            )}
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
    comparisonRequested: PropTypes.bool,
};

CarsDataTable.defaultProps = {
    comparisonRequested: false,
};

export default CarsDataTable;