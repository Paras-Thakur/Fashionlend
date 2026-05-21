import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import api from '../utils/axios';

const SearchSuggestions = ({ searchTerm, onSearch, onClose }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/products/suggestions?q=${encodeURIComponent(searchTerm)}`);
        setSuggestions(response.data.suggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          onSearch();
        }
        break;
      case 'Escape':
        onClose();
        break;
      default:
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product' && suggestion._id) {
      navigate(`/products/${suggestion._id}`);
    } else if (suggestion.type === 'category') {
      navigate(`/products/category/${suggestion.name}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(suggestion.name)}`);
    }
    onClose();
  };

  const handleMouseEnter = (index) => {
    setSelectedIndex(index);
  };

  if (!searchTerm.trim() || suggestions.length === 0) {
    return null;
  }

  return (
    <div 
      className="search-suggestions"
      ref={suggestionsRef}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="suggestions-header">
        <span className="suggestions-title">Search Suggestions</span>
        <button 
          className="close-suggestions" 
          onClick={onClose}
          type="button"
        >
          <FaTimes />
        </button>
      </div>
      
      {loading ? (
        <div className="suggestion-item loading">
          <FaSearch className="suggestion-icon" />
          <span>Loading suggestions...</span>
        </div>
      ) : (
        <div className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion._id || suggestion.name || index}`}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => handleMouseEnter(index)}
            >
              <FaSearch className="suggestion-icon" />
              <div className="suggestion-content">
                <div className="suggestion-name">{suggestion.name}</div>
                {suggestion.type === 'product' && (
                  <div className="suggestion-details">
                    <span className="suggestion-category">{suggestion.category}</span>
                    <span className="suggestion-price">₹{suggestion.rentalPrice}/day</span>
                  </div>
                )}
                {suggestion.type === 'category' && (
                  <div className="suggestion-details">
                    <span className="suggestion-type">Category</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="suggestions-footer">
        <span>Press Enter to search for "{searchTerm}"</span>
      </div>
    </div>
  );
};

export default SearchSuggestions;
