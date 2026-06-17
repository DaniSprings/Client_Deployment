import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import VehicleSpecsTable from '../Components/VehicleSpecsTable.jsx';
import PopUpModal from '../Components/Pop-upModal.jsx';
import './SearchResults.css';
import { models } from '../services/api.js';
import { getModelFamilies, searchCatalogBrands } from '../utils/brandModelCatalog.js';
import {
    getLookupModelOptions,
    rankOptionSuggestions,
    resolveBrandName,
    resolveVehicleDetailsForSelection,
} from '../utils/liveVehicleLookup.js';

function SearchResults() {
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [detailVehicles, setDetailVehicles] = useState([]);
    const [detailNotice, setDetailNotice] = useState('');
    const [debugInfo, setDebugInfo] = useState(null);
    const [modelModalOpen, setModelModalOpen] = useState(false);
    const [currentBrandLabel, setCurrentBrandLabel] = useState('');
    const [selectedFamilyLabel, setSelectedFamilyLabel] = useState('');
    const [currentBrandFamilies, setCurrentBrandFamilies] = useState([]);
    const navigate = useNavigate();

    const queryState = useMemo(() => {
        const make = (searchParams.get('make') || '').trim();
        const model = (searchParams.get('model') || '').trim();
        const q = (searchParams.get('q') || '').trim();
        const debug = searchParams.get('debug') === '1';
        return { make, model, q, debug };
    }, [searchParams]);

    const activeFamily = currentBrandFamilies.find(({ familyLabel }) => familyLabel === selectedFamilyLabel) || null;
    const modalItems = selectedFamilyLabel ? (activeFamily?.models || []) : currentBrandFamilies;
    const modalTitle = selectedFamilyLabel
        ? `${currentBrandLabel} ${selectedFamilyLabel}`
        : `Car Models - ${currentBrandLabel}`;

    const fetchVehicleRecord = async (brand, model) => {
        const response = await models.getVehicleData({
            brand,
            model,
            limit: 1
        });

        return response.data?.data?.[0] || null;
    };

    const openBrandModal = async (brandName, liveBrands = []) => {
        const resolvedBrand = resolveBrandName(brandName, liveBrands);

        if (!resolvedBrand) {
            setError(`No database brand found for ${brandName}.`);
            return { opened: false, resolvedBrand: '', familyCount: 0 };
        }

        setCurrentBrandLabel(resolvedBrand);
        setSelectedFamilyLabel('');
        setModelModalOpen(true);
        setError('');

        try {
            const response = await models.getModelsByBrand(resolvedBrand);
            const liveModels = Array.isArray(response.data) ? response.data : [];
            const lookupModels = getLookupModelOptions(resolvedBrand, liveModels);
            const families = getModelFamilies(lookupModels);
            setCurrentBrandFamilies(families);
            return { opened: true, resolvedBrand, familyCount: families.length };
        } catch (loadError) {
            console.error(`Search results model load failed for ${resolvedBrand}:`, loadError);
            const families = getModelFamilies(getLookupModelOptions(resolvedBrand, []));
            setCurrentBrandFamilies(families);
            return { opened: true, resolvedBrand, familyCount: families.length };
        }
    };

    const closeBrandModal = () => {
        setSelectedFamilyLabel('');
        setModelModalOpen(false);
    };

    const showModelFamily = (familyLabel) => {
        setSelectedFamilyLabel(familyLabel);
    };

    const backToFamilyList = () => {
        setSelectedFamilyLabel('');
    };

    const handleModalItemClick = (item) => {
        if (selectedFamilyLabel) {
            navigate(`/Results?make=${encodeURIComponent(currentBrandLabel)}&model=${encodeURIComponent(item)}`);
            closeBrandModal();
            return;
        }

        showModelFamily(item.familyLabel);
    };

    const renderModalItem = (item) => {
        if (selectedFamilyLabel) {
            return <strong>{item}</strong>;
        }

        return (
            <>
                <strong>{item.familyLabel}</strong>
                <span className="results-modal-count">{item.models.length}</span>
            </>
        );
    };

    const getModalItemKey = (item, index) => {
        if (selectedFamilyLabel) {
            return `${item}-${index}`;
        }

        return `${item.familyLabel}-${index}`;
    };

    useEffect(() => {
        const loadResults = async () => {
            setIsLoading(true);
            setError('');
            setResults([]);
            setDetailVehicles([]);
            setDetailNotice('');
            setDebugInfo(null);
            setModelModalOpen(false);
            setCurrentBrandLabel('');
            setSelectedFamilyLabel('');
            setCurrentBrandFamilies([]);

            try {
                let liveBrands = [];

                try {
                    const brandsResponse = await models.getAllBrands();
                    liveBrands = Array.isArray(brandsResponse.data) ? brandsResponse.data : [];
                } catch (brandError) {
                    console.error('Live brand lookup failed, using catalog fallback:', brandError);
                }

                if (queryState.make && queryState.model) {
                    const resolvedBrand = resolveBrandName(queryState.make, liveBrands);

                    if (!resolvedBrand) {
                        setDebugInfo({
                            mode: 'vehicle',
                            requestedMake: queryState.make,
                            requestedModel: queryState.model,
                            resolvedMake: '',
                            resolvedModel: '',
                            rowCount: 0,
                            status: 'brand-not-found'
                        });
                        setError(`No database brand found for ${queryState.make}.`);
                        return;
                    }

                    setSummary(`Specifications for ${resolvedBrand} ${queryState.model}`);

                    const response = await models.getModelsByBrand(resolvedBrand);
                    const liveModels = Array.isArray(response.data) ? response.data : [];
                    const resolution = await resolveVehicleDetailsForSelection({
                        brand: resolvedBrand,
                        model: queryState.model,
                        liveModels,
                        fetchVehicleRecord,
                    });

                    if (!resolution.details) {
                        setDebugInfo({
                            mode: 'vehicle',
                            requestedMake: queryState.make,
                            requestedModel: queryState.model,
                            resolvedMake: resolvedBrand,
                            resolvedModel: '',
                            rowCount: 0,
                            status: resolution.status || 'not-found'
                        });
                        setError(`No database record found for ${resolvedBrand} ${queryState.model}.`);
                        return;
                    }

                    const notices = [];

                    if (resolvedBrand !== queryState.make) {
                        notices.push(`Matched live brand ${resolvedBrand}.`);
                    }

                    if (resolution.message) {
                        notices.push(resolution.message);
                    }

                    setSummary(`Specifications for ${resolution.resolvedBrand} ${resolution.resolvedModel}`);
                    setDetailVehicles([resolution.details]);
                    setDetailNotice(notices.join(' '));
                    setDebugInfo({
                        mode: 'vehicle',
                        requestedMake: queryState.make,
                        requestedModel: queryState.model,
                        resolvedMake: resolution.resolvedBrand,
                        resolvedModel: resolution.resolvedModel,
                        rowCount: 1,
                        status: resolution.message ? 'fallback-match' : 'exact-match'
                    });
                    return;
                }

                if (queryState.make) {
                    const modalState = await openBrandModal(queryState.make, liveBrands);

                    if (modalState.opened) {
                        const resolvedBrand = modalState.resolvedBrand || resolveBrandName(queryState.make, liveBrands) || queryState.make;
                        setSummary(`Models for ${resolvedBrand}`);
                        setDebugInfo({
                            mode: 'brand',
                            requestedMake: queryState.make,
                            requestedModel: '',
                            resolvedMake: resolvedBrand,
                            resolvedModel: '',
                            rowCount: modalState.familyCount,
                            status: resolvedBrand !== queryState.make ? 'brand-fallback' : 'brand-opened'
                        });
                    }
                    return;
                }

                if (queryState.q) {
                    setSummary(`Searching for "${queryState.q}"...`);
                    const brandOptions = liveBrands.length > 0 ? liveBrands : searchCatalogBrands('');
                    const brands = rankOptionSuggestions(queryState.q, brandOptions);

                    if (brands.length === 1) {
                        const exactBrand = brands[0];
                        setSummary(`Models for ${exactBrand}`);
                        await openBrandModal(exactBrand, liveBrands);
                        return;
                    }

                    setSummary(`Makes matching "${queryState.q}"`);
                    const brandsList = brands.map((item) => ({
                        Brand: item
                    }));
                    setResults(brandsList);
                    setDebugInfo({
                        mode: 'query',
                        requestedMake: queryState.q,
                        requestedModel: '',
                        resolvedMake: brands[0] || '',
                        resolvedModel: '',
                        rowCount: brandsList.length,
                        status: brands.length === 0 ? 'no-brand-match' : 'brand-list'
                    });
                    return;
                }

                setSummary('Enter a make or model to search.');
            } catch (err) {
                console.error('Search results error:', err);
                const errorMsg = err?.message || err?.data?.message || JSON.stringify(err);
                setError(`Unable to load results: ${errorMsg}`);
            } finally {
                setIsLoading(false);
            }
        };

        loadResults();
    }, [queryState]);

    return (
        <section className="results-page">
            <div className="results-header">
                <h1>Search Results</h1>
                <p className="results-summary">{summary}</p>
            </div>

            {queryState.debug && debugInfo && (
                <div className="results-debug-banner" role="status" aria-live="polite">
                    <strong>Debug</strong>
                    <span>requested make: {debugInfo.requestedMake || 'N/A'}</span>
                    <span>requested model: {debugInfo.requestedModel || 'N/A'}</span>
                    <span>resolved make: {debugInfo.resolvedMake || 'N/A'}</span>
                    <span>resolved model: {debugInfo.resolvedModel || 'N/A'}</span>
                    <span>row count: {debugInfo.rowCount}</span>
                    <span>status: {debugInfo.status}</span>
                </div>
            )}

            {isLoading && <div className="results-status">Loading...</div>}
            {error && <div className="results-status error">{error}</div>}

            {!isLoading && !error && results.length === 0 && detailVehicles.length === 0 && (
                <div className="results-status">No results found.</div>
            )}

            {!isLoading && !error && detailVehicles.length > 0 && (
                <div className="results-detail-block">
                    <div className="results-detail-hero">
                        <div>
                            <p className="results-detail-kicker">Model Specification</p>
                            <h2>{detailVehicles[0].brand} {detailVehicles[0].model}</h2>
                        </div>
                    </div>
                    {detailNotice && <p className="results-detail-note">{detailNotice}</p>}
                    <VehicleSpecsTable vehicles={detailVehicles} />
                </div>
            )}

            {!isLoading && !error && results.length > 0 && (
                <div className="results-grid">
                    {results.map((item, idx) => (
                        <article
                            key={`${item.Brand || 'brand'}-${item.Model || 'model'}-${item.Year || idx}`}
                            className="results-card"
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                if (item.Brand && item.Model) {
                                    navigate(`/Results?make=${encodeURIComponent(item.Brand)}&model=${encodeURIComponent(item.Model)}`);
                                } else if (item.Brand) {
                                    void openBrandModal(item.Brand);
                                }
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    if (item.Brand && item.Model) {
                                        navigate(`/Results?make=${encodeURIComponent(item.Brand)}&model=${encodeURIComponent(item.Model)}`);
                                    } else if (item.Brand) {
                                        void openBrandModal(item.Brand);
                                    }
                                }
                            }}
                        >
                            <div className="results-card-title">
                                {item.Brand || 'Unknown Brand'}
                            </div>
                            {item.Model && <div className="results-card-subtitle">{item.Model}</div>}
                            {item.Year && <div className="results-card-meta">Year: {item.Year}</div>}
                            {item.Price != null && <div className="results-card-meta">Price: {item.Price}</div>}
                            {item.EngineCapacity && (
                                <div className="results-card-meta">Engine: {item.EngineCapacity}</div>
                            )}
                            {item.Performance && (
                                <div className="results-card-meta">Performance: {item.Performance}</div>
                            )}
                        </article>
                    ))}
                </div>
            )}

            <PopUpModal
                isOpen={modelModalOpen}
                title={modalTitle}
                items={modalItems}
                emptyMessage="No models available"
                onClose={closeBrandModal}
                onBack={selectedFamilyLabel ? backToFamilyList : undefined}
                onItemClick={handleModalItemClick}
                renderItem={renderModalItem}
                getItemKey={getModalItemKey}
            />
        </section>
    );
}

export default SearchResults;
