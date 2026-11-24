import React from 'react';

export default function Seat({ seat, isSelected, isOccupied, onToggle }) {
  const tierClass = `tier-${seat.tier.toLowerCase()}`;
  let stateClass = '';

  if (isOccupied) {
    stateClass = 'is-occupied';
  } else if (isSelected) {
    stateClass = 'is-selected';
  }

  return (
    <button
      type="button"
      className={`cb-seat-btn ${tierClass} ${stateClass}`}
      disabled={isOccupied}
      onClick={() => onToggle(seat)}
      title={`${seat.id} · ${seat.tier} · ₹${seat.price}${
        isOccupied ? ' (Occupied)' : ''
      }`}
      aria-label={`Seat ${seat.id}, ${seat.tier}, ₹${seat.price}, ${
        isOccupied ? 'Occupied' : isSelected ? 'Selected' : 'Available'
      }`}
    >
      {seat.number}
    </button>
  );
}
