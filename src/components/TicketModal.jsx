import React from 'react';
import { X } from 'lucide-react';
import Ticket from './Ticket';

export default function TicketModal({ booking, onClose }) {
  if (!booking) {
    return null;
  }

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content bg-transparent border-0">
          <div className="d-flex justify-content-end mb-2 no-print">
            <button
              type="button"
              className="btn btn-sm cb-btn-outline px-2"
              onClick={onClose}
              aria-label="Close ticket modal"
            >
              <X size={18} />
            </button>
          </div>
          <Ticket booking={booking} />
        </div>
      </div>
    </div>
  );
}
