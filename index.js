const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Core SIP calculation logic (matches your Excel formula)
function calculateSipFV(monthlyInvestment, annualReturnPct, years) {
  const r = annualReturnPct / 100; // convert % to decimal
  const monthlyRate = r / 12;
  const n = years * 12;

  // If rate is 0, just sum of contributions
  if (monthlyRate === 0) {
    return monthlyInvestment * n;
  }

  const fv =
    monthlyInvestment *
    ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate);

  return fv;
}

// Simple health check route
app.get('/', (req, res) => {
  res.send('SIP API is running');
});

// Main endpoint: POST /api/sip
app.post('/api/sip', (req, res) => {
  const { monthlyInvestment, annualReturnPct, years } = req.body;

  // Basic validation
  if (
    typeof monthlyInvestment !== 'number' ||
    typeof annualReturnPct !== 'number' ||
    typeof years !== 'number'
  ) {
    return res.status(400).json({ error: 'Inputs must be numbers' });
  }

  if (monthlyInvestment <= 0 || years <= 0 || annualReturnPct < 0) {
    return res
      .status(400)
      .json({ error: 'Invalid input values (check amount, years, rate)' });
  }

  const futureValue = calculateSipFV(
    monthlyInvestment,
    annualReturnPct,
    years
  );

  res.json({
    futureValue,
    inputs: { monthlyInvestment, annualReturnPct, years },
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
