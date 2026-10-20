/* =========================================================================
   MONVAEL OS - CENTRAL ARCHITECTURE SOFTWARE ENGINE
   ========================================================================= */
const KEYS = {
    EXPENSES: 'monvael_ledger_cache',
    CAPITAL: 'monvael_threshold_limit',
    ALARMS: 'monvael_category_alarms'
};

let expenses = JSON.parse(localStorage.getItem(KEYS.EXPENSES)) || [];
let capitalLimit = parseFloat(localStorage.getItem(KEYS.CAPITAL)) || 100000;
let categoryAlarms = JSON.parse(localStorage.getItem(KEYS.ALARMS)) || {};

window.addEventListener('DOMContentLoaded', () => {

    const dom = {
        capitalInput: document.getElementById('capital-input'),
        expenseForm: document.getElementById('expense-form'),
        expTitle: document.getElementById('exp-title'),
        expCategory: document.getElementById('exp-category'),
        expDate: document.getElementById('exp-date'), 
        expRemarks: document.getElementById('exp-remarks'),
        expAmount: document.getElementById('exp-amount'),
        ledgerSearch: document.getElementById('ledger-search'),
        exportCsvBtn: document.getElementById('export-csv-btn'),

        tabLedger: document.getElementById('tab-ledger'),
        tabAnalytics: document.getElementById('tab-analytics'),
        tabAlarms: document.getElementById('tab-alarms'),
        viewLedger: document.getElementById('view-ledger'),
        viewAnalytics: document.getElementById('view-analytics'),
        viewAlarms: document.getElementById('view-alarms'),

        metricAllocated: document.getElementById('metric-allocated'),
        metricSpent: document.getElementById('metric-spent'),
        metricRunway: document.getElementById('metric-runway'),
        cardSpent: document.getElementById('card-spent'),
        labelSpent: document.getElementById('label-spent'),
        alertTextSpent: document.getElementById('alert-text-spent'),
        cardRunway: document.getElementById('card-runway'),

        chartContainer: document.getElementById('chart-container'),
        toggleChartBtn: document.getElementById('toggle-chart-btn'),
        ledgerStreamContainer: document.getElementById('ledger-stream-container'),
        toastMatrix: document.getElementById('toast-matrix'),
        
        alarmForm: document.getElementById('alarm-form'),
        alarmCategory: document.getElementById('alarm-category'),
        alarmLimit: document.getElementById('alarm-limit'),
        alarmsRegistryContainer: document.getElementById('alarms-registry-container')
    };

    // Set default date picker value to today's temporal date automatically
    if(dom.expDate) {
        dom.expDate.value = new Date().toISOString().split('T')[0];
    }

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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const switchWorkflowTab = (activeTab, activeView) => {
        [dom.tabLedger, dom.tabAnalytics, dom.tabAlarms].forEach(tab => {
            if (tab) {
                tab.className = "px-5 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:text-slate-900 hover:bg-white/50 transition-all duration-150";
            }
        });
        if (activeTab) {
            activeTab.className = "px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white shadow-sm";
        }
        
        [dom.viewLedger, dom.viewAnalytics, dom.viewAlarms].forEach(view => {
            if (view) view.classList.add('hidden');
        });
        if (activeView) activeView.classList.remove('hidden');
        
        if(activeView === dom.viewAnalytics) renderAnalyticsCharts();
    };

    if (dom.tabLedger) dom.tabLedger.addEventListener('click', () => switchWorkflowTab(dom.tabLedger, dom.viewLedger));
    if (dom.tabAnalytics) dom.tabAnalytics.addEventListener('click', () => switchWorkflowTab(dom.tabAnalytics, dom.viewAnalytics));
    if (dom.tabAlarms) dom.tabAlarms.addEventListener('click', () => switchWorkflowTab(dom.tabAlarms, dom.viewAlarms));

    const updateCoreMetrics = () => {
        const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
        const activeRunway = capitalLimit - totalSpent;

        if (dom.metricAllocated) dom.metricAllocated.textContent = formatCurrency(capitalLimit);
        if (dom.metricSpent) dom.metricSpent.textContent = formatCurrency(totalSpent);
        if (dom.metricRunway) dom.metricRunway.textContent = formatCurrency(activeRunway);

        if (dom.cardSpent && dom.labelSpent && dom.alertTextSpent) {
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
        }

        if (dom.cardRunway) {
            dom.cardRunway.className = activeRunway < 0 
                ? "bg-slate-100 border border-slate-200 rounded-3xl p-5 flex flex-col justify-between min-h-[110px] opacity-60" 
                : "bg-emerald-500/[0.08] border border-emerald-500/20 rounded-3xl p-5 flex flex-col justify-between min-h-[110px]";
        }
    };

    const renderAnalyticsCharts = () => {
        if (!dom.chartContainer) return;
        dom.chartContainer.innerHTML = '';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const volumeMatrix = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0};

        expenses.forEach(item => {
            const dayIndex = new Date(item.date).getDay();
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
            setTimeout(() => { 
                const innerBar = columnNode.querySelector('.bg-slate-900');
                if (innerBar) innerBar.style.height = `${computationalHeight}%`; 
            }, 50);
        });
    };

    if (dom.toggleChartBtn) {
        dom.toggleChartBtn.addEventListener('click', () => {
            if (!dom.chartContainer) return;
            if(dom.chartContainer.style.height === '0px') {
                dom.chartContainer.style.height = '192px';
                dom.toggleChartBtn.textContent = 'Hide Matrix';
            } else {
                dom.chartContainer.style.height = '0px';
                dom.toggleChartBtn.textContent = 'Expand Matrix';
            }
        });
    }

    const computeCategorySum = (categoryName) => {
        return expenses.filter(item => item.category === categoryName).reduce((sum, item) => sum + item.amount, 0);
    };

    const renderLedgerRows = (filterQuery = '') => {
        if (!dom.ledgerStreamContainer) return;
        dom.ledgerStreamContainer.innerHTML = '';
        const matchingRecords = expenses.filter(item => 
            item.title.toLowerCase().includes(filterQuery.toLowerCase()) || 
            item.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
            (item.remarks || '').toLowerCase().includes(filterQuery.toLowerCase())
        );

        if (matchingRecords.length === 0) {
            dom.ledgerStreamContainer.innerHTML = `<div class="p-4 bg-slate-50 text-slate-400 font-semibold text-xs text-center rounded-2xl border border-slate-100">No operational records match query parameters.</div>`;
            return;
        }

        matchingRecords.forEach(item => {
            const categorySpend = computeCategorySum(item.category);
            const isBreached = categoryAlarms[item.category] && categorySpend > categoryAlarms[item.category];
            const borderAlertClass = isBreached ? 'border-red-500/40 bg-red-500/[0.02] hover:bg-red-500/[0.04]' : 'border-slate-100/80 bg-slate-50 hover:bg-slate-100/70';

            const row = document.createElement('div');
            row.className = `flex items-center justify-between p-4 rounded-2xl border ${borderAlertClass} transition-all duration-150`;
            row.innerHTML = `
                <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-900">${item.title}</span>
                        ${isBreached ? '<span class="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">Category Alert</span>' : ''}
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded uppercase tracking-wider">${item.category}</span>
                        <span class="text-[9px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">${item.date}</span>
                    </div>
                    ${item.remarks ? `<p class="text-[10px] text-slate-500 italic mt-1.5 bg-slate-100/50 px-2.5 py-1 rounded-lg border border-slate-200/20">"${item.remarks}"</p>` : ''}
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-xs font-black text-slate-900">${formatCurrency(item.amount)}</span>
                    <button onclick="deleteExpense(${item.id})" class="text-slate-400 hover:text-red-500 font-bold text-xs p-1">✕</button>
                </div>
            `;
            dom.ledgerStreamContainer.appendChild(row);
        });
    };

    if (dom.ledgerSearch) {
        dom.ledgerSearch.addEventListener('input', (e) => renderLedgerRows(e.target.value));
    }

    if (dom.expenseForm) {
        dom.expenseForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const titleValue = dom.expTitle.value.trim();
            const categoryValue = dom.expCategory.value;
            const dateValue = dom.expDate.value; 
            const remarksValue = dom.expRemarks ? dom.expRemarks.value.trim() : '';
            const amountValue = parseFloat(dom.expAmount.value);

            const targetTransaction = { 
                id: Date.now(), 
                title: titleValue, 
                category: categoryValue, 
                date: dateValue, 
                remarks: remarksValue, 
                amount: amountValue 
            };
            
            expenses.push(targetTransaction);
            localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));

            dom.expTitle.value = '';
            if (dom.expRemarks) dom.expRemarks.value = '';
            dom.expAmount.value = '';
            dom.expDate.value = new Date().toISOString().split('T')[0];

            updateCoreMetrics();
            renderLedgerRows();
            triggerToast(`Operational burn logged: ${titleValue}`);
        });
    }

    window.deleteExpense = (targetId) => {
        expenses = expenses.filter(item => item.id !== targetId);
        localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
        updateCoreMetrics();
        renderLedgerRows();
        triggerToast("Ledger entity purged dynamically.", "warning");
    };

    if (dom.capitalInput) {
        dom.capitalInput.addEventListener('input', (event) => {
            const val = parseFloat(event.target.value);
            if (!isNaN(val) && val >= 0) {
                capitalLimit = val;
                localStorage.setItem(KEYS.CAPITAL, capitalLimit);
                updateCoreMetrics();
            }
        });
    }

    if (dom.exportCsvBtn) {
        dom.exportCsvBtn.addEventListener('click', () => {
            if(expenses.length === 0) {
                triggerToast("Operation canceled: Storage cache empty.", "warning");
                return;
            }
            let csvContent = "data:text/csv;charset=utf-8,Transaction ID,Description,Category,Date,Remarks,Amount (INR)\n";
            expenses.forEach(item => {
                csvContent += `${item.id},"${item.title.replace(/"/g, '""')}",${item.category},${item.date},"${(item.remarks || '').replace(/"/g, '""')}",${item.amount}\n`;
            });
            
            const encodingUri = encodeURI(csvContent);
            const invisibleAnchor = document.createElement('a');
            invisibleAnchor.setAttribute('href', encodingUri);
            invisibleAnchor.setAttribute('download', `monvael_ledger_export_${Date.now()}.csv`);
            document.body.appendChild(invisibleAnchor);
            invisibleAnchor.click();
            invisibleAnchor.remove();
            triggerToast("Financial matrix spreadsheet downloaded successfully!");
        });
    }

    const synchronizeAlarmsRegistryView = () => {
        if (!dom.alarmsRegistryContainer) return;
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

    if (dom.alarmForm) {
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
    }

    window.disarmAlarm = (categoryKey) => {
        delete categoryAlarms[categoryKey];
        localStorage.setItem(KEYS.ALARMS, JSON.stringify(categoryAlarms));
        synchronizeAlarmsRegistryView();
        renderLedgerRows();
        triggerToast("Alarm vector parameter deleted.", "warning");
    };

    const populateAlarmsSelectorDropdown = () => {
        if (dom.alarmCategory && dom.expCategory) {
            dom.alarmCategory.innerHTML = dom.expCategory.innerHTML;
        }
    };

    if (dom.capitalInput) dom.capitalInput.value = capitalLimit;
    populateAlarmsSelectorDropdown();
    updateCoreMetrics();
    renderLedgerRows();
    synchronizeAlarmsRegistryView();
});
