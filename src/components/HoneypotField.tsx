import React from 'react';

interface HoneypotFieldProps {
  value: string;
  onChange: (value: string) => void;
}

// Honeypot field to catch bots - should be hidden from users
export const HoneypotField = ({ value, onChange }: HoneypotFieldProps) => {
  return (
    <div style={{ 
      position: 'absolute',
      left: '-9999px',
      opacity: 0,
      pointerEvents: 'none',
      height: 0,
      overflow: 'hidden'
    }}>
      <label htmlFor="website_url">Website URL (leave empty)</label>
      <input
        type="text"
        id="website_url"
        name="website_url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        tabIndex={-1}
        style={{ position: 'absolute', left: '-9999px' }}
      />
    </div>
  );
};