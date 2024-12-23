// Category rates based on the store subscription type
const starterRates = [
    { label: "Most Categories (13.25%)", value: "13.25" },
    { label: "Books & Magazines, DVDs Movies, Music (14.95%)", value: "14.95" },
    { label: "Coins & Paper Money (13.25%)", value: "13.25" },
    { label: "Musical Instruments (6.35%)", value: "6.35" },
    { label: "Jewelry & Watches (15%)", value: "15" },
    { label: "Athletic Shoes (13.25%)", value: "13.25" },
    { label: "Women's Clothing, Shoes, Bags & HandBags (15%)", value: "15" },
    { label: "Customize", value: "customize" }
];

const basicRates = [
    { label: "Most Categories (12.35%)", value: "12.35" },
    { label: "Books & Magazines, DVDs Movies, Music (14.95%)", value: "14.95" },
    { label: "Clothing, Shoes (12.35%)", value: "12.35" },
    { label: "Women's Bags & HandBags (13%)", value: "13" },
    { label: "Athletic Shoes (12.35%)", value: "12.35" },
    { label: "Coins & Paper Money (9%)", value: "9" },
    { label: "Consumer Electronics (9%)", value: "9" },
    { label: "Jewelry & Watches (13%)", value: "13" },
    { label: "eBay Motors (11.35%)", value: "11.35" },
    { label: "eBay Motors Parts - Tires, Wheels (9.35%)", value: "9.35" },
    { label: "eBay Motors Parts - Protective Gear (12.35%)", value: "12.35" },
    { label: "Musical Instruments (6.35%)", value: "6.35" },
    { label: "Stamps (9.35%)", value: "9.35" },
    { label: "Customize", value: "customize" }
];

// Dynamically populate the category rate dropdown based on store selection
document.querySelectorAll('input[name="store"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
        const categoryRate = document.getElementById("category-rate");
        categoryRate.innerHTML = ""; // Clear existing options

        const rates = e.target.value === "starter" ? starterRates : basicRates;

        rates.forEach((rate) => {
            const option = document.createElement("option");
            option.value = rate.value;
            option.textContent = rate.label;
            categoryRate.appendChild(option);
        });

        // Automatically trigger event for "Custom" behavior if pre-selected
        categoryRate.dispatchEvent(new Event("change"));
    });
});

// Trigger the category rate update on page load for default store selection (starter)
document.querySelector('input[name="store"][value="starter"]').dispatchEvent(new Event("change"));

// Handle "Custom" rate selection
document.getElementById("category-rate").addEventListener("change", (e) => {
    const customizeRateContainer = document.getElementById("customize-rate-container");

    if (e.target.value === "customize") {
        customizeRateContainer.style.display = "block"; // Show input for custom rate
    } else {
        customizeRateContainer.style.display = "none"; // Hide input for custom rate
    }
});

// Function to restrict the input to only allow up to two decimals
function limitDecimalInput(event) {
    const input = event.target;
    let value = input.value;

    // Regular expression to match numbers with up to 2 decimals
    const regex = /^\d+(\.\d{0,2})?$/;

    if (!regex.test(value)) {
        // Remove the last character if it exceeds two decimals
        input.value = value.slice(0, -1);
    }
}

// Add event listeners for inputs to restrict decimals
document.querySelectorAll('#item-cost, #shipping-cost, #selling-price, #shipping-charged, #withdrawal-rate, #sales-tax, #international-rate, #volume-discount, #per-order-fee, #sst, #ad-fee, #customize-rate').forEach((inputField) => {
    inputField.addEventListener("input", limitDecimalInput);
});

