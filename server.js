// Import Express
const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = 3000;

// Middleware (code that runs on every request)
app.use(cors()); // Allow Angular app to call this
app.use(express.json()); // Parse JSON request bodies

// Health check endpoint (test if server is running)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Calculator API is running!' 
  });
});

// SIP Calculator Endpoint
app.post('/api/calculate/sip', (req, res) => {
  try {
    // Get inputs from request body
    const { monthlyInvestment, annualReturn, investmentYears } = req.body;

    // Validation: Check if all inputs are provided
    if (monthlyInvestment === undefined || annualReturn === undefined || investmentYears === undefined) {
      return res.status(400).json({ 
        error: 'Missing inputs',
        message: 'Please provide monthlyInvestment, annualReturn, and investmentYears'
      });
    }

    // Validation: Check if they are numbers
    if (typeof monthlyInvestment !== 'number' || 
        typeof annualReturn !== 'number' || 
        typeof investmentYears !== 'number') {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'All values must be numbers'
      });
    }

    // Validation: Check for positive values
    if (monthlyInvestment <= 0 || annualReturn < 0 || investmentYears <= 0) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Monthly investment and years must be positive. Annual return must be non-negative.'
      });
    }

    // SIP Future Value Calculation
    // Formula: FV = P × ( (1 + r/12)^(12×n) - 1 ) / (r/12)
    // Where: r = annualReturn / 100, n = investmentYears, P = monthlyInvestment
    
    const r = annualReturn / 100;  // Convert percentage to decimal
    const monthlyRate = r / 12;    // Monthly interest rate
    const totalMonths = investmentYears * 12;  // Total number of months
    
    let futureValue;
    
    if (monthlyRate > 0) {
      // Calculate using SIP formula
      const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
      futureValue = monthlyInvestment * (compoundFactor - 1) / monthlyRate;
    } else {
      // If rate is 0, just multiply monthly investment by number of months
      futureValue = monthlyInvestment * totalMonths;
    }
    
    // Round to 2 decimal places
    futureValue = Math.round(futureValue * 100) / 100;
    
    // Calculate total invested
    const totalInvested = monthlyInvestment * totalMonths;
    
    // Calculate wealth gained
    const wealthGained = futureValue - totalInvested;

    // Send result back
    res.json({
      success: true,
      futureValue: futureValue,
      totalInvested: totalInvested,
      wealthGained: wealthGained,
      operation: 'sip',
      inputs: {
        monthlyInvestment: monthlyInvestment,
        annualReturn: annualReturn,
        investmentYears: investmentYears
      }
    });

  } catch (error) {
    // If something goes wrong, send error
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💰 SIP endpoint: POST http://localhost:${PORT}/api/calculate/sip`);
});
