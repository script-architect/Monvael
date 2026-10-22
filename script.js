/* =========================================================================
   MONVAEL OS - CENTRAL LOGIC SOFTWARE PARSING ARCHITECTURE ENGINE
   Highly structured system managing persistent transactional calculations.
   ========================================================================= */
const KEYS = {
    EXPENSES: 'monvael_ledger_cache',
    CAPITAL: 'monvael_threshold_limit',
    ALARMS: 'monvael_category_alarms'
};

// Extract historical logs or launch self-healing operational buffers safely
let expenses = JSON.parse(localStorage.getItem(KEYS.EXPENSES)) || [];
let capitalLimit = parseFloat(localStorage.getItem(KEYS.CAPITAL)) || 100000;
let categoryAlarms = JSON.parse(localStorage.getItem(KEYS.ALARMS)) || {};
let operationalHistoryStack = null; 

// Guarantee document layout tree parsing finishes completely before linking context listeners
window.addEventListener('DOMContentLoaded', () => {

    const dom = {
        // Form & Configuration Pointers
        capitalInput: document.getElementById('capital-input'),
        expenseForm: document.getElementById('expense-form'),
        expTitle: document.getElementById('exp-title'),
        expCategory: document.getElementById('exp-category'),
        expDate: document.getElementById('exp-date'),
        expRemarks: document.getElementById('exp-remarks'),
        expAmount: document.getElementById('exp-amount'),
        ledgerSearch: document.getElementById('ledger-search'),
        exportCsvBtn: document.getElementById('export-csv-btn'),
        undoBtn: document.getElementById('undo-btn'), 
        exportJsonBtn: document.getElementById('export-json-btn'),
        importTriggerBtn: document.getElementById('import-trigger-btn'),
        importJsonFile: document.getElementById('import-json-file'),
        themeToggleBtn: document.getElementById('theme-toggle-btn'),

        // Interface Tab Switch Controls
        tabLedger: document.getElementById('tab-ledger'),
        tabAnalytics: document.getElementById('tab-analytics'),
        tabAlarms: document.getElementById('tab-alarms'),
        viewLedger: document.getElementById('view-ledger'),
        viewAnalytics: document.getElementById('view-analytics'),
        viewAlarms: document.getElementById('view-alarms'),

        // Financial Metrics Outputs
        metricAllocated: document.getElementById('metric-allocated'),
        metricSpent: document.getElementById('metric-spent'),
        metricRunway: document.getElementById('metric-runway'),
        cardSpent: document.getElementById('card-spent'),
        labelSpent: document.getElementById('label-spent'),
        alertTextSpent: document.getElementById('alert-text-spent'),
        cardRunway: document.getElementById('card-runway'),

        // Graph Elements
        chartContainer: document.getElementById('chart-container'),
        toggleChartBtn: document.getElementById('toggle-chart-btn'),
        ledgerStreamContainer: document.getElementById('ledger-stream-container'),
        toastMatrix: document.getElementById('toast-matrix'),
        
        // Alarms Board Elements
        alarmForm: document.getElementById('alarm-form'),
        alarmCategory: document.getElementById('alarm-category'),
        alarmLimit: document.getElementById('alarm-limit'),
        alarmsRegistryContainer: document.getElementById('alarms-registry-container'),

        // Analytical Insights Fields
        insightPeakDay: document.getElementById('insight-peak-day'),
        insightVelocity: document.getElementById('insight-velocity'),
        insightCount: document.getElementById('insight-count')
    };

    // Lock fallback current temporal index to calendar view configuration parameters automatically
    if(dom.expDate) {
        dom.expDate.value = new Date().toISOString().split('T')[0];
    }

    /* =========================================================================
       MACBOOK PREMIUM FLOATING TACTILE TOAST NOTIFIER
       ========================================================================= */
    const triggerToast = (message, status = 'success') => {
        if (!dom.toastMatrix) return;
        const toast = document.createElement('div');
        const bgType = status === 'success' ? 'bg-slate-900 text-white border border-slate-800' : 'bg-red-600 text-white';
        toast.className = `${bgType} px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold tracking-tight transition-all duration-300 opacity-0 transform translate-y-2 pointer-events-auto`;
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

    /* =========================================================================
       DYNAMIC APPLICATION SINGLE PAGE WORKFLOW MULTIPLEX ROUTER
       ========================================================================= */
    const switchWorkflowTab = (activeTab, activeView) => {
        [dom.tabLedger, dom.tabAnalytics, dom.tabAlarms].forEach(tab => {
            if (tab) tab.className = "px-5 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:text-slate-900 hover:bg-white/50 transition-all duration-150";
        });
        if (activeTab) activeTab.className = "px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white shadow-sm";
        
        [dom.viewLedger, dom.viewAnalytics, dom.viewAlarms].forEach(view => {
            if (view) view.classList.add('hidden');
        });
        if (activeView) activeView.classList.remove('hidden');
        
        // Always force chart data rebuilding and execution animations on active switches
        if(activeView === dom.viewAnalytics) {
            renderAnalyticsCharts();
            generateAnalyticalInsights();
        }
    };

    if (dom.tabLedger) dom.tabLedger.addEventListener('click', () => switchWorkflowTab(dom.tabLedger, dom.viewLedger));
    if (dom.tabAnalytics) dom.tabAnalytics.addEventListener('click', () => switchWorkflowTab(dom.tabAnalytics, dom.viewAnalytics));
    if (dom.tabAlarms) dom.tabAlarms.addEventListener('click', () => switchWorkflowTab(dom.tabAlarms, dom.viewAlarms));

    /* =========================================================================
       MATHEMATICAL VALUE ACCUMULATION PIPELINE (GLOBAL METRICS SYNC)
       ========================================================================= */
    const updateCoreMetrics = () => {
        const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
        const activeRunway = capitalLimit - totalSpent;

        if (dom.metricAllocated) dom.metricAllocated.textContent = formatCurrency(capitalLimit);
        if (dom.metricSpent) dom.metricSpent.textContent = formatCurrency(totalSpent);
        if (dom.metricRunway) dom.metricRunway.textContent = formatCurrency(activeRunway);

        if (totalSpent > capitalLimit) {
            if (dom.cardSpent) dom.cardSpent.className = "bg-red-500/[0.08] border border-red-500/20 rounded-3xl p-5 flex flex-col justify-between min-h-[110px] transition-all duration-300";
            if (dom.labelSpent) dom.labelSpent.className = "text-[10px] font-bold text-red-700 uppercase tracking-wider";
            if (dom.alertTextSpent) {
                dom.alertTextSpent.className = "text-xxs text-red-600/80 font-bold mt-0.5 animate-pulse";
                dom.alertTextSpent.textContent = "CRITICAL LIMIT BREACHED - ASSET RISK";
            }
        } else {
            if (dom.cardSpent) dom.cardSpent.className = "bg-white border border-white rounded-3xl p-5 flex flex-col justify-between min-h-[110px] transition-all duration-300";
            if (dom.labelSpent) dom.labelSpent.className = "text-[10px] font-bold text-slate-400 uppercase tracking-wider";
            if (dom.alertTextSpent) {
                dom.alertTextSpent.className = "text-xxs text-slate-400 font-medium mt-0.5";
                dom.alertTextSpent.textContent = "Current operational burn rate";
            }
        }

        if (dom.cardRunway) {
            dom.cardRunway.className = activeRunway < 0 
                ? "bg-slate-100 border border-slate-200 rounded-3xl p-5 flex flex-col justify-between min-h-[110px] opacity-60 transition-all duration-300" 
                : "bg-emerald-500/[0.08] border border-emerald-500/20 rounded-3xl p-5 flex flex-col justify-between min-h-[110px] transition-all duration-300";
        }
    };

    /* =========================================================================
       HIGH-FIDELITY AUTOMATED CHART ANIMATION ENGINE (UP AND DOWN PATTERNS)
       ========================================================================= */
    const renderAnalyticsCharts = () => {
        if (!dom.chartContainer) return;
        dom.chartContainer.innerHTML = '';
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const volumeMatrix = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0};

        // Extract and aggregate amounts matching transaction calendar values parameters
        expenses.forEach(item => {
            if (item.date) {
                const dayIndex = new Date(item.date).getDay();
                volumeMatrix[dayIndex] += item.amount;
            }
        });

        const maxVolume = Math.max(...Object.values(volumeMatrix), 1);

        dayNames.forEach((day, index) => {
            const dailySum = volumeMatrix[index];
            // Compute percentage scaling to execute pure up and down tracking heights layout
            const computationalHeight = (dailySum / maxVolume) * 100;
            
            const columnNode = document.createElement('div');
            columnNode.className = "flex flex-col items-center gap-2 group h-full justify-end flex-1";
            
            // Clean structure using elegant transparent tracks layout to ensure no blank spaces look empty
            columnNode.innerHTML = `
                <div class="text-[9px] font-black text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-1 bg-slate-100 px-1 py-0.5 rounded border border-slate-200 shadow-sm z-10">${formatCurrency(dailySum)}</div>
                <div class="w-full bg-slate-100 border border-slate-200/40 rounded-xl relative flex items-end h-36 overflow-hidden shadow-inner">
                    <!-- Smooth Hardware Powered Target Motion Accent Pillar -->
                    <div class="w-full bg-slate-900 rounded-t-lg transition-all duration-[1200ms] ease-out shadow-[0_-2px_10px_rgba(0,0,0,0.15)]" style="height: 0%"></div>
                </div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">${day}</span>
            `;
            dom.chartContainer.appendChild(columnNode);
            
            // Trigger rendering interpolation thread to enforce dynamic lift animations instantly
            setTimeout(() => {
                const innerFillBar = columnNode.querySelector('.bg-slate-900');
                if (innerFillBar) innerFillBar.style.height = `${computationalHeight}%`;
            }, 50);
        });
    };

    // Analytics Insight Engine to keep page visually filled with elite corporate intelligence
    const generateAnalyticalInsights = () => {
        if(!dom.insightCount) return;
        dom.insightCount.textContent = `${expenses.length} Units Logged`;
        
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const volumeMatrix = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0};
        expenses.forEach(item => {
            const dayIndex = new Date(item.date).getDay();
            volumeMatrix[dayIndex] += item.amount;
        });

        let peakDayIdx = 0;
        let highestAmt = 0;
        Object.keys(volumeMatrix).forEach(k => {
            if(volumeMatrix[k] > highestAmt) {
                highestAmt = volumeMatrix[k];
                peakDayIdx = parseInt(k);
            }
        });

        dom.insightPeakDay.textContent = highestAmt > 0 ? dayNames[peakDayIdx] : 'No Spend Logs';
        
        const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
        if(totalSpent > capitalLimit) {
            dom.insightVelocity.innerHTML = '<span class="text-red-600 font-extrabold animate-pulse">High Burn Danger</span>';
        } else if(totalSpent > capitalLimit * 0.7) {
            dom.insightVelocity.innerHTML = '<span class="text-amber-500 font-bold">Approaching Limit</span>';
        } else {
            dom.insightVelocity.innerHTML = '<span class="text-emerald-600 font-bold">Stable Guard Status</span>';
        }
    };

    if (dom.toggleChartBtn) {
        dom.toggleChartBtn.addEventListener('click', () => {
            if(dom.chartContainer.style.height === '0px') {
                dom.chartContainer.style.height = '224px'; // 56 * 4
                dom.toggleChartBtn.textContent = 'Hide Grid';
            } else {
                dom.chartContainer.style.height = '0px';
                dom.toggleChartBtn.textContent = 'Expand Grid';
            }
        });
    }

    /* =========================================================================
       DEEP RESTRUCTURING FILTER INTERFACE (PATTERN-MATCHING PARSER)
       ========================================================================= */
    const computeCategorySum = (categoryName) => {
        return expenses.filter(item => item.category === categoryName).reduce((sum, item) => sum + item.amount, 0);
    };

    const renderLedgerRows = (filterQuery = '') => {
        if (!dom.ledgerStreamContainer) return;
        dom.ledgerStreamContainer.innerHTML = '';
        
        // Deep search validation pattern scanning Title, Category, and localized custom Remarks parameters
        const matchingRecords = expenses.filter(item => 
            item.title.toLowerCase().includes(filterQuery.toLowerCase()) || 
            item.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
            (item.remarks || '').toLowerCase().includes(filterQuery.toLowerCase())
        );

        if (matchingRecords.length === 0) {
            dom.ledgerStreamContainer.innerHTML = `<div class="p-5 bg-slate-50 text-slate-400 font-bold text-xs text-center rounded-2xl border border-slate-100">No operational records match the localized database criteria queries.</div>`;
            return;
        }

        matchingRecords.forEach(item => {
            const categorySpend = computeCategorySum(item.category);
            const isBreached = categoryAlarms[item.category] && categorySpend > categoryAlarms[item.category];
            const borderAlertClass = isBreached 
                ? 'border-red-500/40 bg-red-500/[0.01] hover:bg-red-500/[0.03] shadow-[0_2px_15px_rgba(239,68,68,0.03)]' 
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100/70';

            const row = document.createElement('div');
            row.className = `flex items-center justify-between p-4 rounded-2xl border ${borderAlertClass} transition-all duration-150`;
            row.innerHTML = `
                <div class="flex flex-col gap-0.5">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-900">${item.title}</span>
                        ${isBreached ? '<span class="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse shadow-sm shadow-red-500/20">Category Breached</span>' : ''}
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-[9px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded uppercase tracking-wider">${item.category}</span>
                        <span class="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/20">${item.date}</span>
                    </div>
                    ${item.remarks ? `<p class="text-[10px] text-slate-500 font-medium italic mt-1.5 bg-white/80 border border-slate-200/30 px-2.5 py-1 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.01)] w-max max-w-xs truncate">Note: "${item.remarks}"</p>` : ''}
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-xs font-black px-2.5 py-1 rounded-xl monvael-price-pill tracking-tight">${formatCurrency(item.amount)}</span>
                    <button onclick="deleteExpense(${item.id})" class="text-slate-600 hover:text-red-500 font-bold text-xs p-1 transition-colors">✕</button>
                </div>
            `;
            dom.ledgerStreamContainer.appendChild(row);
        });
    };

    if (dom.ledgerSearch) dom.ledgerSearch.addEventListener('input', (e) => renderLedgerRows(e.target.value));

    const synchronizeUndoVisibility = () => {
        if (dom.undoBtn) {
            if (operationalHistoryStack) {
                dom.undoBtn.classList.remove('hidden', 'opacity-0');
            } else {
                dom.undoBtn.classList.add('hidden', 'opacity-0');
            }
        }
    };

    /* =========================================================================
       TRANSACTION PIPELINE SUBMISSION INTERCEPT CONTROLLER
       ========================================================================= */
    if (dom.expenseForm) {
        dom.expenseForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Absolute block against default index.html? refresh loop errors
            
            const titleValue = dom.expTitle.value.trim();
            const categoryValue = dom.expCategory.value;
            const dateValue = dom.expDate.value;
            const remarksValue = dom.expRemarks.value.trim();
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

            operationalHistoryStack = { action: 'ADD', dataId: targetTransaction.id };

            dom.expTitle.value = '';
            dom.expRemarks.value = '';
            dom.expAmount.value = '';
            dom.expDate.value = new Date().toISOString().split('T')[0];

            updateCoreMetrics();
            renderLedgerRows();
            triggerToast(`Burn committed successfully: ${titleValue}`);
        
            synchronizeUndoVisibility(); 
        });
    }

    window.deleteExpense = (targetId) => {
        const itemToPurge = expenses.find(item => item.id === targetId);
        if (!itemToPurge) return;
        operationalHistoryStack = { action: 'DELETE', payload: itemToPurge };

        expenses = expenses.filter(item => item.id !== targetId);
        localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
        updateCoreMetrics();
        renderLedgerRows();
        triggerToast("Ledger instance purged from memory cache.", "warning");
        
        synchronizeUndoVisibility();
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

    /* =========================================================================
       COMMERCIAL BLOB DATA EXPORT ENGINE (CLIENT-SIDE EXTRACTION MATRIX)
       ========================================================================= */
    if (dom.exportCsvBtn) {
        dom.exportCsvBtn.addEventListener('click', () => {
            if(expenses.length === 0) {
                triggerToast("Operation canceled: Storage cache empty.", "warning");
                return;
            }
            
            // Build structural spreadsheet text parameters template sequentially
            let csvRows = ["Transaction ID,Description,Category,Date,Remarks,Amount (INR)"];
            
            expenses.forEach(item => {
                // Safe string filtering to handle clean inner quote structures
                const sanitizedTitle = (item.title || '').replace(/"/g, '""');
                const sanitizedRemarks = (item.remarks || '').replace(/"/g, '""');
                csvRows.push(`${item.id},"${sanitizedTitle}",${item.category},${item.date},"${sanitizedRemarks}",${item.amount}`);
            });
            
            // Join layout nodes with proper line breaks structure
            const csvString = csvRows.join("");
            
            // FIXED: Convert large text array straight into a high-speed Binary Large Object (Blob)
            const csvBlob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            
            // Generate a temporary browser unique address allocation pointer safely
            const objectUrl = URL.createObjectURL(csvBlob);
            
            const invisibleAnchor = document.createElement('a');
            invisibleAnchor.setAttribute('href', objectUrl);
            invisibleAnchor.setAttribute('download', `monvael_ledger_export_${Date.now()}.csv`);
            
            document.body.appendChild(invisibleAnchor);
            invisibleAnchor.click();
            
            // Clean memory pipelines instantly by revoking the transient Object URL
            invisibleAnchor.remove();
            URL.revokeObjectURL(objectUrl);
            
            triggerToast("Financial matrix spreadsheet downloaded successfully!");
        });
    }

    /* =========================================================================
       ADVANCED SENTINEL ALARMS MONITORING SYSTEM PIPELINE
       ========================================================================= */
    const synchronizeAlarmsRegistryView = () => {
        if (!dom.alarmsRegistryContainer) return;
        dom.alarmsRegistryContainer.innerHTML = '';
        const registeredKeys = Object.keys(categoryAlarms);

        if(registeredKeys.length === 0) {
            dom.alarmsRegistryContainer.innerHTML = `<div class="p-4 text-xs font-semibold text-slate-400 bg-slate-50 text-center rounded-2xl border border-slate-100">No active category allocation boundary caps configured at current status.</div>`;
            return;
        }

        registeredKeys.forEach(cat => {
            const allocatedCap = categoryAlarms[cat];
            const functionalSpend = computeCategorySum(cat);
            const isViolated = functionalSpend > allocatedCap;
            
            const statusCardColor = isViolated 
                ? 'border-red-200 bg-red-500/[0.02] shadow-[0_2px_15px_rgba(239,68,68,0.02)]' 
                : 'border-slate-200/60 bg-white shadow-sm';
            
            const statusDotColor = isViolated ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30';

            const alarmNode = document.createElement('div');
            alarmNode.className = `flex items-center justify-between p-4 border ${statusCardColor} rounded-2xl transition-all duration-300`;
            alarmNode.innerHTML = `
                <div class="flex items-center gap-3">
                    <!-- Tactile Status Dot Indicator Box -->
                    <div class="h-2 w-2 rounded-full ${statusDotColor} shadow-md animate-pulse"></div>
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-slate-900">${cat}</span>
                        <span class="text-[10px] text-slate-500 mt-0.5 font-medium">
                            Aggregate Burn: <strong class="${isViolated ? 'text-red-600' : 'text-slate-800'}">${formatCurrency(functionalSpend)}</strong> / Limit Cap: <strong>${formatCurrency(allocatedCap)}</strong>
                        </span>
                    </div>
                </div>
                <button onclick="disarmAlarm('${cat}')" class="text-xxs text-red-500 font-bold px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200/30">Disarm</button>
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
            triggerToast(`Sentinel allocation cap monitor armed for: ${selectedCat}`);
        });
    }

    window.disarmAlarm = (categoryKey) => {
        delete categoryAlarms[categoryKey];
        localStorage.setItem(KEYS.ALARMS, JSON.stringify(categoryAlarms));
        
        synchronizeAlarmsRegistryView();
        renderLedgerRows();
        triggerToast("Category sentinel monitor disarmed successfully.", "warning");
    };

    const populateAlarmsSelectorDropdown = () => {
        if (dom.alarmCategory && dom.expCategory) {
            dom.alarmCategory.innerHTML = dom.expCategory.innerHTML;
        }
    };

    /* =========================================================================
       CORE EXECUTION BOOTSTRAP REGISTER INVOCATIONS
       ========================================================================= */
    if (dom.capitalInput) dom.capitalInput.value = capitalLimit;
    populateAlarmsSelectorDropdown();
    updateCoreMetrics();
    renderLedgerRows();
    synchronizeAlarmsRegistryView();

    /* =========================================================================
       CHRONOLOGICAL ACTION REVERSAL CONTROLLER
       ========================================================================= */
    if (dom.undoBtn) {
        dom.undoBtn.addEventListener('click', () => {
            if (!operationalHistoryStack) return;

            if (operationalHistoryStack.action === 'ADD') {
                expenses = expenses.filter(item => item.id !== operationalHistoryStack.dataId);
                triggerToast("Last addition undone successfully.", "warning");
            } 
            else if (operationalHistoryStack.action === 'DELETE') {
                expenses.push(operationalHistoryStack.payload);
                triggerToast(`Restored transaction: ${operationalHistoryStack.payload.title}`);
            } 
            else if (operationalHistoryStack.action === 'IMPORT') {
                expenses = [...operationalHistoryStack.fallbackSnapshot.expenses];
                capitalLimit = operationalHistoryStack.fallbackSnapshot.capitalLimit;
                categoryAlarms = {...operationalHistoryStack.fallbackSnapshot.categoryAlarms};
                
                localStorage.setItem(KEYS.CAPITAL, capitalLimit);
                localStorage.setItem(KEYS.ALARMS, JSON.stringify(categoryAlarms));
                if (dom.capitalInput) dom.capitalInput.value = capitalLimit;
                
                triggerToast("Bulk data restoration undone. Reverted to previous state parameters.", "warning");
            }

            localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
            operationalHistoryStack = null;

            updateCoreMetrics();
            renderLedgerRows();
            synchronizeAlarmsRegistryView();
            synchronizeUndoVisibility();
        });
    }

    synchronizeUndoVisibility();

    /* =========================================================================
       JSON BACKUP & RESTORATION MODULE SYSTEM
       ========================================================================= */
    if (dom.exportJsonBtn) {
        dom.exportJsonBtn.addEventListener('click', () => {
            if (expenses.length === 0) {
                triggerToast("Backup canceled: Ledger operational stream cache empty.", "warning");
                return;
            }
            
            const backupPackage = {
                version: "2.0.0-OS",
                timestamp: Date.now(),
                ledgerData: expenses,
                thresholdLimit: capitalLimit,
                allocatedAlarms: categoryAlarms
            };
            
            const dataString = JSON.stringify(backupPackage, null, 2);
            const jsonBlob = new Blob([dataString], { type: 'application/json;charset=utf-8;' });
            const objectUrl = URL.createObjectURL(jsonBlob);
            
            const anchor = document.createElement('a');
            anchor.setAttribute('href', objectUrl);
            anchor.setAttribute('download', `monvael_master_backup_${Date.now()}.json`);
            document.body.appendChild(anchor);
            anchor.click();
            
            anchor.remove();
            URL.revokeObjectURL(objectUrl);
            triggerToast("Monvael database backup schema exported successfully!");
        });
    }

    if (dom.importTriggerBtn && dom.importJsonFile) {
        dom.importTriggerBtn.addEventListener('click', () => dom.importJsonFile.click());
    }

    if (dom.importJsonFile) {
        dom.importJsonFile.addEventListener('change', (event) => {
            const targetFile = event.target.files[0];
            if (!targetFile) return;
            
            const fileStreamReader = new FileReader();
            
            fileStreamReader.onload = (e) => {
                try {
                    const parsedResult = JSON.parse(e.target.result);
                    
                    if (!parsedResult || !parsedResult.ledgerData || !Array.isArray(parsedResult.ledgerData)) {
                        throw new Error("Broken schema");
                    }
                    
                    // Take isolated deep snapshot copy of exact configuration parameters before overwrite
                    const priorStateSnapshot = {
                        expenses: [...expenses],
                        capitalLimit: capitalLimit,
                        categoryAlarms: {...categoryAlarms}
                    };
                    
                    operationalHistoryStack = { action: 'IMPORT', fallbackSnapshot: priorStateSnapshot };
                    
                    expenses = parsedResult.ledgerData;
                    capitalLimit = parsedResult.thresholdLimit || 100000;
                    categoryAlarms = parsedResult.allocatedAlarms || {};
                    
                    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
                    localStorage.setItem(KEYS.CAPITAL, capitalLimit);
                    localStorage.setItem(KEYS.ALARMS, JSON.stringify(categoryAlarms));
                    
                    if (dom.capitalInput) dom.capitalInput.value = capitalLimit;
                    updateCoreMetrics();
                    renderLedgerRows();
                    synchronizeAlarmsRegistryView();
                    synchronizeUndoVisibility();
                    
                    triggerToast("System session successfully restored from local backup!");
                } catch (err) {
                    triggerToast("Data restoration aborted: Broken JSON schema file.", "error");
                }
                dom.importJsonFile.value = '';
            };
            
            fileStreamReader.readAsText(targetFile);
        });
    }

    /* =========================================================================
       PURE CSS ATTRIBUTE THEME ENGINE CONTROLLER
       ========================================================================= */
    const STORAGE_THEME_KEY = 'monvael_ambient_theme';
    let activeTheme = localStorage.getItem(STORAGE_THEME_KEY) || 'light';
    
    const applyAmbientThemeState = (targetMode) => {
        document.documentElement.setAttribute('data-theme', targetMode);
        
       if (dom.themeToggleBtn) {
        if (targetMode === 'dark') {
            dom.themeToggleBtn.className = "p-2 rounded-xl bg-slate-800 text-amber-400 text-xs font-black shadow-inner border border-slate-700/40 cursor-pointer";
            dom.themeToggleBtn.textContent = "☀️";
            dom.themeToggleBtn.setAttribute('title', 'Switch to Light Mode'); // Mouse lane par ye text dikhega
        } else {
            dom.themeToggleBtn.className = "p-2 rounded-xl bg-slate-200/80 text-slate-700 text-xs font-black shadow-inner cursor-pointer";
            dom.themeToggleBtn.textContent = "🌑";
            dom.themeToggleBtn.setAttribute('title', 'Switch to Dark Mode'); // Mouse lane par ye text dikhega
        }
    }
    localStorage.setItem(STORAGE_THEME_KEY, targetMode);

    };

    if (dom.themeToggleBtn) {
        dom.themeToggleBtn.addEventListener('click', () => {
            activeTheme = activeTheme === 'light' ? 'dark' : 'light';
            applyAmbientThemeState(activeTheme);
            
            if (dom.viewAnalytics && !dom.viewAnalytics.classList.contains('hidden')) {
                renderAnalyticsCharts();
            }
        });
    }

    // Fire default bootstrap sync loop
    applyAmbientThemeState(activeTheme);
});