// Calculation Logic
document.getElementById("calculate-btn").addEventListener("click", () => {
    try {
        // Retrieve input values
        const itemCost = parseFloat(document.getElementById("item-cost").value) || 0;
        const shippingCost = parseFloat(document.getElementById("shipping-cost").value) || 0;
        const sellingPrice = parseFloat(document.getElementById("selling-price").value) || 0;
        const shippingCharge = parseFloat(document.getElementById("shipping-charged").value) || 0;
        const withdrawalRate = parseFloat(document.getElementById("withdrawal-rate").value) || 4.15;

        const salesTaxRate = parseFloat(document.getElementById("sales-tax").value) / 100 || 0.07;
        const categoryRateDropdown = document.getElementById("category-rate");
        let categoryRate = parseFloat(categoryRateDropdown.value) / 100 || 0.1325;

        if (categoryRateDropdown.value === "customize") {
            const customizeRateInput = parseFloat(document.getElementById("customize-rate").value) || 0;
            categoryRate = customizeRateInput / 100;
        }

        const internationalRate = parseFloat(document.getElementById("international-rate").value) / 100 || 0.013;
        const volumeDiscountRate = parseFloat(document.getElementById("volume-discount").value) / 100 || 0.002;
        const perOrderFee = parseFloat(document.getElementById("per-order-fee").value) || 0.4;
        const sstRate = parseFloat(document.getElementById("sst").value) / 100 || 0.08;
        const adFeeRate = parseFloat(document.getElementById("ad-fee").value) / 100 || 0.0;

        // Perform calculations
        const basePrice = sellingPrice + shippingCharge;
        const salesTax = basePrice * salesTaxRate;
        const orderTotal = basePrice + salesTax;

        const finalValueFees = orderTotal * categoryRate;
        const internationalFee = orderTotal * internationalRate;
        const volumeDiscount = orderTotal * volumeDiscountRate;
        const totalFee = finalValueFees + internationalFee - volumeDiscount + perOrderFee;
        const sst = totalFee * sstRate;
        const totalFeesWithSST = totalFee + sst;

        const adFee = orderTotal * adFeeRate;
        const adFeeWithSST = adFee + (adFee * sstRate);

        const earningsUSD = orderTotal - salesTax - totalFeesWithSST - adFeeWithSST;

        let earningsMYR;
        if (earningsUSD < 100) {
            earningsMYR = (earningsUSD - 1) * withdrawalRate; // Deduct $1 for earnings < $100
        } else {
            earningsMYR = earningsUSD * withdrawalRate;
        }

        const totalCostMYR = itemCost + shippingCost;
        const profitsMYR = earningsMYR - totalCostMYR;

        // Update Results Section
        document.getElementById("final-value-fees-usd").textContent = `-${finalValueFees.toFixed(2)}`;
        document.getElementById("international-fee-usd").textContent = `-${internationalFee.toFixed(2)}`;
        document.getElementById("volume-discount-usd").textContent = volumeDiscount.toFixed(2);
        document.getElementById("per-order-fee-usd").textContent = `-${perOrderFee.toFixed(2)}`;
        document.getElementById("total-fee-usd").textContent = `-${totalFee.toFixed(2)}`;
        document.getElementById("sst-usd").textContent = `-${sst.toFixed(2)}`;
        document.getElementById("total-fees-includes-sst-usd").textContent = `-${totalFeesWithSST.toFixed(2)}`;

        document.getElementById("total-price-usd").textContent = basePrice.toFixed(2);
        document.getElementById("order-total-usd").textContent = orderTotal.toFixed(2);
        document.getElementById("sales-tax-usd").textContent = `-${salesTax.toFixed(2)}`;
        document.getElementById("total-fees-includes-sst-earnings-usd").textContent = `-${totalFeesWithSST.toFixed(2)}`;
        document.getElementById("ad-fee-standard-usd").textContent = `-${adFeeWithSST.toFixed(2)}`;
        document.getElementById("earnings-usd").textContent = earningsUSD.toFixed(2);
        document.getElementById("earnings-myr").textContent = earningsMYR.toFixed(2);
        document.getElementById("total-cost-myr").textContent = totalCostMYR.toFixed(2);
        document.getElementById("profits-myr").textContent = profitsMYR.toFixed(2);
    } catch (error) {
        console.error("Calculation error:", error);
    }
});

// Reset the form and clear results
document.getElementById("reset-btn").addEventListener("click", () => {
    document.getElementById("calculator-form").reset();
    document.querySelectorAll("#results p span").forEach((span) => {
        span.textContent = "-";
    });

    // Hide custom rate input on reset
    document.getElementById("customize-rate-container").style.display = "none";
});
