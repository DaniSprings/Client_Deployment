import PropTypes from 'prop-types';
import './SearchBar.css';

/*const FALLBACK_BRAND_NAMES = [
    'Alfa Romeo',
    'Ashok Leyland',
    'Aston Martin',
    'Audi',
    'BAIC',
    'Bentley',
    'BMW',
    'BYD',
    'Cherry',
    'Citroen',
    'Dayun',
    'Ferrari',
    'Fiat',
    'Ford',
    'Foton',
    'GAC',
    'GWM',
    'Haval',
    'Honda',
    'Hyundai',
    'Ineos',
    'Isuzu',
    'JAC',
    'Jaecoo',
    'Jaguar',
    'Jeep',
    'Jetour',
    'KIA',
    'Lamborghini',
    'Land-Rover',
    'Lexus',
    'Mahindra',
    'Maserati',
    'Mazda',
    'Mclaren',
    'Mercedes-Benz AMG',
    'Mercedes-Benz',
    'Mercedes-Benz-Maybach',
    'Mini',
    'Mitsubishi',
    'Nissan',
    'Omoda',
    'Opel',
    'Peugeot',
    'Porsche',
    'Proton',
    'Renault',
    'Rolls Royce',
    'Subaru',
    'Suzuki',
    'Toyota',
    'Volkswagen',
    'Volvo',
];*/

