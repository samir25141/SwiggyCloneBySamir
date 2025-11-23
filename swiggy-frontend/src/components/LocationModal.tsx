import React, { useEffect, useState } from "react";

interface LocationModalProps {
  isOpen: boolean;
  initialValue: string;
  onSave: (location: string) => void;
  onClose: () => void;
  onUseMyLocation?: () => void; // 👈 new optional prop
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  initialValue,
  onSave,
  onClose,
  onUseMyLocation,
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <div className="location-modal-backdrop" onClick={onClose}>
      <div
        className="location-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Change delivery location</h3>
        <p className="location-modal-subtitle">
          Enter your city or area, or use your current location.
        </p>

        <form onSubmit={handleSubmit} className="location-modal-form">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Pune, Maharashtra"
          />
          <div className="location-modal-actions">
            {onUseMyLocation && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onUseMyLocation}
              >
                Use my current location
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;
