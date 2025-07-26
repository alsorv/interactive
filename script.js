function calculateMortgage() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const amortizationYears = parseInt(document.getElementById('amortizationYears').value);
    const amortizationMonths = parseInt(document.getElementById('amortizationMonths').value);
    const annualInterestRate = parseFloat(document.getElementById('interestRate').value);
    const paymentFrequency = document.getElementById('paymentFrequency').value;
    const estimatedPaymentDisplay = document.getElementById('estimatedPaymentDisplay');

    // Clear previous results/errors
    estimatedPaymentDisplay.textContent = '';
    estimatedPaymentDisplay.style.color = '';

    // Validate inputs
    if (isNaN(loanAmount) || loanAmount <= 0) {
        estimatedPaymentDisplay.textContent = 'Please enter a valid amount to borrow.';
        estimatedPaymentDisplay.style.color = 'red';
        return;
    }
    if (isNaN(amortizationYears) || amortizationYears < 0 || amortizationYears > 30) {
        estimatedPaymentDisplay.textContent = 'Please enter valid years (0-30) for amortization.';
        estimatedPaymentDisplay.style.color = 'red';
        return;
    }
    if (isNaN(amortizationMonths) || amortizationMonths < 0 || amortizationMonths > 11) {
        estimatedPaymentDisplay.textContent = 'Please enter valid months (0-11) for amortization.';
        estimatedPaymentDisplay.style.color = 'red';
        return;
    }
    if (isNaN(annualInterestRate) || annualInterestRate < 0.1 || annualInterestRate > 20) {
        estimatedPaymentDisplay.textContent = 'Please enter a valid interest rate (0.1-20%).';
        estimatedPaymentDisplay.style.color = 'red';
        return;
    }

    // Calculate total amortization period in months
    const totalAmortizationMonths = (amortizationYears * 12) + amortizationMonths;
    if (totalAmortizationMonths === 0) {
        estimatedPaymentDisplay.textContent = 'Amortization period cannot be zero.';
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
    // Calculate a base monthly payment if accelerated options are chosen
    if (paymentFrequency.includes('accelerated')) {
        const monthlyPaymentsPerYear = 12;
        const periodicRateMonthly = Math.pow((1 + effectiveAnnualRate), (1 / monthlyPaymentsPerYear)) - 1;
        const totalMonthlyPayments = totalAmortizationMonths; // Use total months for monthly calculation base

        if (periodicRateMonthly === 0) {
            monthlyPaymentForAccelerated = loanAmount / totalMonthlyPayments;
        } else {
            monthlyPaymentForAccelerated = (loanAmount * periodicRateMonthly) / (1 - Math.pow(1 + periodicRateMonthly, -totalMonthlyPayments));
        }
    }

    switch (paymentFrequency) {
        case 'monthly':
            paymentsPerYear = 12;
            totalPayments = totalAmortizationMonths; // Already in months
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1;
            break;
        case 'semi-monthly':
            paymentsPerYear = 24;
            // Total payments = total months * 2 (since 2 semi-monthly payments per month)
            totalPayments = totalAmortizationMonths * 2;
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1;
            break;
        case 'bi-weekly':
            paymentsPerYear = 26;
            // Total payments = total months * (26/12)
            totalPayments = totalAmortizationMonths * (26 / 12);
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1;
            break;
        case 'weekly':
            paymentsPerYear = 52;
            // Total payments = total months * (52/12)
            totalPayments = totalAmortizationMonths * (52 / 12);
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1;
            break;
        case 'accelerated-bi-weekly':
            paymentsPerYear = 26;
            calculatedPayment = monthlyPaymentForAccelerated / 2;
            totalPayments = totalAmortizationMonths * (26 / 12); // For consistency, though actual term is shorter
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1; // Still needed for internal consistency of rate conversion
            break;
        case 'accelerated-weekly':
            paymentsPerYear = 52;
            calculatedPayment = monthlyPaymentForAccelerated / 4;
            totalPayments = totalAmortizationMonths * (52 / 12); // For consistency, though actual term is shorter
            periodicRate = Math.pow((1 + effectiveAnnualRate), (1 / paymentsPerYear)) - 1; // Still needed for internal consistency of rate conversion
            break;
    }

    // --- Step 3: Calculate the payment (if not already done for accelerated) ---
    if (!paymentFrequency.includes('accelerated')) {
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

// Initial calculation when the page loads
document.addEventListener('DOMContentLoaded', calculateMortgage);

// Recalculate whenever an input field changes for a dynamic experience
document.getElementById('loanAmount').addEventListener('input', calculateMortgage);
document.getElementById('amortizationYears').addEventListener('input', calculateMortgage);
document.getElementById('amortizationMonths').addEventListener('input', calculateMortgage);
document.getElementById('interestRate').addEventListener('input', calculateMortgage);
document.getElementById('paymentFrequency').addEventListener('change', calculateMortgage);
