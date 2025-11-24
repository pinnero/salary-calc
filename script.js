// הגדרת נתונים קבועים
const BASE_SALARY = 18000; // שכר בסיס חודשי
const BASE_SALARY_PERCENT = 0.65; // אחוז שכר הבסיס מה-OTE

// הגדרת הטבלה מתוך התמונה המצורפת
const payoutTiers = [
    { min: 0, max: 0.69, adjustedPayout: 0 },
    { min: 0.70, max: 0.79, adjustedPayout: 0.55 },
    { min: 0.80, max: 0.89, adjustedPayout: 0.70 },
    { min: 0.90, max: 0.99, adjustedPayout: 0.85 },
    { min: 1.00, max: 1.09, adjustedPayout: 1.00 }, // 100%
    { min: 1.10, max: 1.19, adjustedPayout: 1.20 },
    { min: 1.20, max: 1.29, adjustedPayout: 1.40 },
    { min: 1.30, max: 1.39, adjustedPayout: 1.60 },
    { min: 1.40, max: 1.49, adjustedPayout: 1.80 },
    // >150% מטופל בלוגיקה נפרדת
];

function calculateSalary() {
    const quota = parseFloat(document.getElementById('quota').value);
    const actualSales = parseFloat(document.getElementById('actualSales').value);
    const resultOutput = document.getElementById('resultOutput');

    // בדיקות תקינות
    if (isNaN(quota) || isNaN(actualSales) || quota <= 0) {
        resultOutput.innerHTML = '<p style="color:red;">אנא ודא שהיעד (Quota) והמכירות בפועל הוזנו בצורה תקינה.</p>';
        return;
    }

    // 1. חישוב אחוז ביצוע (Attainment)
    const attainment = actualSales / quota; // לדוגמה: 0.85 (85%)

    // 2. חישוב עמלת יעד (Target Commission - 35% מה-OTE)
    // OTE = Base / 0.65. Target Commission = OTE * 0.35
    const OTE = BASE_SALARY / BASE_SALARY_PERCENT;
    const targetCommission = OTE * (1 - BASE_SALARY_PERCENT); // 35% מה-OTE

    // 3. מציאת מקדם התשלום המתואם (Adjusted Payout Multiplier)
    let adjustedMultiplier = 0;

    if (attainment > 1.50) {
        // מקרה מיוחד: מעל 150% - "Flat whatever is over"
        // המשמעות המקובלת בתעשייה: 200% תשלום עד 150%, פלוס תוספת ליניארית (או מקדם מיוחד) מעל 150%.
        // בהיעדר מקדם ספציפי ל"Flat whatever is over", נשתמש בנוסחת ליניאריות נפוצה:
        // ל-150% משלמים 200%. כל אחוז נוסף מעל 150% יזכה במקדם של 200% + (Attainment - 1.5) * 200%
        // נשתמש בנוסחה הפשוטה ש-150% נותן 200%, וכל אחוז נוסף מעל 150% מתוגמל כפול:
        adjustedMultiplier = 2.00 + ((attainment - 1.50) * 2.00); 
    } else {
        // מציאת המקדם בטבלה
        const tier = payoutTiers.find(t => attainment >= t.min && attainment <= t.max);

        if (tier) {
            adjustedMultiplier = tier.adjustedPayout;
        } else {
            // אם Attainment מתחת ל-70% (אך מעל 0), מקדם 0.
            // Tier 0-69% כבר מכסה זאת.
            adjustedMultiplier = 0;
        }
    }

    // 4. חישוב העמלה בפועל (Actual Commission)
    const actualCommission = targetCommission * adjustedMultiplier;

    // 5. חישוב סך השכר (Total Pay)
    const totalPay = BASE_SALARY + actualCommission;

    // עיצוב התוצאות
    const formatter = new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        minimumFractionDigits: 0,
    });

    // הצגת התוצאות
    resultOutput.innerHTML = `
        <p><strong>אחוז ביצוע (Attainment):</strong> ${(attainment * 100).toFixed(2)}%</p>
        <p><strong>מקדם תשלום מתואם:</strong> ${(adjustedMultiplier * 100).toFixed(0)}%</p>
        <p><strong>עמלת יעד חודשית (35%):</strong> ${formatter.format(targetCommission)}</p>
        <hr>
        <p><strong>עמלה בפועל (35% Adjusted):</strong> ${formatter.format(actualCommission)}</p>
        <p><strong>שכר בסיס (65%):</strong> ${formatter.format(BASE_SALARY)}</p>
        <hr>
        <p class="final-pay"><strong>החודש את מרוויחה בסך הכל: </strong> ${formatter.format(totalPay)} !!!בשביל לקנות לי דברים</p>
    `;
}
