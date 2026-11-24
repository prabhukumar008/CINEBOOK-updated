import React, { useState } from 'react';
import { CheckCircle2, Pencil, Plus, Tag, Trash2, X } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { useBooking } from '../context/BookingContext';
import { formatCurrency } from '../utils/bookingHelpers';

const EMPTY_COUPON = {
  code: '',
  discountType: 'percentage',
  discountValue: 15,
  maxDiscount: 150,
  minBookingAmount: 300,
  expiryDate: '2027-12-31',
  isActive: true,
};

export default function ManageCoupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useBooking();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_COUPON);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [feedback, setFeedback] = useState('');

  function showNotice(text) {
    setFeedback(text);
    setTimeout(() => setFeedback(''), 3000);
  }

  function handleOpenAdd() {
    setEditingId(null);
    setFormData(EMPTY_COUPON);
    setFormError('');
    setShowModal(true);
  }

  function handleOpenEdit(coupon) {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
      minBookingAmount: coupon.minBookingAmount,
      expiryDate: coupon.expiryDate,
      isActive: Boolean(coupon.isActive),
    });
    setFormError('');
    setShowModal(true);
  }

  function handleSave(event) {
    event.preventDefault();
    setFormError('');

    if (!formData.code.trim()) {
      setFormError('Coupon code is required.');
      return;
    }

    if (Number(formData.discountValue) <= 0 || Number(formData.maxDiscount) <= 0) {
      setFormError('Discount values must be greater than zero.');
      return;
    }

    const res = editingId
      ? updateCoupon(editingId, formData)
      : addCoupon(formData);

    if (!res.success) {
      setFormError(res.message);
      return;
    }

    showNotice(
      editingId
        ? `Updated coupon ${formData.code.toUpperCase()}.`
        : `Created coupon ${formData.code.toUpperCase()}.`
    );
    setShowModal(false);
    setEditingId(null);
  }

  function handleConfirmDelete() {
    if (!confirmDelete) {
      return;
    }
    deleteCoupon(confirmDelete.id);
    showNotice(`Deleted coupon ${confirmDelete.code}.`);
    setConfirmDelete(null);
  }

  const filteredCoupons = coupons.filter((cpn) => {
    const query = searchText.trim().toLowerCase();
    const matchesQuery = !query || cpn.code.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && cpn.isActive) ||
      (statusFilter === 'Inactive' && !cpn.isActive);
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Manage Coupons</h1>
          <p className="text-secondary small mb-0">
            Create and manage discount codes applied directly in customer
            checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn cb-btn-primary d-inline-flex align-items-center gap-2"
        >
          <Plus size={16} />
          <span>Add Coupon</span>
        </button>
      </div>

      {feedback && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-3">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      <div className="cb-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-8">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Search coupon code..."
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select cb-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="cb-card p-3 p-md-4">
        {filteredCoupons.length === 0 ? (
          <div className="text-center py-5">
            <Tag size={36} className="text-secondary mb-2" />
            <p className="text-secondary mb-3">No coupons found.</p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="btn btn-sm cb-btn-primary"
            >
              Create Coupon
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0 small">
              <thead>
                <tr className="text-secondary">
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Max Discount</th>
                  <th>Min Subtotal</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="cb-mono fw-bold cb-text-gold">
                      {coupon.code}
                    </td>
                    <td className="cb-tabular">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : formatCurrency(coupon.discountValue)}
                    </td>
                    <td className="cb-tabular">
                      {formatCurrency(coupon.maxDiscount)}
                    </td>
                    <td className="cb-tabular">
                      {formatCurrency(coupon.minBookingAmount)}
                    </td>
                    <td className="cb-tabular">{coupon.expiryDate}</td>
                    <td>
                      <span
                        className={
                          coupon.isActive
                            ? 'text-success fw-semibold'
                            : 'text-secondary fw-semibold'
                        }
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(coupon)}
                          className="btn btn-sm cb-btn-outline px-2"
                          aria-label={`Edit ${coupon.code}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(coupon)}
                          className="btn btn-sm cb-btn-outline text-danger px-2"
                          aria-label={`Delete ${coupon.code}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  {editingId ? 'Edit Coupon' : 'Add Coupon'}
                </h5>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-sm cb-btn-outline px-2"
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="alert alert-danger small py-2">{formError}</div>
              )}

              <form onSubmit={handleSave}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input cb-mono text-uppercase"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Discount Type
                    </label>
                    <select
                      className="form-select cb-select"
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountType: e.target.value,
                        })
                      }
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-control cb-input"
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Max Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-control cb-input"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxDiscount: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Min Booking Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control cb-input"
                      value={formData.minBookingAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minBookingAmount: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      className="form-control cb-input"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expiryDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="couponActiveCheck"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                      />
                      <label
                        className="form-check-label small"
                        htmlFor="couponActiveCheck"
                      >
                        Coupon is active for customer checkout
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn cb-btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn cb-btn-primary">
                    {editingId ? 'Save Changes' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {confirmDelete && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <h5 className="fw-bold mb-2">Delete Coupon?</h5>
              <p className="small text-secondary mb-4">
                Delete coupon <strong className="cb-mono">{confirmDelete.code}</strong>?
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="btn btn-sm cb-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="btn btn-sm btn-danger"
                >
                  Delete Coupon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
