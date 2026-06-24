import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import sqlCatalogArrays from '../services/sqlCatalogArrays';
import SignupForm from './SignUpForm.jsx';
import NavbarSearch from './NavbarSearch.jsx';
import SearchBar from './Searchbar.jsx';
import SearchResultsTable from './SearchResultsTable.jsx';
import { useWindowSize } from '../hooks/useWindowSize.js';
import LoginModal from './LoginModal.jsx';
import Test1 from '../assets/Test1.svg';


const MAX_MODEL_SUGGESTIONS = 12;

const filterBrandSuggestions = (brands, query = '') => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return brands;
  }

  const startsWithMatches = [];
  const containsMatches = [];

  brands.forEach((brand) => {
    const normalizedBrand = brand.toLowerCase();

    if (normalizedBrand.startsWith(normalizedQuery)) {
      startsWithMatches.push(brand);
      return;
    }

    if (normalizedBrand.includes(normalizedQuery)) {
      containsMatches.push(brand);
    }
  });

  return [...startsWithMatches, ...containsMatches];
};

const toSuggestionItem = (value, extra = {}) => ({
  value,
  label: value,
  ...extra,
});

function Navbar() {
  const { width } = useWindowSize();
  const isMobile  = width <= 768;
  const isTablet  = width > 768 && width <= 1024;
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoScale, setLogoScale] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandCatalog, setBrandCatalog] = useState([]);
  const [brandCounts, setBrandCounts] = useState({});
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const searchFormRef = useRef(null);
  const searchBoxRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  // Search modal and results state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({});
  const [isSearching, setIsSearching] = useState(false);

  // success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 3000);
  };

  // failure popup state with optional retry callback
  const [showFailurePopup, setShowFailurePopup] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');
  const [failureRetry, setFailureRetry] = useState(null);
  const showFailure = (msg, retryFn = null) => {
    setFailureMessage(msg || 'Operation failed');
    setFailureRetry(() => retryFn);
    setShowFailurePopup(true);
  };
  const hideFailure = () => {
    setShowFailurePopup(false);
    setFailureMessage('');
    setFailureRetry(null);
  };

  // Search modal handlers
  const openSearchModal = () => setShowSearchModal(true);
  const closeSearchModal = () => setShowSearchModal(false);
  const handleSearchResults = ({ results, criteria, isLoading }) => {
    setSearchResults(results);
    setSearchCriteria(criteria);
    setIsSearching(isLoading || false);
    // Close the modal after successful search
    if (!isLoading && results && results.length > 0) {
      setTimeout(() => closeSearchModal(), 500);
    }
  };

  // login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const openLoginModal  = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  // signup modal state
  const [showSignupModal, setShowSignupModal] = useState(false);
  const openSignupModal = () => {
    setShowSignupModal(true);
  };
  const closeSignupModal = () => {
    setShowSignupModal(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const preloadBrandCatalog = async () => {
      try {
        const nextCatalog = await sqlCatalogArrays.getBrandNames('', { limit: null });

        if (isMounted) {
          setBrandCatalog(nextCatalog);
        }
      } catch (error) {
        console.error('Error preloading brand catalog:', error);
      }
    };

    preloadBrandCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const preloadBrandCounts = async () => {
      try {
        const brandsWithCount = await sqlCatalogArrays.getBrandsWithCount();

        if (!isMounted) {
          return;
        }

        const nextBrandCounts = brandsWithCount.reduce((accumulator, brand) => {
          if (brand?.name) {
            accumulator[brand.name] = Number(brand.count) || 0;
          }

          return accumulator;
        }, {});

        setBrandCounts(nextBrandCounts);
      } catch (error) {
        console.error('Error preloading brand counts:', error);
      }
    };

    preloadBrandCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDropdown = () => setDropdownOpen((open) => !open);
  const closeDropdown = () => setDropdownOpen(false);

  const loadBrandCatalog = async () => {
    if (brandCatalog.length > 0) {
      return brandCatalog;
    }

    try {
      const nextCatalog = await sqlCatalogArrays.getBrandNames('', { limit: null });
      setBrandCatalog(nextCatalog);
      return nextCatalog;
    } catch (error) {
      console.error('Error fetching brand names from catalog arrays:', error);
      setBrandCatalog([]);
      return [];
    }
  };

  const loadBrandSuggestions = async (query = '') => {
    try {
      setIsLoadingSuggestions(true);

      const catalog = await loadBrandCatalog();
      const nextSuggestions = filterBrandSuggestions(catalog, query).map((brand) =>
        toSuggestionItem(brand, {
          kind: 'brand',
          count: brandCounts[brand],
          metaLabel: 'Models',
        }),
      );

      setSearchSuggestions(nextSuggestions);
      setShowSuggestions(nextSuggestions.length > 0);
      setActiveSuggestionIndex(-1);
      return nextSuggestions;
    } catch (error) {
      console.error('Error fetching brand suggestions:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return [];
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const loadModelSuggestions = async (brand, query = '') => {
    if (!brand) {
      return [];
    }

    setIsLoadingSuggestions(true);

    try {
      const suggestions = await sqlCatalogArrays.getModelNames({
        brandName: brand,
        query,
        limit: MAX_MODEL_SUGGESTIONS,
      });

      const nextSuggestions = (suggestions || []).map((model) =>
        toSuggestionItem(model, {
          kind: 'model',
          metaLabel: 'Model',
        }),
      );
      setSearchSuggestions(nextSuggestions);
      setShowSuggestions(nextSuggestions.length > 0);
      setActiveSuggestionIndex(-1);
      return nextSuggestions;
    } catch (error) {
      console.error('Error fetching model suggestions:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return [];
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const activateBrandSelection = async (brand) => {
    setSelectedBrand(brand);
    setSearchTerm('');
    await loadModelSuggestions(brand);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  // Handle search input click - fetch all brands from database
  const handleSearchInputClick = async () => {
    if (searchTerm.trim().length > 0) {
      return;
    }

    if (selectedBrand) {
      await loadModelSuggestions(selectedBrand);
      return;
    }

    await loadBrandSuggestions();
  };

  // Handle search input and fetch suggestions
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setActiveSuggestionIndex(-1);

    if (value.trim().length > 0) {
      if (selectedBrand) {
        await loadModelSuggestions(selectedBrand, value);
      } else {
        await loadBrandSuggestions(value);
      }
    } else {
      if (selectedBrand) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      } else {
        await loadBrandSuggestions();
      }
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (value) => {
    const nextValue = typeof value === 'string' ? value : value?.value || '';

    if (!selectedBrand) {
      await activateBrandSelection(nextValue);
      setShowSuggestions(false);
      return;
    }

    setSearchTerm(nextValue);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    // Optionally trigger search automatically once model is chosen
    setTimeout(() => {
      searchFormRef.current?.requestSubmit();
    }, 0);
  };

  const handleSearchKeyDown = async (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % searchSuggestions.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev <= 0 ? searchSuggestions.length - 1 : prev - 1,
      );
      return;
    }

    if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
      e.preventDefault();
      await handleSuggestionSelect(searchSuggestions[activeSuggestionIndex]);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    const trimmed = searchTerm.trim();
    const searchText = [selectedBrand, trimmed]
    .filter(Boolean)
    .join(' ');
    console.log('Search submitted:', searchText, 'filter:', filter);

    if (!selectedBrand && !trimmed) {
      return;
    }

    const doNavigateWithBrand = (brandValue) => {
      const params = new URLSearchParams();
      params.set('make', brandValue);
      // If a model is typed while brand is explicitly selected, respect that
      if (selectedBrand && trimmed) {
        params.set('model', trimmed);
      }
      navigate(`/Results?${params.toString()}`);
    };

    if (selectedBrand) {
      if (!trimmed) {
        doNavigateWithBrand(selectedBrand);
      } else {
        try {
          const suggestions = await sqlCatalogArrays.getModelNames({
            brandName: selectedBrand,
            query: trimmed,
            limit: null,
          });
          const exactMatch = (suggestions || []).find(
            (item) => item.toLowerCase() === trimmed.toLowerCase(),
          );
          const resolvedModel = exactMatch || suggestions?.[0] || trimmed;
          setSearchTerm(resolvedModel);
          navigate(
            `/Results?make=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(resolvedModel)}`,
          );
        } catch (err) {
          console.error('Error autocorrecting model on submit:', err);
          navigate(
            `/Results?make=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(trimmed)}`,
          );
        }
      }
    } else if (trimmed) {
      try {
        const availableBrands = brandCatalog.length > 0
          ? brandCatalog
          : await loadBrandCatalog();
        const suggestions = await sqlCatalogArrays.getBrandNames(trimmed, {
          limit: null,
        });
        const exactMatch = availableBrands.find(
          (item) => item.toLowerCase() === trimmed.toLowerCase(),
        );
        const resolvedBrand = exactMatch || suggestions?.[0];

        if (resolvedBrand) {
          await activateBrandSelection(resolvedBrand);
          return;
        }

        doNavigateWithBrand(trimmed);
      } catch (err) {
        console.error('Error autocorrecting brand on submit:', err);
        doNavigateWithBrand(trimmed);
      }
    }

    // Track search if user is logged in
    if (currentUserId) {
      auth.trackSearch(currentUserId, searchText, filter)
        .then(res => console.log('Search tracked:', res))
        .catch(err => {
          console.error('Error tracking search:', err);
          showFailure('Could not save your search. Try again?', () => {
            // retry: call trackSearch again
            auth.trackSearch(currentUserId, searchText, filter)
              .then(res => {
                console.log('Retry success:', res);
                hideFailure();
                showSuccess('Search saved');
              })
              .catch(e => console.error('Retry failed:', e));
          });
        });
    }
  };

  const handleFilterToggle = () => setFilterOpen((open) => !open);
  const handleFilterSelect = (value) => {
    setFilter(value);
    setFilterOpen(false);
    // optional: focus the input after selecting a filter
    // document.querySelector('.navbar input[aria-label="Search"]')?.focus();
  };

  const clearSelectedBrand = () => {
    setSelectedBrand('');
    setSearchTerm('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scale = Math.max(0.5, 1 - scrollY / 400);
      setLogoScale(scale);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <header className={`sticky-navbar ${isMobile ? 'is-mobile' : isTablet ? 'is-tablet' : 'is-desktop'}`}>
      <div className="navbar-inner">
        <div className="logo-container">
          <Link to="/Home" className="logo-link" aria-label="Rev-Review Home">
            <img
              src={Test1}
              alt="Rev-Review Logo"
              className="navbar-logo"
              style={{ transform: `scale(${logoScale})`,height: '75px', transition: 'transform 0.2s' }}
            />
          </Link>
          <button
            type="button"
            className="hamburger-button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="hamburger-box">
              <span className="hamburger-inner" />
            </span>
          </button>
        </div>

      <nav className={`navbar ${menuOpen ? 'menu-open' : ''}`}>
        <div className={`nav-items ${menuOpen ? 'open' : ''}`}>
          <Link
            to="/Home"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
            style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}
          >
            HOME
          </Link>

          <ul className="nav-list">
            <li
              className="dropdown"
              onMouseEnter={handleDropdown}
              onMouseLeave={closeDropdown}
              style={{ position: 'relative' }}
            >
              <button
                type="button"
                className="nav-link dropdown-toggle"
                onClick={handleDropdown}
                style={{ cursor: 'pointer' }}
              >
                CALCULATE
                <span className={`dropdown-arrow${dropdownOpen ? ' open' : ''}`} style={{ marginLeft: 6 }}>▼</span>
              </button>

              {dropdownOpen && (
                <ul className="dropdown-menu">
                  <CustomLink to="/RevCalculator" onClick={() => setMenuOpen(false)}>Rev Value</CustomLink>
                  <CustomLink to="/RevDistance" onClick={() => setMenuOpen(false)}>Rev Distance</CustomLink>
                </ul>
              )}
            </li>
          </ul>

          <Link
            to="/CarStats"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            COMPARE
          </Link>

          <Link
            to="/Brands"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            BRANDS
          </Link>
          <button
            type="button"
            className="LoginModal"
            onClick={openLoginModal}
            style={{ cursor: 'pointer', background: 'none', border: 'none' }}
          >
            LOGIN
            <svg className="searchbar-action-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
        </div>
      </nav>
      </div>{/* end navbar-inner */}
      {/* Centered search bar placed above the nav links */}
          <SearchBar
            searchBoxRef={searchBoxRef}
            handleFilterToggle={handleFilterToggle}
            filterOpen={filterOpen}
            searchFormRef={searchFormRef}
            searchInputRef={searchInputRef}
            handleSearchSubmit={handleSearchSubmit}
            brandCatalog={brandCatalog}
            selectedBrand={selectedBrand}
            clearSelectedBrand={clearSelectedBrand}
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
            handleSearchInputClick={handleSearchInputClick}
            handleSearchKeyDown={handleSearchKeyDown}
            filter={filter}
            brandCounts={brandCounts}
            showSuggestions={showSuggestions}
            searchSuggestions={searchSuggestions}
            isLoadingSuggestions={isLoadingSuggestions}
            activeSuggestionIndex={activeSuggestionIndex}
            handleSuggestionSelect={handleSuggestionSelect}
            handleFilterSelect={handleFilterSelect}
            openSearchModal={openSearchModal}
            showSearchModal={showSearchModal}
          />
      <hr/>

      {/* Login modal */}
      {showLoginModal && (
        <LoginModal
          onClose={closeLoginModal}
          onSuccess={({ userId, username }) => {
            setCurrentUserId(parseInt(userId));
            closeLoginModal();
            showSuccess(`Logged in as ${username || 'user'}`);
          }}
          onFailure={(msg) => showFailure(msg, openSignupModal)}
          onSignupClick={openSignupModal}
        />
      )}

      {/* Sign Up modal */}
      {showSignupModal && (
        <div 
          role="dialog"
          aria-modal="true"
          /* backdrop clicks do NOT close the signup modal per requirement */
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100, }}
        >
          <div className='Modal-SignUp'
            style={{ width: 520, maxWidth: '95%',
              background: '#fff',
              borderRadius: 8,
              padding: '1rem 1.25rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              position: 'relative',
              color: '#000'
            }}
          >
            <button
              aria-label="Close signup"
              onClick={() => { closeSignupModal(); }}
              style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#AB3636'}
              onMouseLeave={e => e.currentTarget.style.color = '#555'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>


            <SignupForm onSuccess={(data) => {
              console.log('signup data', data);
              closeSignupModal();
              // if SignupForm returned created user info, set local state
              if (data && data.userId) {
                try {
                  setCurrentUserId(parseInt(data.userId));
                } catch {
                  // Silently ignore parsing errors
                }
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('username', data.username || data.email || '');
              } else {
                const uid = localStorage.getItem('userId');
                if (uid) setCurrentUserId(parseInt(uid));
              }
              showSuccess('Signed up successfully');
            }} onFailure={(msg) => {
              // keep signup modal available for retry
              showFailure(msg || 'Registration failed', openSignupModal);
            }} />
          </div>
        </div>
      )}

      {/* success popup */}
      {showSuccessPopup && (
        <div role="status" aria-live="polite" style={{ position: 'fixed', top: 20, right: 20, zIndex: 3500 }}>
          <div style={{ background: '#28a745', color: '#fff', padding: '10px 14px', borderRadius: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
            {successMessage}
          </div>
        </div>
      )}

      {/* failure popup with retry option */}
      {showFailurePopup && (
        <div role="alert" aria-live="assertive" style={{ position: 'fixed', top: 20, right: 20, zIndex: 3600 }}>
          <div style={{ background: '#b02a37', color: '#fff', padding: '12px 16px', borderRadius: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.25)', minWidth: 260 }}>
            <div style={{ marginBottom: 8 }}>{failureMessage}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { if (failureRetry) { try { failureRetry(); } catch { /* ignore errors */ } } hideFailure(); }} style={{ background: '#fff', color: '#b02a37', borderRadius: 6, padding: '6px 10px', border: 'none', cursor: 'pointer' }}>Try again</button>
              <button onClick={hideFailure} style={{ background: 'transparent', color: '#fff', borderRadius: 6, padding: '6px 10px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Search Modal */}
      {showSearchModal && (
        <NavbarSearch
          onSearch={handleSearchResults}
          onClose={closeSearchModal}
        />
      )}

      {/* Search Results Table */}
      {searchResults && searchResults.length > 0 && (
        <div style={{ width: '100%', 
                      padding: '20px', 
                      background: '#f9f9f9', 
                      borderTop: '2px solid #ddd' 
                      }}>
          <SearchResultsTable
            searchResults={searchResults}
            isLoading={isSearching}
            searchCriteria={searchCriteria}
          />
        </div>
      )}
    </header>
  );
}

function CustomLink({ to, children, ...props }) {
  const path = window.location.pathname;
  return (
    <li className={path === to ? "active" : ""}>
      <Link to={to} {...props} className="nav-link">
        {children}
      </Link>
    </li>
  );
}

CustomLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Navbar;