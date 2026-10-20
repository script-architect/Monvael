/* =========================================================================
   MONVAEL OS - MASTER DATA STORAGE & PIPELINE ARCHITECTURE LOGIC ENGINE
   All code comments follow clean, industrial enterprise production specifications.
   ========================================================================= */
const KEYS = {
    EXPENSES: 'monvael_ledger_cache',
    CAPITAL: 'monvael_threshold_limit',
    ALARMS: 'monvael_category_alarms'
};

// Pull application memory states safely utilizing fallback defaults
let expenses = JSON.parse(localStorage.getItem(KEYS.EXPENSES)) || [];
let capitalLimit = parseFloat(localStorage.getItem(KEYS.CAPITAL)) || 100000;
let categoryAlarms = JSON.parse(localStorage.getItem(KEYS.ALARMS)) || {};

// Main processing sequence registers only after browser DOM compilation executes
window.addEventListener('DOMContentLoaded', () => {

    /* =========================================================================
       CENTRAL CORE PROPERTY DOM SELECTION REGISTRY
       ========================================================================= */
    const dom = {
        // Log Entry Input Elements
        capitalInput: document.getElementById('capital-input'),
        expenseForm: document.getElementById('expense-form'),
        expTitle: document.getElementById('exp-title'),
        expCategory: document.getElementById('exp-category'),
        expRemarks: document.getElementById('exp-remarks'), // Metadata node
        expAmount: document.getElementById('exp-amount'),
        ledgerSearch: document.getElementById('ledger-search'),
        exportCsvBtn: document.getElementById('export-csv-btn'),

        // Structural Router Button Components
        tabLedger: document.getElementById('tab-ledger'),
        tabAnalytics: document.getElementById('tab-analytics'),
        tabAlarms: document.getElementById('tab-alarms'),
        viewLedger: document.getElementById('view-ledger'),
        viewAnalytics: document.getElementById('view-analytics'),
        viewAlarms: document.getElementById('view-alarms'),

        // Quantifiable Presentation Cards
        metricAllocated: document.getElementById('metric-allocated'),
        metricSpent: document.getElementById('metric-spent'),
        metricRunway: document.getElementById('metric-runway'),
        cardSpent: document.getElementById('card-spent'),
        labelSpent: document.getElementById('label-spent'),
        alertTextSpent: document.getElementById('alert-text-spent'),
        cardRunway: document.getElementById('card-runway'),

        // UI Target Display Elements
        chartContainer: document.getElementById('chart-container'),
        toggleChartBtn: document.getElementById('toggle-chart-btn'),
        ledgerStreamContainer: document.getElementById('ledger-stream-container'),
        toastMatrix: document.getElementById('toast-matrix'),
        
        // Micro Threshold Control Hooks
        alarmForm: document.getElementById('alarm-form'),
        alarmCategory: document.getElementById('alarm-category'),
        alarmLimit: document.getElementById('alarm-limit'),
        alarmsRegistryContainer: document.getElementById('alarms-registry-container')
    };

    /* =========================================================================
       MACBOOK AESTHETIC VISUAL TOAST ALERT MODULE
       ========================================================================= */
    const triggerToast = (message, status = 'success') => {
        const toast = document.createElement('div');
        const bgType = status === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white';
        toast.className = `${bgType} px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold tracking-tight transition-all duration-300 opacity-0 transform translate-y-2 pointer-events-auto`;
        toast.textContent = message;
        dom.toastMatrix.appendChild(toast);
        
        setTimeout(() => { toast.className = toast.className.replace('opacity-0 translate-y-2', 'opacity-100 translate-y-0'); }, 10);
        setTimeout(() => {
            toast.className = toast.className.replace('opacity-100 translate-y-0', 'opacity-0 translate-y-2');
            setTimeout(() => { toast.remove(); }, 300);
        }, 2500);
    };

    /* =========================================================================
       FINANCIAL GEOGRAPHICAL CURRENCY PRESENTATION CONVERTER
       ========================================================================= */
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    /* =========================================================================
       DYNAMIC MULTI-TAB WORKSPACE MULTIPLEX INTERFACE ROUTER
       ========================================================================= */
    const switchWorkflowTab = (activeTab, activeView) => {
        [dom.tabLedger, dom.tabAnalytics, dom.tabAlarms].forEach(tab => {
            tab.className = "px-5 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:text-slate-900 hover:bg-white/50 transition-all duration-150";
        });
        activeTab.className = "px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white shadow-sm";
        
        [dom.viewLedger, dom.viewAnalytics, dom.viewAlarms].forEach(view => view.classList.add('hidden'));
        activeView.classList.remove('hidden');
        
        if(activeView === dom.viewAnalytics) renderAnalyticsCharts();
    };

    dom.tabLedger.addEventListener('click', () => switchWorkflowTab(dom.tabLedger, dom.viewLedger));
    dom.tabAnalytics.addEventListener('click', () => switchWorkflowTab(dom.tabAnalytics, dom.viewAnalytics));
    dom.tabAlarms.addEventListener('click', () => switchWorkflowTab(dom.tabAlarms, dom.viewAlarms));

    /* =========================================================================
       REAL-TIME DATA COMPUTATION & THEME ALERTS MATRIX ENGINE
       ========================================================================= */
    const updateCoreMetrics = () => {
        const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
        const activeRunway = capitalLimit - totalSpent;

        dom.metricAllocated.textContent = formatCurrency(capitalLimit);
        dom.metricSpent.textContent = formatCurrency(totalSpent);
        dom.metricRunway.textContent = formatCurrency(activeRunway);

        // Manage state updates forcing Crimson alert flags conditionally
        if (totalSpent > capitalLimit) {
            dom.cardSpent.className = "bg-red-500/[0.08] border border-red-500/20 rounded-3xl p-5 flex flex-col justify-between min-h-[110px] transition-all duration-300";
            dom.labelSpent.className = "text-[10px] font-bold text-red-700 uppercase tracking-wider";
            dom.alertTextSpent.className = "text-xxs text-red-600/80 font-bold mt-0.5 animate-pulse";
            dom.alertTextSpent.textContent = "CRITICAL LIMIT BREACHED - ASSET RISK";
        } else {
            dom.cardSpent.className = "bg-white border border-white rounded-3xl p-5 flex flex-col justify-between min-h-[110px] transition-all duration-300";
            dom.labelSpent.className = "text-[10px] font-bold text-slate-400 uppercase tracking-wider";
            dom.alertTextSpent.className = "text-xxs text-slate-400 font-medium mt-0.5";
            dom.alertTextSpent.textContent = "Current operational burn rate";
        }

        dom.cardRunway.className = activeRunway < 0 
            ? "bg-slate-100 border border-slate-200 rounded-3xl p-5 flex flex-col justify-between min-h-[110px] opacity-60" 
            : "bg-emerald-500/[0.08] border border-emerald-500/20 rounded-3xl p-5 flex flex-col justify-between min-h-[110px]";
    };

    /* =========================================================================
       DYNAMIC COLUMN VELOCITY CHART GENERATOR MODULE
       ========================================================================= */
    const renderAnalyticsCharts = () => {
        dom.chartContainer.innerHTML = '';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const volumeMatrix = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0};

        expenses.forEach(item => {
            const dayIndex = new Date(item.id).getDay();
            volumeMatrix[dayIndex] += item.amount;
        });

        const maxVolume = Math.max(...Object.values(volumeMatrix), 1);

        dayNames.forEach((day, index) => {
            const dailySum = volumeMatrix[index];
            const computationalHeight = (dailySum / maxVolume) * 100;
            
            const columnNode = document.createElement('div');
            columnNode.className = "flex flex-col items-center gap-2 group h-full justify-end flex-1";
            columnNode.innerHTML = `
                <div class="text-[9px] font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-1">${formatCurrency(dailySum)}</div>
                <div class="w-full bg-slate-100 rounded-lg relative flex items-end h-28 border border-slate-200/40">
                    <div class="w-full bg-slate-900 rounded-md transition-all duration-1000 ease-out" style="height: 0%"></div>
                </div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">${day}</span>
            `;
            dom.chartContainer.appendChild(columnNode);
            setTimeout(() => { columnNode.querySelector('.bg-slate-900').style.height = `${computationalHeight}%`; }, 50);
        });
    };

    dom.toggleChartBtn.addEventListener('click', () => {
        if(dom.chartContainer.style.height === '0px') {
            dom.chartContainer.style.height = '192px';
            dom.toggleChartBtn.textContent = 'Hide Matrix';
        } else {
            dom.chartContainer.style.height = '0px';
            dom.toggleChartBtn.textContent = 'Expand Matrix';
        }
    });

    /* =========================================================================
       ADVANCED LEDGER LIST PIPELINE (ENHANCED PATTERN MATCHING FILTERS)
       ========================================================================= */
    const computeCategorySum = (categoryName) => {
        return expenses.filter(item => item.category === categoryName).reduce((sum, item) => sum + item.amount, 0);
    };

    const renderLedgerRows = (filterQuery = '') => {
        dom.ledgerStreamContainer.innerHTML = '';
        
        // UPGRADED FILTER SEARCH PATTERN: Matches Descriptor Titles, Group Vectors, AND Remarks Metadata Notes
        const matchingRecords = expenses.filter(item => {
            const query = filterQuery.toLowerCase();
            const itemTitle = item.title.toLowerCase();
            const itemCategory = item.category.toLowerCase();
            const itemRemarks = (item.remarks || '').toLowerCase();
            
            return itemTitle.includes(query) || itemCategory.includes(query) || itemRemarks.includes(query);
        });

        if (matchingRecords.length === 0) {
            dom.ledgerStreamContainer.innerHTML = `<div class="p-4 bg-slate-50 text-slate-400 font-semibold text-xs text-center rounded-2xl border border-slate-100">No operational records match the query cache parameters.</div>`;
            return;
        }

        matchingRecords.forEach(item => {
            const categorySpend = computeCategorySum(item.category);
            const isBreached = categoryAlarms[item.category] && categorySpend > categoryAlarms[item.category];
            const borderAlertClass = isBreached ? 'border-red-500/40 bg-red-500/[0.02] hover:bg-red-500/[0.04]' : 'border-slate-100/80 bg-slate-50 hover:bg-slate-100/70';

            const row = document.createElement('div');
            row.className = `flex items-center justify-between p-4 rounded-2xl border ${borderAlertClass} transition-all duration-150`;
            row.innerHTML = `
                <div class="flex flex-col max-w-[70%]">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-xs font-bold text-slate-900">${item.title}</span>
                        ${isBreached ? '<span class="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">Category Alert</span>' : ''}
                    </div>
                    <!-- Display custom comments note cleanly underneath if populated -->
                    ${item.remarks ? `<p class="text-[10px] text-slate-500 font-medium italic mt-0.5">"${item.remarks}"</p>` : ''}
                    <span class="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded mt-1.5 w-max uppercase tracking-wider">${item.category}</span>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-xs font-black text-slate-900">${formatCurrency(item.amount)}</span>
                    <button onclick="deleteExpense(${item.id})" class="text-slate-400 hover:text-red-500 font-bold text-xs p-1">✕</button>
                </div>
            `;
            dom.ledgerStreamContainer.appendChild(row);
        });
    };

    dom.ledgerSearch.addEventListener('input', (e) => renderLedgerRows(e.target.value));

    /* =========================================================================
       SUBMISSION ENGINE CORE DISPATCHER CONTROL CONTROLLER
       ========================================================================= */
    dom.expenseForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const titleValue = dom.expTitle.value.trim();
        const categoryValue = dom.expCategory.value;
        const remarksValue = dom.expRemarks.value.trim(); // Capture metadata entries
        const amountValue = parseFloat(dom.expAmount.value);

        const targetTransaction = { 
            id: Date.now(), 
            title: titleValue, 
            category: categoryValue, 
            remarks: remarksValue, // Inserted safely into state array mapping
            amount: amountValue 
        };
        
        expenses.push(targetTransaction);
        localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));

        // Clear tracking text nodes cleanly
        dom.expTitle.value = '';
        dom.expRemarks.value = '';
        dom.expAmount.value = '';

        updateCoreMetrics();
        renderLedgerRows();
        triggerToast(`Operational burn logged: ${titleValue}`);
    });

    window.deleteExpense = (targetId) => {
        expenses = expenses.filter(item => item.id !== targetId);
        localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
        updateCoreMetrics();
        renderLedgerRows();
        triggerToast("Ledger entity purged dynamically.", "warning");
    };

    dom.capitalInput.addEventListener('input', (event) => {
        const val = parseFloat(event.target.value);
        if (!isNaN(val) && val >= 0) {
            capitalLimit = val;
            localStorage.setItem(KEYS.CAPITAL, capitalLimit);
            updateCoreMetrics();
        }
    });

    /* =========================================================================
       ZERO-SERVER ENCODED SPREADSHEET EXPORT MECHANISM (CSV LOG DATA BLOB)
       ========================================================================= */
    dom.exportCsvBtn.addEventListener('click', () => {
        if(expenses.length === 0) {
            triggerToast("Operation canceled: Storage cache empty.", "warning");
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,Transaction ID,Description,Category,Remarks/Notes,Amount (INR)\n";
        expenses.forEach(item => {
            const cleanTitle = item.title.replace(/"/g, '""');
            const cleanRemarks = (item.remarks || '').replace(/"/g, '""');
            csvContent += `${item.id},"${cleanTitle}",${item.category},"${cleanRemarks}",${item.amount}\n`;
        });
        
        const encodingUri = encodeURI(csvContent);
        const invisibleAnchor = document.createElement('a');
        invisibleAnchor.setAttribute('href', encodingUri);
        invisibleAnchor.setAttribute('download', `monvael_ledger_export_${Date.now()}.csv`);
        document.body.appendChild(invisibleAnchor);
        invisibleAnchor.click();
        invisibleAnchor.remove();
        triggerToast("Spreadsheet downloaded successfully!");
    });

    /* =========================================================================
       LOCALIZED MICRO CATEGORY ALARMS SUBSYSTEM CONTROL PIPELINE
       ========================================================================= */
    const synchronizeAlarmsRegistryView = () => {
        dom.alarmsRegistryContainer.innerHTML = '';
        const registeredKeys = Object.keys(categoryAlarms);

        if(registeredKeys.length === 0) {
            dom.alarmsRegistryContainer.innerHTML = `<div class="p-3 text-xxs font-medium text-slate-400 bg-slate-50 text-center rounded-xl border border-slate-100">No category allocation configurations armed.</div>`;
            return;
        }

        registeredKeys.forEach(cat => {
            const allocatedCap = categoryAlarms[cat];
            const functionalSpend = computeCategorySum(cat);
            const statusLabel = functionalSpend > allocatedCap ? 'text-red-600 font-bold' : 'text-slate-500';

            const alarmNode = document.createElement('div');
            alarmNode.className = "flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl";
            alarmNode.innerHTML = `
                <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-800">${cat}</span>
                    <span class="text-[10px] ${statusLabel} mt-0.5">Burn: ${formatCurrency(functionalSpend)} / Allocation Cap: ${formatCurrency(allocatedCap)}</span>
                </div>
                <button onclick="disarmAlarm('${cat}')" class="text-xxs text-slate-400 hover:text-red-500 font-bold px-2 py-1 rounded">Disarm</button>
            `;
            dom.alarmsRegistryContainer.appendChild(alarmNode);
        });
    };

    dom.alarmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedCat = dom.alarmCategory.value;
        const targetLimit = parseFloat(dom.alarmLimit.value);

        categoryAlarms[selectedCat] = targetLimit;
        localStorage.setItem(KEYS.ALARMS, JSON.stringify(categoryAlarms));
        dom.alarmLimit.value = '';
        synchronizeAlarmsRegistryView();
        renderLedgerRows();
        triggerToast(`Alarm armed for ${selectedCat}`);
    });

    window.disarmAlarm = (categoryKey) => {
        delete categoryAlarms[categoryKey];
        localStorage.setItem(KEYS.ALARMS, JSON.stringify(categoryAlarms));
        synchronizeAlarmsRegistryView();
        renderLedgerRows();
        triggerToast("Alarm vector parameter deleted.", "warning");
    };

    const populateAlarmsSelectorDropdown = () => {
        dom.alarmCategory.innerHTML = dom.expCategory.innerHTML;
    };

    /* =========================================================================
       SYSTEM INITIALIZATION CODES EXECUTION RUNNERS
       ========================================================================= */
    dom.capitalInput.value = capitalLimit;
    populateAlarmsSelectorDropdown();
    updateCoreMetrics();
    renderLedgerRows();
    synchronizeAlarmsRegistryView();
});
