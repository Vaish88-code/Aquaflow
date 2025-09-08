import React from 'react';

interface UpiPayButtonProps {
  amount?: number;
  upiId?: string;
  label?: string;
}

const DEFAULT_UPI_ID = 'vg2530774-1@oksbi';

export const UpiPayButton: React.FC<UpiPayButtonProps> = ({
  amount = 500,
  upiId = DEFAULT_UPI_ID,
  label = 'Pay ₹500 with UPI'
}) => {
  const href = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent('Aqua Flow')}&am=${encodeURIComponent(String(amount))}&cu=INR`;

  return (
    <a
      className="inline-block bg-sky-600 text-white font-semibold px-5 py-3 rounded-xl shadow-md hover:bg-sky-700 transition-colors"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
};

export default UpiPayButton;


