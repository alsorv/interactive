function calculateMortgage() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const amortizationPeriodYears = parseFloat(document.getElementById('amortizationPeriod').value);
    const annualInterestRate = parseFloat(document.getElementById('interestRate').value);
    const paymentFrequency = document.getElementById('paymentFrequency').value;
    const estimatedPaymentDisplay = document.getElementById('estimatedPaymentDisplay');

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
    // For accelerated payments, we first calculate the monthly payment and then derive.
    // This correctly reflects the Canadian accelerated payment methodology.

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
            paymentsPerYear = 26; // Number of payments per year for calculation of total payments/cost (if needed)
            calculatedPayment = monthlyPaymentForAccelerated / 2; // This is the actual payment amount
            totalPayments = amortizationPeriodYears * paymentsPerYear; // For consistency, though actual term is shorter
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1; // Still needed for internal consistency of rate conversion
            break;
        case 'accelerated-weekly':
            paymentsPerYear = 52; // Number of payments per year
            calculatedPayment = monthlyPaymentForAccelerated / 4; // This is the actual payment amount
            totalPayments = amortizationPeriodYears * paymentsPerYear; // For consistency, though actual term is shorter
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1; // Still needed for internal consistency of rate conversion
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
    estimatedPaymentDisplay.style.color = '#28a745'; // Reset color if it was red from an error
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

// Initial calculation when the page loads
document.addEventListener('DOMContentLoaded', calculateMortgage);

// Recalculate whenever an input field changes for a dynamic experience
document.getElementById('loanAmount').addEventListener('input', calculateMortgage);
document.getElementById('amortizationPeriod').addEventListener('change', calculateMortgage);
document.getElementById('interestRate').addEventListener('input', calculateMortgage);
document.getElementById('paymentFrequency').addEventListener('change', calculateMortgage);

// Explicitly call calculateMortgage when the button is clicked
// (The input/change listeners already handle most updates, but this ensures a recalculation
// if the user clicks the button without changing anything, which is expected behavior).
document.querySelector('button').addEventListener('click', calculateMortgage);
