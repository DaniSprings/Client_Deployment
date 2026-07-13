import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CarsDataTable from '../Components/CarsDataTable.jsx';
import './CarStats.css';
import { models, auth } from '../services/api.js';
import {
    getBrandAutoCorrect,
    getBrandModels,
    getModelAutoCorrect,
    searchCatalogBrands,
    searchCatalogModels
} from '../utils/brandModelCatalog.js';
import {
    getLookupModelOptions,
    normalizeLookupValue,
    rankOptionSuggestions,
    resolveVehicleDetailsForSelection
} from '../utils/liveVehicleLookup.js';

function CarStats() {
    const formFields = [
        {
            name: 'brand',
            label: 'Brand',
            type: 'text',
            required: true,
            placeholder: 'Type brand name...',
            options: 'brandList',
            onChange: 'handleBrandChange',
            onBlur: 'handleBrandBlur',
            disabled: false
        },
        {
            name: 'model',
            label: 'Model',
            type: 'text',
            required: true,
            placeholder: 'Type model name...',
            options: 'modelsList',
            onChange: 'handleModelChange',
            onBlur: 'handleModelBlur',
            disabled: (car) => !car.brand
        }
    ];

    const [carStatsList, setCarStatsList] = useState([
        { id: 1, brand: '', model: '' }
    ]);

    const [/*brandsWithCount*/, setBrandsWithCount] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState({});
    const [modelsList, setModelsList] = useState({});
    const [showSuggestions, setShowSuggestions] = useState({});
    const [/*loading*/, setLoading] = useState(true);
    const [carDetailsData, setCarDetailsData] = useState({});
    const [carLookupStatus, setCarLookupStatus] = useState({});
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [formMessage, setFormMessage] = useState('');
    const [searchParams] = useSearchParams();
    const autoLoadRef = useRef(false);

    // ─── Tracking helpers ────────────────────────────────────────────────────
    const getCurrentUserId = () => localStorage.getItem('userId');

    /**
     * Fire-and-forget tracking — never blocks the UI.
     * type: 'comparison' | 'vehicle_view'
     */
    const trackEvent = useCallback((label, filterPayload) => {
        const userId = getCurrentUserId();
        if (!userId) return; // guests are not tracked

        auth.trackSearch(userId, label, filterPayload).catch((err) => {
            console.warn('[CarStats] tracking error (non-fatal):', err);
        });
    }, []);

    // Track a comparison whenever carDetailsData changes and has ≥ 2 entries
    const trackedComparisonRef = useRef('');
    useEffect(() => {
        const compared = Object.values(carDetailsData);
        if (compared.length < 2) return;

        const key = compared.map(d => `${d.brand}|${d.model}`).sort().join(',');
        if (key === trackedComparisonRef.current) return; // already tracked this exact set
        trackedComparisonRef.current = key;

        const label = `Compare: ${compared.map(d => `${d.brand} ${d.model}`).join(' vs ')}`;
        trackEvent(label, {
            type: 'comparison',
            cars: compared.map(d => ({ brand: d.brand, model: d.model })),
        });
    }, [carDetailsData, trackEvent]);

    // Track individual vehicle detail views whenever a single car result loads
    const trackedViewsRef = useRef(new Set());
    useEffect(() => {
        Object.values(carDetailsData).forEach((details) => {
            const key = `${details.brand}|${details.model}`;
            if (trackedViewsRef.current.has(key)) return;
            trackedViewsRef.current.add(key);

            trackEvent(`View: ${details.brand} ${details.model}`, {
                type: 'vehicle_view',
                brand: details.brand,
                model: details.model,
                price: details.price || null,
            });
        });
    }, [carDetailsData, trackEvent]);

    // ─── Existing logic (unchanged) ──────────────────────────────────────────

    const clearCarLookupState = (id) => {
        setCarDetailsData(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        setCarLookupStatus(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const loadModelsForBrand = async (id, brand) => {
        const fallbackModels = getBrandModels(brand);
        try {
            const response = await models.getModelsByBrand(brand);
            const liveModels = Array.isArray(response.data) ? response.data : [];
            setModelsList(prev => ({ ...prev, [id]: getLookupModelOptions(brand, liveModels.length > 0 ? liveModels : fallbackModels) }));
        } catch (error) {
            console.error(`Error fetching models for brand ${brand}:`, error);
            setModelsList(prev => ({ ...prev, [id]: getLookupModelOptions(brand, fallbackModels) }));
        }
    };

    const fetchVehicleRecord = async (brand, model) => {
        const response = await models.getVehicleData({ brand, model, limit: 1 });
        return response.data?.data?.[0] || null;
    };

    const resolveVehicleDetailsForCar = useCallback(async (car) => {
        return resolveVehicleDetailsForSelection({
            brand: car.brand,
            model: car.model,
            liveModels: modelsList[car.id]?.length ? modelsList[car.id] : getBrandModels(car.brand),
            fetchVehicleRecord,
            fallbackId: car.id
        });
    }, [modelsList]);

    const fetchVehicleDetailsForCars = useCallback(async (carsToCompare, { merge = false } = {}) => {
        const completeCars = carsToCompare.filter(car => car.brand && car.model);

        if (completeCars.length === 0) {
            setFormMessage('Please fill in at least one complete car entry.');
            return;
        }

        setFormMessage('');
        setFetchingDetails(true);
        setCarLookupStatus(prev => ({
            ...prev,
            ...Object.fromEntries(completeCars.map((car) => [car.id, { status: 'loading', message: 'Searching live database...' }]))
        }));

        try {
            const results = await Promise.all(
                completeCars.map(async (car) => {
                    try {
                        const result = await resolveVehicleDetailsForCar(car);
                        return [car.id, result];
                    } catch (error) {
                        console.error(`Error fetching data for ${car.brand} ${car.model}:`, error);
                        return [car.id, { status: 'error', message: 'Search failed. Please try again.', details: null }];
                    }
                })
            );

            const nextDetails = Object.fromEntries(
                results
                    .filter(([, result]) => result?.details)
                    .map(([id, result]) => [id, result.details])
            );

            setCarLookupStatus(prev => ({
                ...prev,
                ...Object.fromEntries(results.map(([id, result]) => [id, {
                    status: result?.status || 'not-found',
                    message: result?.message || ''
                }]))
            }));

            setCarStatsList(prev => prev.map((car) => {
                const result = results.find(([id]) => id === car.id)?.[1];
                if (!result?.resolvedModel) return car;
                return { ...car, model: result.resolvedModel };
            }));

            setCarDetailsData(prev => merge ? { ...prev, ...nextDetails } : nextDetails);

            if (Object.keys(nextDetails).length === 0) {
                setFormMessage('No vehicle data was found. Try picking a model from the live suggestions list.');
            }
        } catch (error) {
            console.error('Error fetching vehicle details:', error);
            setFormMessage('Failed to fetch vehicle details. Please try again.');
        } finally {
            setFetchingDetails(false);
        }
    }, [resolveVehicleDetailsForCar]);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const brandsCountRes = await models.getBrandsWithCount();
                setBrandsWithCount(brandsCountRes.data);
                setLoading(false);
            } catch (e) {
                if (e.name !== "AbortError") console.error(e);
                setLoading(false);
            }
        };
        load();
        return () => controller.abort();
    }, []);

    const handleChange = (id, e) => {
        const { name, value } = e.target;
        if (name === 'brand') {
            setCarStatsList(prev => prev.map(car => car.id === id ? { ...car, [name]: value, model: '' } : car));
            setModelsList(prev => ({ ...prev, [id]: [] }));
            clearCarLookupState(id);
            setShowSuggestions(prev => ({ ...prev, [`brand-${id}`]: true }));
            setFilteredBrands(prev => ({ ...prev, [`brand-${id}`]: searchCatalogBrands(value) }));
        } else if (name === 'model') {
            const currentCar = carStatsList.find(car => car.id === id);
            const currentBrand = currentCar?.brand || '';
            setShowSuggestions(prev => ({ ...prev, [`model-${id}`]: Boolean(currentBrand) }));
            setFilteredBrands(prev => ({ ...prev, [`model-${id}`]: searchCatalogModels(currentBrand, value) }));
            setCarStatsList(prev => prev.map(car => car.id === id ? { ...car, [name]: value } : car));
            clearCarLookupState(id);
        }
    };

    const handleBrandBlur = async (id, value) => {
        const correctedBrand = getBrandAutoCorrect(value);
        if (correctedBrand) {
            setCarStatsList(prev => prev.map(car => car.id === id ? { ...car, brand: correctedBrand, model: '' } : car));
            await loadModelsForBrand(id, correctedBrand);
        }
        setShowSuggestions(prev => ({ ...prev, [`brand-${id}`]: false }));
    };

    const handleModelBlur = async (id, value) => {
        const brand = carStatsList.find(car => car.id === id)?.brand || '';
        const correctedModel = getModelAutoCorrect(brand, value);
        if (correctedModel) {
            setCarStatsList(prev => prev.map(car => car.id === id ? { ...car, model: correctedModel } : car));
        }
        setShowSuggestions(prev => ({ ...prev, [`model-${id}`]: false }));
    };

    const handleBrandSelect = async (id, brand) => {
        setCarStatsList(prev => prev.map(car => car.id === id ? { ...car, brand: brand, model: '' } : car));
        setShowSuggestions(prev => ({ ...prev, [id]: false, [`brand-${id}`]: false }));
        await loadModelsForBrand(id, brand);
        clearCarLookupState(id);
    };

    const handleModelSelect = (id, model) => {
        setCarStatsList(prev => prev.map(car => car.id === id ? { ...car, model: model } : car));
        setShowSuggestions(prev => ({ ...prev, [`model-${id}`]: false }));
        clearCarLookupState(id);
    };

    const handleModelSearch = async (id) => {
        const currentCar = carStatsList.find(car => car.id === id);
        if (!currentCar?.brand || !currentCar?.model) return;
        await fetchVehicleDetailsForCars([currentCar], { merge: true });
    };

    const handleBrandChange = (id, value) => handleChange(id, { target: { name: 'brand', value } });
    const handleModelChange = (id, value) => handleChange(id, { target: { name: 'model', value } });

    const handleAddCar = () => {
        if (carStatsList.length < 6) {
            const newId = Math.max(...carStatsList.map(car => car.id)) + 1;
            setCarStatsList(prev => [...prev, { id: newId, brand: '', model: '' }]);
        }
    };

    const handleRemoveCar = (id) => {
        if (carStatsList.length > 1) {
            setCarStatsList(prev => prev.filter(car => car.id !== id));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetchVehicleDetailsForCars(carStatsList);
    };

    useEffect(() => {
        const make = (searchParams.get('make') || '').trim();
        const model = (searchParams.get('model') || '').trim();
        if (!make || !model || autoLoadRef.current) return;
        autoLoadRef.current = true;
        const preset = [{ id: 1, brand: make, model }];
        setCarStatsList(preset);
        fetchVehicleDetailsForCars(preset);
    }, [fetchVehicleDetailsForCars, searchParams]);

    return (
        <div className="carstat-main-container">
            <h2>Choose your Cars</h2>

            <form onSubmit={handleSubmit}>
                <div className="carstat-row">
                    {carStatsList.map((car) => (
                        <div key={car.id} className="carstat-container">
                            {formFields.map((field) => {
                                const isDisabled = typeof field.disabled === 'function'
                                    ? field.disabled(car, { modelsList })
                                    : field.disabled;

                                const handleFieldChange = (value) => {
                                    if (field.onChange === 'handleBrandChange') handleBrandChange(car.id, value);
                                    else if (field.onChange === 'handleModelChange') handleModelChange(car.id, value);
                                    else if (field.onChange === 'handleBrandSelect') handleBrandSelect(car.id, value);
                                    else if (field.onChange === 'handleModelSelect') handleModelSelect(car.id, value);
                                };

                                const handleFieldBlur = () => {
                                    if (field.onBlur === 'handleBrandBlur') handleBrandBlur(car.id, car.brand);
                                    else if (field.onBlur === 'handleModelBlur') handleModelBlur(car.id, car.model);
                                };

                                return (
                                    <div key={field.name} className="form-group">
                                        <label htmlFor={`${field.name}-${car.id}`}>
                                            {field.label} {field.required && '*'}
                                        </label>

                                        {field.type === 'text' ? (
                                            <div className="field-autocomplete">
                                                <input
                                                    type="text"
                                                    id={`${field.name}-${car.id}`}
                                                    name={field.name}
                                                    value={car[field.name]}
                                                    onChange={(e) => handleFieldChange(e.target.value)}
                                                    onBlur={handleFieldBlur}
                                                    onFocus={() => {
                                                        setShowSuggestions(prev => ({ ...prev, [`${field.name}-${car.id}`]: true }));
                                                        const availableModels = modelsList[car.id]?.length ? modelsList[car.id] : getLookupModelOptions(car.brand, getBrandModels(car.brand));
                                                        if (field.name === 'brand' && car.brand.length === 0) {
                                                            setFilteredBrands(prev => ({ ...prev, [`brand-${car.id}`]: searchCatalogBrands('') }));
                                                        } else if (field.name === 'brand') {
                                                            setFilteredBrands(prev => ({ ...prev, [`brand-${car.id}`]: searchCatalogBrands(car.brand) }));
                                                        } else if (field.name === 'model' && car.model.length === 0) {
                                                            setFilteredBrands(prev => ({ ...prev, [`model-${car.id}`]: availableModels }));
                                                        } else if (field.name === 'model') {
                                                            setFilteredBrands(prev => ({ ...prev, [`model-${car.id}`]: rankOptionSuggestions(car.model, availableModels) }));
                                                        }
                                                    }}
                                                    required={field.required}
                                                    disabled={isDisabled}
                                                    placeholder={field.placeholder}
                                                    autoComplete="on"
                                                    className={`${field.name}-input`}
                                                />
                                                {field.name === 'model' && (
                                                    <button
                                                        type="button"
                                                        className="search-button"
                                                        onClick={() => {
                                                            const availableModels = modelsList[car.id]?.length ? modelsList[car.id] : getLookupModelOptions(car.brand, getBrandModels(car.brand));
                                                            const isModelConfirmed = availableModels.some((option) => normalizeLookupValue(option) === normalizeLookupValue(car.model));
                                                            if (car.model && car.brand && isModelConfirmed) handleModelSearch(car.id);
                                                        }}
                                                        disabled={!car.model || !car.brand || !(modelsList[car.id]?.length ? modelsList[car.id] : getLookupModelOptions(car.brand, getBrandModels(car.brand))).some((option) => normalizeLookupValue(option) === normalizeLookupValue(car.model)) || isDisabled}
                                                        title="Search for this model"
                                                    >
                                                        Search
                                                    </button>
                                                )}
                                                {showSuggestions[`${field.name}-${car.id}`] && filteredBrands[field.name === 'model' ? `model-${car.id}` : `brand-${car.id}`] && filteredBrands[field.name === 'model' ? `model-${car.id}` : `brand-${car.id}`].length > 0 && (
                                                    <div className="suggestions-dropdown">
                                                        {filteredBrands[field.name === 'model' ? `model-${car.id}` : `brand-${car.id}`].map((option, idx) => (
                                                            <div key={idx} className="suggestion-item"
                                                                onMouseDown={(event) => {
                                                                    event.preventDefault();
                                                                    if (field.name === 'brand') handleBrandSelect(car.id, option);
                                                                    else if (field.name === 'model') handleModelSelect(car.id, option);
                                                                }}
                                                            >
                                                                {option}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}

                            {carStatsList.length > 1 && (
                                <button type="button" className="btn-remove" onClick={() => handleRemoveCar(car.id)}>
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="carstat-button-group">
                    <button type="button" className="btn-add" onClick={handleAddCar} disabled={carStatsList.length >= 6}>
                        + Add Car (Max 6)
                    </button>
                    <button type="submit" className="btn-submit" disabled={fetchingDetails}>
                        {fetchingDetails ? 'Fetching Data...' : 'Compare Cars'}
                    </button>
                </div>
                {formMessage && <p className="carstat-form-message">{formMessage}</p>}
            </form>

            <CarsDataTable
                cars={carStatsList}
                carDetailsData={carDetailsData}
                carLookupStatus={carLookupStatus}
            />

            {Object.keys(carDetailsData).length > 0 && (
                <div className="car-details-results">
                    <h2>Compared Results</h2>
                    <div className="comparison-grid">
                        {Object.entries(carDetailsData).map(([carId, details]) => (
                            <div key={carId} className="car-detail-card">
                                <h3>{details.brand} {details.model}</h3>

                                <div className="detail-section">
                                    <h4>Price</h4>
                                    <p className="price-value">
                                        {details.price && details.price > 0 ? `R${details.price.toLocaleString()}` : 'N/A'}
                                    </p>
                                </div>

                                <div className="detail-section">
                                    <h4>Engine Specifications</h4>
                                    <p><strong>Type:</strong> {details.engine || 'N/A'}</p>
                                    <p><strong>Cylinders:</strong> {details.cylinders || 'N/A'}</p>
                                    <p><strong>Power:</strong> {details.power || 'N/A'}</p>
                                    <p><strong>Torque:</strong> {details.torque || 'N/A'}</p>
                                </div>

                                <div className="detail-section">
                                    <h4>Performance</h4>
                                    <p><strong>Top Speed:</strong> {details.topSpeed || 'N/A'}</p>
                                    <p><strong>0-60 mph:</strong> {details.acceleration || 'N/A'}</p>
                                </div>

                                <div className="detail-section">
                                    <h4>Fuel Economy</h4>
                                    <p><strong>Consumption:</strong> {details.fuelConsumption || 'N/A'}</p>
                                    <p><strong>Range:</strong> {details.fuelRange || 'N/A'}</p>
                                </div>

                                {(details.length || details.widthExclMirrorsInclMirrors || details.height || details.wheelbase || details.groundClearance) && (
                                    <div className="detail-section">
                                        <h4>Dimensions</h4>
                                        <p><strong>Length:</strong> {details.length || 'N/A'}</p>
                                        <p><strong>Width:</strong> {details.widthExclMirrorsInclMirrors || 'N/A'}</p>
                                        <p><strong>Height:</strong> {details.height || 'N/A'}</p>
                                        <p><strong>Wheelbase:</strong> {details.wheelbase || 'N/A'}</p>
                                        <p><strong>Ground Clearance:</strong> {details.groundClearance || 'N/A'}</p>
                                    </div>
                                )}

                                <div className="detail-section">
                                    <h4>Source</h4>
                                    <p className="source-info">Data from Model Table Database</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CarStats;
