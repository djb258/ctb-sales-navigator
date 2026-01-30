-- Remove unused Monte Carlo constants
DELETE FROM montecarlo_constants 
WHERE constant_name IN (
  'Wellness ROI',
  'Admin Fee Growth',
  'Stop Loss Premium',
  'Claims Volatility',
  'Network Discount'
);