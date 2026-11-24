import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search movies by title or director...',
}) {
  return (
    <div className="position-relative">
      <Search
        size={17}
        className="position-absolute top-50 translate-middle-y text-secondary"
        style={{ left: '14px' }}
      />
      <input
        type="text"
        className="form-control cb-input ps-5 pe-5 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary p-2"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
