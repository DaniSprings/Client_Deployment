import PropTypes from 'prop-types';
import './SearchResultsTable.css';

const SearchResultsTable = ({ searchResults = [], isLoading = false, searchCriteria = {} }) => {
  if (isLoading) {
    return (
      <div className="search-results-container">
        <div className="loading">Searching...</div>
      </div>
    );
  }

  if (!searchResults || searchResults.length === 0) {
    return (
      <div className="search-results-container">
        <div className="no-results">No cars found. Try adjusting your search criteria.</div>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="search-criteria-summary">
        <h3>Search Results</h3>
        {searchCriteria.brand && <span className="criteria">Brand: {searchCriteria.brand}</span>}
        {searchCriteria.model && <span className="criteria">Model: {searchCriteria.model}</span>}
        <span className="result-count">{searchResults.length} results found</span>
      </div>

      <div className="table-scroll">
        <table className="search-results-table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Model</th>
              <th>Price</th>
              <th>Engine</th>
              <th>Top Speed</th>
              <th>Acceleration</th>
              <th>Length</th>
              <th>Width</th>
              <th>Height</th>
              <th>Wheelbase</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((car, index) => (
              <tr key={index} className="result-row">
                <td className="brand-cell">{car.brand}</td>
                <td className="model-cell">{car.model}</td>
                <td className="price-cell">
                  {car.price ? `$${car.price.toLocaleString()}` : 'N/A'}
                </td>
                <td className="engine-cell">{car.engine}</td>
                <td className="speed-cell">{car.topSpeed}</td>
                <td className="accel-cell">{car.acceleration}</td>
                <td className="dimension-cell">{car.length}</td>
                <td className="dimension-cell">{car.width}</td>
                <td className="dimension-cell">{car.height}</td>
                <td className="dimension-cell">{car.wheelbase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

SearchResultsTable.propTypes = {
  searchResults: PropTypes.arrayOf(
    PropTypes.shape({
      brand: PropTypes.string,
      model: PropTypes.string,
      price: PropTypes.number,
      engine: PropTypes.string,
      topSpeed: PropTypes.string,
      acceleration: PropTypes.string,
      length: PropTypes.string,
      width: PropTypes.string,
      height: PropTypes.string,
      wheelbase: PropTypes.string,
    })
  ),
  isLoading: PropTypes.bool,
  searchCriteria: PropTypes.shape({
    brand: PropTypes.string,
    model: PropTypes.string,
  }),
};

export default SearchResultsTable;