function SearchBar({
    searchBoxRef,
    filterOpen,
    searchFormRef,
    searchInputRef,
    handleSearchSubmit,
    /*brandCatalog = [],
    brandCounts = {},*/
    selectedBrand,
    clearSelectedBrand,
    searchTerm,
    handleSearchChange,
    handleSearchInputClick,
    handleSearchKeyDown,
    filter,
    showSuggestions,
    searchSuggestions,
    isLoadingSuggestions,
    activeSuggestionIndex,
    handleSuggestionSelect,
    handleFilterSelect,
    /*openLoginModal,
    showLoginModal,*/
}) {
    /*const availableBrands = brandCatalog.length > 0 ? brandCatalog : FALLBACK_BRAND_NAMES;*/

    const normalizedSuggestions = searchSuggestions.map((suggestion) => {
        if (typeof suggestion === 'string') {
            return {
                value: suggestion,
                label: suggestion,
                kind: selectedBrand ? 'model' : 'brand',
                metaLabel: selectedBrand ? 'Model' : 'Make',
            };
        }

        return {
            value: suggestion.value,
            label: suggestion.label || suggestion.value,
            count: suggestion.count,
            kind: suggestion.kind || (selectedBrand ? 'model' : 'brand'),
            metaLabel: suggestion.metaLabel || (selectedBrand ? 'Model' : 'Make'),
        };
    });

    return (
        <div className="SearchBarContainer">
            <div className="filter-container" ref={searchBoxRef}>
                <div className="searchbar-controls">

                    <form ref={searchFormRef} onSubmit={handleSearchSubmit} className="searchbar-form">
                        {selectedBrand && (
                                <button
                                    className="searchbar-selected-brand"
                                    type="button" onClick={clearSelectedBrand} title="Clear brand" >
                                    <span className="searchbar-selected-brand-label">{selectedBrand}</span>
                                    <span className="searchbar-selected-brand-close" aria-hidden="true">x</span>
                                </button>
                            )}
                            <div className="SearchBar">
                            <input
                                    className="searchbar-input"
                                    type="text"
                                    id='SearchValue'
                                    ref={searchInputRef}
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onFocus={handleSearchInputClick}
                                    onClick={handleSearchInputClick}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder={  selectedBrand ? `Type a model for ${selectedBrand}` : `Type a car brand${filter !== 'All' ? ` - ${filter}` : ''}` }
                                    aria-label="Search"
                                    autoComplete={selectedBrand ? 'off' : 'on'}
                            />
                                <button className="searchbar-submit-button" type="submit" aria-label="Search">
                                    <svg className="Search_Icon searchbar-submit-icon" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" />
                                    </svg>
                                </button>

                                {showSuggestions && (searchSuggestions.length > 0 || isLoadingSuggestions) && (
                                <div className="searchbar-suggestions">
                                {isLoadingSuggestions && (
                                    <div className="searchbar-suggestions-loading">
                                            Loading {selectedBrand ? 'models' : 'brands'}...
                                    </div>
                                    )}
                                    {normalizedSuggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSuggestionSelect(suggestion)}
                                            className={`searchbar-suggestion${activeSuggestionIndex === idx ? ' is-active' : ''}`}
                                        >
                                            <div className="searchbar-suggestion-row">
                                                <div className="searchbar-suggestion-value">{suggestion.label}</div>
                                                {!selectedBrand && Number.isFinite(suggestion.count) && (
                                                    <div className="searchbar-suggestion-count">{suggestion.count}</div>
                                                )}
                                            </div>
                                            <div className="searchbar-suggestion-meta-row">
                                                <div className="searchbar-suggestion-type">{suggestion.metaLabel}</div>
                                                {!selectedBrand && <div className="searchbar-suggestion-chevron">&gt;</div>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                )}
                            </div>
                        </form>

                    {filterOpen && (
                        <div
                            className="filter-dropdown"
                            role="menu"
                        >
                            {['Search Brands', 'Search Name', 'Price', 'Model'].map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    className={`filter-option${filter === opt ? ' is-active' : ''}`}
                                    onClick={() => handleFilterSelect(opt)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="LoginBorder">
                    {/*<button
                        type="button"
                        onClick={openSearchModal}
                        aria-haspopup="dialog"
                        aria-expanded={showSearchModal}
                        className="nav-link searchbar-action-button searchbar-advanced-button"
                        title="Advanced search"
                    >
                        <svg className="searchbar-action-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={openLoginModal}
                        aria-haspopup="dialog"
                        aria-expanded={showLoginModal}
                        className="nav-link searchbar-action-button searchbar-login-button"
                    >
                        <svg className="searchbar-action-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="searchbar-login-label">Login</span>
                    </button>*/}
                </div>
            </div>
        </div>
    );
}

SearchBar.propTypes = {
    searchBoxRef: PropTypes.shape({ current: PropTypes.any }),
    handleFilterToggle: PropTypes.func.isRequired,
    filterOpen: PropTypes.bool.isRequired,
    searchFormRef: PropTypes.shape({ current: PropTypes.any }),
    searchInputRef: PropTypes.shape({ current: PropTypes.any }),
    handleSearchSubmit: PropTypes.func.isRequired,
    brandCatalog: PropTypes.arrayOf(PropTypes.string),
    brandCounts: PropTypes.objectOf(PropTypes.number),
    selectedBrand: PropTypes.string.isRequired,
    clearSelectedBrand: PropTypes.func.isRequired,
    searchTerm: PropTypes.string.isRequired,
    handleSearchChange: PropTypes.func.isRequired,
    handleSearchInputClick: PropTypes.func.isRequired,
    handleSearchKeyDown: PropTypes.func.isRequired,
    filter: PropTypes.string.isRequired,
    showSuggestions: PropTypes.bool.isRequired,
    searchSuggestions: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                value: PropTypes.string.isRequired,
                label: PropTypes.string,
                count: PropTypes.number,
                kind: PropTypes.string,
                metaLabel: PropTypes.string,
            }),
        ]),
    ).isRequired,
    isLoadingSuggestions: PropTypes.bool.isRequired,
    activeSuggestionIndex: PropTypes.number.isRequired,
    handleSuggestionSelect: PropTypes.func.isRequired,
    handleFilterSelect: PropTypes.func.isRequired,
    openSearchModal: PropTypes.func.isRequired,
    showSearchModal: PropTypes.bool.isRequired,
    openLoginModal: PropTypes.func.isRequired,
    showLoginModal: PropTypes.bool.isRequired,
    searchDropdown: PropTypes.node,
};

export default SearchBar;