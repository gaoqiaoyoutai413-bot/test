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

    // Fetch latest from Cloud
    fetchExpenses();

    // Fetch data from GAS on load
    fetchExpenses();

    // --- Event Listeners ---
    expenseForm.addEventListener('submit', handleAddExpense);

    // --- Functions ---

    // Fetch data from GAS on load
    async function fetchExpenses() {
        if (!GAS_API_URL) return;

        try {
            const response = await fetch(`${GAS_API_URL}?action=read`);
            const data = await response.json();

            if (Array.isArray(data)) {
                expenses = data.map(item => ({
                    ...item,
                    amount: parseInt(item.amount) // Ensure amount is number
                }));
                saveToLocalStorage(); // Sync to local for offline/backup
                renderExpenses();
                renderSummary();
            }
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        }
    }

    function saveExpense(expense) {
        // Optimistic UI update
        expenses.unshift(expense);
        saveToLocalStorage();

        // Sync to Cloud
        addExpenseToSheet(expense);
    }

    async function addExpenseToSheet(expense) {
        if (!GAS_API_URL) return;

        const formData = new FormData();
        formData.append('action', 'add');
        formData.append('id', expense.id);
        formData.append('date', expense.date);
        formData.append('category', expense.category);
        formData.append('amount', expense.amount);
        formData.append('memo', expense.memo);

        try {
            await fetch(GAS_API_URL, {
                method: 'POST',
                body: formData
            });
            console.log('Added to Sheets');
        } catch (error) {
            console.error('Add failed:', error);
        }
    }

    async function handleAddExpense(e) {
        e.preventDefault();

        const newExpense = {
            id: Date.now(),
            date: dateInput.value,
            category: categoryInput.value,
            amount: parseInt(amountInput.value),
            memo: memoInput.value
        };

        // 1. Save (Local + Cloud)
        saveExpense(newExpense);

        // 2. Update UI
        renderExpenses();
        renderSummary();
        expenseForm.reset();
        dateInput.valueAsDate = new Date(); // Reset date to today
    }

    function deleteExpense(id) {
        if (confirm('この記録を削除しますか？')) {
            // Optimistic UI update
            expenses = expenses.filter(expense => expense.id != id); // loose equality for string/number ID mismatch
            saveToLocalStorage();
            renderExpenses();
            renderSummary();

            // Sync to Cloud
            deleteExpenseFromSheet(id);
        }
    }

    async function deleteExpenseFromSheet(id) {
        if (!GAS_API_URL) return;

        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', id);

        try {
            await fetch(GAS_API_URL, {
                method: 'POST',
                body: formData
            });
            console.log('Deleted from Sheets');
        } catch (error) {
            console.error('Delete failed:', error);
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

    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }
});
