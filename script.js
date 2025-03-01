let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let expenseChart, incomeChart, barChart, lineChart;

function updateUI(filteredTransactions = transactions) {
    const list = document.getElementById("transactions");
    list.innerHTML = "";
    let total = 0;

    filteredTransactions.forEach((item, index) => {
        total += item.type === "income" ? item.amount : -item.amount;

        const listItem = document.createElement("li");
        listItem.innerHTML = `${item.date} - ${item.desc} (${item.department}) - ${item.type} - ${item.amount} 
        <button onclick="removeTransaction(${index})">X</button>`;
        list.appendChild(listItem);
    });

    document.getElementById("balance").textContent = total;
    localStorage.setItem("transactions", JSON.stringify(transactions));

    updateCharts(filteredTransactions);
}

function addTransaction() {
    const desc = document.getElementById("desc").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const department = document.getElementById("department").value;
    const date = new Date().toISOString().split("T")[0];

    if (!desc || isNaN(amount)) return alert("Enter valid details!");

    transactions.push({ date, desc, amount, type, department });
    updateUI();
}

function removeTransaction(index) {
    transactions.splice(index, 1);
    updateUI();
}

function filterTransactions() {
    const selectedMonth = document.getElementById("filter-month").value;
    if (!selectedMonth) return updateUI();

    const filtered = transactions.filter(t => t.date.startsWith(selectedMonth));
    updateUI(filtered);
}

function updateCharts(filteredTransactions) {
    const ctx1 = document.getElementById("expenseChart").getContext("2d");
    const ctx2 = document.getElementById("incomeChart").getContext("2d");
    const ctx3 = document.getElementById("incomeExpenseChart").getContext("2d");
    const ctx4 = document.getElementById("profitLossChart").getContext("2d");

    const departments = ["HR", "Marketing", "Sales", "IT", "Operations"];

    const expenses = departments.map(dept => 
        filteredTransactions.filter(t => t.department === dept && t.type === "expense")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    );
    const income = departments.map(dept => 
        filteredTransactions.filter(t => t.department === dept && t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0)
    );

    if (expenseChart) expenseChart.destroy();
    if (incomeChart) incomeChart.destroy();
    if (barChart) barChart.destroy();
    if (lineChart) lineChart.destroy();

    expenseChart = new Chart(ctx1, { type: "pie", data: { labels: departments, datasets: [{ data: expenses, backgroundColor: ["red", "blue", "yellow", "green", "purple"] }] } });
    incomeChart = new Chart(ctx2, { type: "pie", data: { labels: departments, datasets: [{ data: income, backgroundColor: ["blue", "green", "red", "yellow", "purple"] }] } });
    barChart = new Chart(ctx3, { type: "bar", data: { labels: departments, datasets: [{ label: "Income", data: income, backgroundColor: "green" }, { label: "Expenses", data: expenses, backgroundColor: "red" }] } });
    lineChart = new Chart(ctx4, { type: "line", data: { labels: departments, datasets: [{ label: "Profit/Loss", data: income.map((inc, i) => inc - expenses[i]), borderColor: "blue", fill: false }] } });
}

function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Date,Description,Department,Type,Amount\n";
    transactions.forEach(t => {
        csvContent += `${t.date},${t.desc},${t.department},${t.type},${t.amount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Budget Tracker Transactions", 10, 10);
    
    let y = 20;
    transactions.forEach(t => {
        doc.text(`${t.date} - ${t.desc} (${t.department}) - ${t.type} - ${t.amount}`, 10, y);
        y += 10;
    });
    
    doc.save("transactions.pdf");
}

function updateDarkModeStyles() {
    const transactionsList = document.getElementById("transactions");
    if (document.body.classList.contains("dark-mode")) {
        transactionsList.style.backgroundColor = "#444";
        transactionsList.style.color = "#fff";
    } else {
        transactionsList.style.backgroundColor = "#f9f9f9";
        transactionsList.style.color = "#000";
    }
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    updateDarkModeStyles();
}

updateDarkModeStyles();
updateUI();