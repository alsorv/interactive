function calculateMortgage() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const amortizationPeriodYears = parseFloat(document.getElementById('amortizationPeriod').value);
    const annualInterestRate = parseFloat(document.getElementById('interestRate').value);
    const paymentFrequency = document.getElementById('paymentFrequency').value;
    const estimatedPaymentDisplay = document.getElementById('estimatedPaymentDisplay');

    // Clear any previous error messages or results when a new calculation starts
    estimatedPaymentDisplay.textContent = '';
    estimatedPaymentDisplay.style.color = ''; // Reset color

    if (isNaN(loanAmount) || isNaN(amortizationPeriodYears) || isNaN(annualInterestRate) || loanAmount <= 0 || amortizationPeriodYears <= 0 || annualInterestRate < 0) {
        estimatedPaymentDisplay.textContent = 'Please enter valid numbers.';
        estimatedPaymentDisplay.style.color = 'red';
        return;
    }

    // Convert annual interest rate to decimal
    const nominalAnnualRate = annualInterestRate / 100;

    // --- Step 1: Calculate the Effective Annual Rate (EAR) for semi-annual compounding ---
    // Canadian mortgages compound semi-annually.
    const semiAnnualRate = nominalAnnualRate / 2;
    const effectiveAnnualRate = Math.pow((1 + semiAnnualRate), 2) - 1;

    let paymentsPerYear;
    let totalPayments;
    let periodicRate;
    let calculatedPayment;

    // --- Step 2: Determine periodic rate and total payments based on frequency ---
    let monthlyPaymentForAccelerated = 0;
    if (paymentFrequency === 'accelerated-bi-weekly' || paymentFrequency === 'accelerated-weekly') {
        // Calculate monthly payment first to derive accelerated payments
        const monthlyPaymentsPerYear = 12;
        const totalMonthlyPayments = amortizationPeriodYears * monthlyPaymentsPerYear;
        const periodicRateMonthly = Math.pow((1 + effectiveAnnualRate), (1 / monthlyPaymentsPerYear)) - 1;

        if (periodicRateMonthly === 0) { // Handle 0 interest rate case for monthly calc
            monthlyPaymentForAccelerated = loanAmount / totalMonthlyPayments;
        } else {
            monthlyPaymentForAccelerated = (loanAmount * periodicRateMonthly) / (1 - Math.pow(1 + periodicRateMonthly, -totalMonthlyPayments));
        }
    }

    switch (paymentFrequency) {
        case 'monthly':
            paymentsPerYear = 12;
            totalPayments = amortizationPeriodYears * paymentsPerYear;
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1;
            break;
        case 'semi-monthly':
            paymentsPerYear = 24;
            totalPayments = amortizationPeriodYears * paymentsPerYear;
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1;
            break;
        case 'bi-weekly':
            paymentsPerYear = 26;
            totalPayments = amortizationPeriodYears * paymentsPerYear;
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1;
            break;
        case 'weekly':
            paymentsPerYear = 52;
            totalPayments = amortizationPeriodYears * paymentsPerYear;
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1;
            break;
        case 'accelerated-bi-weekly':
            paymentsPerYear = 26;
            calculatedPayment = monthlyPaymentForAccelerated / 2;
            totalPayments = amortizationPeriodYears * paymentsPerYear;
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1;
            break;
        case 'accelerated-weekly':
            paymentsPerYear = 52;
            calculatedPayment = monthlyPaymentForAccelerated / 4;
            totalPayments = amortizationPeriodYears * paymentsPerYear;
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1;
            break;
    }

    // --- Step 3: Calculate the payment (if not already done for accelerated) ---
    if (paymentFrequency !== 'accelerated-bi-weekly' && paymentFrequency !== 'accelerated-weekly') {
        if (periodicRate === 0) { // Handle 0 interest rate case
            calculatedPayment = loanAmount / totalPayments;
        } else {
            calculatedPayment = (loanAmount * periodicRate) / (1 - Math.pow(1 + periodicRate, -totalPayments));
        }
    }

    // --- Display Simple Result ---
    estimatedPaymentDisplay.textContent = `Estimated ${formatPaymentFrequency(paymentFrequency)} Payment: $${calculatedPayment.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    estimatedPaymentDisplay.style.color = '#28a745';
}

function formatPaymentFrequency(key) {
    const frequencies = {
        'monthly': 'Monthly',
        'semi-monthly': 'Semi-Monthly',
        'bi-weekly': 'Bi-Weekly',
        'weekly': 'Weekly',
        'accelerated-bi-weekly': 'Accelerated Bi-Weekly',
        'accelerated-weekly': 'Accelerated Weekly'
    };
    return frequencies[key] || key;
}

// ONLY call calculateMortgage when the button is explicitly clicked
document.querySelector('button').addEventListener('click', calculateMortgage);

// Add a line to ensure the display is empty on load if desired.
// You could also set <p id="estimatedPaymentDisplay"></p> to be empty in HTML initially.
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('estimatedPaymentDisplay').textContent = '';
});
