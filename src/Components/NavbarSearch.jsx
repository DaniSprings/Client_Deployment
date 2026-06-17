import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './NavbarSearch.css';
import sqlCatalogArrays from '../services/sqlCatalogArrays.js';

const NavbarSearch = ({ onSearch = () => { }, onClose = () => { } }) => {
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [modelOptions, setModelOptions] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch brands on mount
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const brands = await sqlCatalogArrays.getBrandNames('', { limit: null });
                setBrands(brands || []);
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        };
        fetchBrands();
    }, []);

    // Fetch models when brand changes
    useEffect(() => {
        if (selectedBrand) {
            const fetchModels = async () => {
                try {
                    const brandModels = await sqlCatalogArrays.getModelNames({
                        brandName: selectedBrand,
                        limit: null,
                    });
                    setModelOptions(brandModels || []);
                    setSelectedModel('');
                } catch (error) {
                    console.error('Error fetching models:', error);
                }
            };
            fetchModels();
        }
    }, [selectedBrand]);

    const handleSearch = async () => {
        setIsLoading(true);

        try {
            const data = await sqlCatalogArrays.searchVehicles({
                brandName: selectedBrand,
                modelName: selectedModel || '',
            });
            onSearch({
                results: data || [],
                criteria: {
                    brand: selectedBrand,
                    model: selectedModel
                },
                isLoading: false
            });
        } catch (error) {
            console.error('Error searching:', error);
            onSearch({
                results: [],
                criteria: {},
                isLoading: false
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedBrand('');
        setSelectedModel('');
        setModelOptions([]);
    };

    return (
        <div className="navbar-search-modal">
            <div className="navbar-search-container">
                <div className="search-header">
                    <h2>Search Cars</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="search-form">
                    <div className="form-group">
                        <label>Brand *</label>
                        <select
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            className="form-input"
                        >
                            <option value="">Select a brand...</option>
                            {brands.map((brand) => (
                                <option key={brand} value={brand}>
                                    {brand}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Model</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="form-input"
                            disabled={!selectedBrand}
                        >
                            <option value="">Select a model...</option>
                            {modelOptions.map((model) => (
                                <option key={model} value={model}>
                                    {model}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="search-buttons">
                    <button
                        className="search-btn"
                        onClick={handleSearch}
                        disabled={isLoading || !selectedBrand}
                    >
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                    <button className="reset-btn" onClick={handleReset}>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NavbarSearch;

NavbarSearch.propTypes = {
    onSearch: PropTypes.func,
    onClose: PropTypes.func
};
