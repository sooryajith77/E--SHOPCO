const generateOrderId = () => {
  return 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
};

const generateTrackingId = () => {
  return 'TRK' + Date.now() + Math.floor(Math.random() * 10000);
};

module.exports = { generateOrderId, generateTrackingId };