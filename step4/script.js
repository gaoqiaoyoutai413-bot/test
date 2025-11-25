document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
    const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwgsz2ylmgJ_u-r7Inoj1l_TYIct2lAlacYYCJEk7w_k0VYN-rzgwDceE40EmtgEkWA/exec'; 

    // --- DOM Elements ---
    const expenseForm = document.getElementById('expense-form');
    const dateInput = document.getElementById('date');
    const categoryInput = document.getElementById('category');
    const amountInput = document.getElementById('amount');
    const memoInput = document.getElementById('memo');
    const expenseList = document.getElementById('expense-list');
    const categorySummary = document.getElementById('category-summary');
    const totalAmountDisplay = document.getElementById('total-amount-display');

    // --- Initialization ---
    // Set default date to today
    dateInput.valueAsDate = new Date();
    
    // Load data from localStorage
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    renderExpenses();
    renderSummary();

    // --- Event Listeners ---
    expenseForm.addEventListener('submit', handleAddExpense);

    // --- Functions ---

    async function handleAddExpense(e) {
        e.preventDefault();

        const newExpense = {
            id: Date.now(),
            date: dateInput.value,
            category: categoryInput.value,
            amount: parseInt(amountInput.value),
            memo: memoInput.value
        };

        // 1. Save to Local State
        expenses.unshift(newExpense); // Add to beginning of array
        saveToLocalStorage();

        // 2. Update UI
        renderExpenses();
        renderSummary();
        expenseForm.reset();
        dateInput.valueAsDate = new Date(); // Reset date to today

        // 3. Sync to Google Sheets (Fire and Forget)
        if (GAS_API_URL) {
            syncToSheets(newExpense);
        } else {
            console.log('GAS_API_URL is not set. Skipping sync.');
        }
    }

    function deleteExpense(id) {
        if (confirm('この記録を削除しますか？')) {
            expenses = expenses.filter(expense => expense.id !== id);
            saveToLocalStorage();
            renderExpenses();
            renderSummary();
        }
    }

    function saveToLocalStorage() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    function renderExpenses() {
        expenseList.innerHTML = '';

        expenses.forEach(expense => {
            const li = document.createElement('li');
            li.className = 'expense-item';
            li.innerHTML = `
                <span class="expense-date">${formatDate(expense.date)}</span>
                <span class="expense-category">${expense.category}</span>
                <span class="expense-memo">${expense.memo || '-'}</span>
                <span class="expense-amount">¥${expense.amount.toLocaleString()}</span>
                <button class="btn-delete" onclick="deleteExpense(${expense.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            // Attach event listener dynamically to avoid global scope issues if needed, 
            // but inline onclick is simple for this scale. 
            // Better practice:
            li.querySelector('.btn-delete').onclick = () => deleteExpense(expense.id);
            
            expenseList.appendChild(li);
        });
    }

    function renderSummary() {
        const summary = {};
        let total = 0;

        expenses.forEach(expense => {
            if (!summary[expense.category]) {
                summary[expense.category] = 0;
            }
            summary[expense.category] += expense.amount;
            total += expense.amount;
        });

        // Render Category Summary
        categorySummary.innerHTML = '';
        Object.keys(summary).forEach(category => {
            const div = document.createElement('div');
            div.className = 'summary-item';
            div.innerHTML = `
                <span>${category}</span>
                <span>¥${summary[category].toLocaleString()}</span>
            `;
            categorySummary.appendChild(div);
        });

        // Render Total
        totalAmountDisplay.textContent = `¥${total.toLocaleString()}`;
    }

    async function syncToSheets(data) {
        try {
            // Using no-cors mode because GAS Web Apps often have CORS issues with simple fetch
            // Note: with no-cors, we can't read the response, but we can send data.
            // Ideally, the GAS script should return JSONP or set correct CORS headers.
            // For this simple example, we'll try standard POST and log errors.
            
            // Actually, for GAS `doPost` to work with CORS, it needs to return ContentService.createTextOutput()
            // and we need to follow redirects.
            
            const formData = new FormData();
            formData.append('date', data.date);
            formData.append('category', data.category);
            formData.append('amount', data.amount);
            formData.append('memo', data.memo);

            await fetch(GAS_API_URL, {
                method: 'POST',
                body: formData
            });
            console.log('Synced to Sheets');
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }
});
