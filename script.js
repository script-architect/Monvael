/* =========================================================================
   MONVAEL OS - CENTRAL LOGIC SOFTWARE PARSING ARCHITECTURE ENGINE
   Highly structured system managing persistent transactional calculations.
   ========================================================================= */
const KEYS = {
    EXPENSES: 'monvael_ledger_cache',
    CAPITAL: 'monvael_threshold_limit',
    ALARMS: 'monvael_category_alarms'
};

// --- CENTRAL GLOBAL MULTI-CURRENCY CONVERSION MATRIX ---
const CURRENCY_CONFIG = {
    INR: { symbol: "₹", locale: "en-IN", rate: 1 },
    USD: { symbol: "$", locale: "en-US", rate: 0.012 },
    EUR: { symbol: "€", locale: "de-DE", rate: 0.011 },
    GBP: { symbol: "£", locale: "en-GB", rate: 0.0092 },
    JPY: { symbol: "¥", locale: "ja-JP", rate: 1.83 },
    AUD: { symbol: "A$", locale: "en-AU", rate: 0.018 },
    CAD: { symbol: "C$", locale: "en-CA", rate: 0.017 },
    CNY: { symbol: "¥", locale: "zh-CN", rate: 0.086 },
    CHF: { symbol: "CHF", locale: "de-CH", rate: 0.010 },
    SAR: { symbol: "ر.س", locale: "ar-SA", rate: 0.045 },
    AED: { symbol: "د.إ", locale: "ar-AE", rate: 0.044 },
    PKR: { symbol: "₨", locale: "ur-PK", rate: 3.34 },
    BDT: { symbol: "৳", locale: "bn-BD", rate: 1.44 },
    NPR: { symbol: "₨", locale: "ne-NP", rate: 1.60 },
    LKR: { symbol: "₨", locale: "si-LK" , rate: 3.56 },
    RUB: { symbol: "₽", locale: "ru-RU", rate: 1.16 },
    ZAR: { symbol: "R", locale: "en-ZA", rate: 0.21 },
    NZD: { symbol: "NZ$", locale: "en-NZ", rate: 0.020 },
    SGD: { symbol: "S$", locale: "en-SG", rate: 0.016 },
    HKD: { symbol: "HK$", locale: "zh-HK", rate: 0.093 },
    KWD: { symbol: "د.ك", locale: "ar-KW", rate: 0.0037 },
    OMR: { symbol: "ر.ع.", locale: "ar-OM", rate: 0.0046 },
    BHD: { symbol: ".د.ب", locale: "ar-BH", rate: 0.0045 },
    QAR: { symbol: "ر.ق", locale: "ar-QA", rate: 0.044 },
    MYR: { symbol: "RM", locale: "ms-MY", rate: 0.052 },
    IDR: { symbol: "Rp", locale: "id-ID", rate: 189.5 },
    TRY: { symbol: "₺", locale: "tr-TR", rate: 0.41 },
    BRL: { symbol: "R$", locale: "pt-BR", rate: 0.068 },
    MXN: { symbol: "$", locale: "es-MX", rate: 0.24 },
    EGP: { symbol: "E£", locale: "ar-EG", rate: 0.59 },
    AFN: { symbol: "؋", locale: "ps-AF", rate: 0.81 },
    KRW: { symbol: "₩", locale: "ko-KR", rate: 16.58 }
};

let currentCurrency = localStorage.getItem('monvael_currency_engine') || 'INR';


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
        currencySwitcher: document.getElementById('currency-switcher'),
        formCurrencySign: document.getElementById('form-currency-sign'),
        thresholdCurrencySign: document.getElementById('threshold-currency-sign'),
        alarmCurrencySign: document.getElementById('alarm-currency-sign'),

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
        const config = CURRENCY_CONFIG[currentCurrency];

        return new Intl.NumberFormat(config.locale, {
            style:'currency',
            currency: currentCurrency,
            maximumFractionDigits: 0
        }).format(amount);
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
                dom.alertTextSpent.className = "text-xxs text-red-600/80 font-bold mt-0.5 animate-pulse ";
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
        // FIX: Container changed to 'flex-col sm:flex-row sm:items-center' to stack stacked components vertically on mobile screens
        row.className = `flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border ${borderAlertClass} transition-all duration-150 gap-3 sm:gap-4`;
        row.innerHTML = `
            <!-- LEFT COMPONENT: Primary metadata block containing titles, category badges, and notes -->
            <!-- FIX: Added 'w-full' to prevent absolute layout breakdown on smaller devices -->
            <div class="flex flex-col gap-0.5 w-full">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs font-bold text-slate-900">${item.title}</span>
                    ${isBreached ? '<span class="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse shadow-sm shadow-red-500/20">Category Breached</span>' : ''}
                </div>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                    <span class="text-[9px] font-bold text-slate-400 bg-slate-500/40 dark:bg-slate-200/10 px-2 py-0.5 rounded uppercase tracking-wider">${item.category}</span>
                    <span class="text-[9px] font-bold text-slate-400 bg-slate-300 dark:bg-slate-500/10 px-1.5 py-0.5 rounded border border-slate-200/20">${item.date}</span>
                </div>
                <!-- FIX: Replaced 'w-max' with 'w-full sm:w-max' and added explicit bounds to safe truncate inside adaptive boxes -->
                ${item.remarks ? `<p class="text-[10px] text-slate-200 dark:bg-slate-800 font-medium italic mt-1.5 bg-white/80 border border-slate-200/30 px-2.5 py-1 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.01)] w-full sm:w-max max-w-full sm:max-w-xs truncate">Note: "${item.remarks}"</p>` : ''}
            </div>
            
            <!-- RIGHT COMPONENT: Secondary control block holding pricing metrics and context deletions -->
            <!-- FIX: Added 'justify-between sm:justify-end w-full sm:w-auto' so price and delete button sit beautifully inline on mobile -->
            <div class="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-100/50 pt-2 sm:pt-0">
                <span class="text-xs font-black px-2.5 py-1 rounded-xl monvael-price-pill tracking-tight">${formatCurrency(item.amount)}</span>
                <button onclick="deleteExpense(${item.id})" class="text-slate-600 hover:text-red-500 font-bold text-xs p-1 transition-colors cursor-pointer">✕</button>
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

     if (dom.exportCsvBtn) {
        dom.exportCsvBtn.addEventListener('click', () => {
            if (expenses.length === 0) {
                triggerToast("Operation canceled: Storage cache empty.", "warning");
                return;
            }

            // Compute global matrix indicators metrics
            const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
            const activeRunway = capitalLimit - totalSpent;

            // Track boundaries limits for conditional row mesh generation arrays
            let maxAmount = -1;
            let minAmount = Infinity;
            expenses.forEach(item => {
                if (item.amount > maxAmount) maxAmount = item.amount;
                if (item.amount < minAmount) minAmount = item.amount;
            });

            // Initialize structural XML/HTML document strings with clean corporate light styles
            let excelTemplate = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://w3.org">
                <head>
                    <meta charset="utf-8"/>
                    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:Worksheets><x:Worksheet><x:Name>Monvael Ledger</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:Worksheet></x:Worksheets></x:ExcelWorkbook></xml><![endif]-->
                    <style>
                        /* STANDARD LIGHT CORE TYPOGRAPHY RESET */
                        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background-color: #ffffff; color: #1e293b; }
                        td { padding: 10px 14px; border: 1px solid #cbd5e1; font-size: 11px; vertical-align: middle; }
                        
                        /* CORPORATE HIGH-CONTRAST HEADER SUITE DESIGN */
                        .brand-bar { font-size: 20px; font-weight: 800; background-color: #f8fafc; color: #0f172a; border-bottom: 3px solid #0284c7; padding: 20px 12px; text-transform: uppercase; }
                        .brand-link { color: #0284c7; text-decoration: underline; font-weight: 800; font-size: 12px; }
                        .section-banner { font-size: 13px; font-weight: 800; color: #1e293b; background-color: #f1f5f9; letter-spacing: 0.5px; border-bottom: 2px solid #64748b; padding-top: 15px; }
                        .metric-header { font-weight: 800; background-color: #ffffff; color: #475569; font-size: 11px; text-transform: uppercase; }
                        .metric-cell { font-weight: 800; font-size: 16px; background-color: #f8fafc; color: #0f172a; border-bottom: 2px solid #cbd5e1; }
                        
                        /* EXECUTIVE TABLE INFRASTRUCTURE */
                        .ledger-header { font-weight: 800; font-size: 12px; background-color: #0f172a; color: #ffffff; text-align: center; border: 1px solid #0f172a; padding: 12px 14px; text-transform: uppercase; }
                        .standard-row { background-color: #ffffff; color: #334155; }
                        .price-tag { font-weight: 800; text-align: right; color: #0f172a; font-size: 12px; }
                        
                        /* PROFESSIONAL LIGHT CONDITIONAL STATUS HIGHLIGHTS */
                        .max-burn-alert { background-color: #fee2e2 !important; color: #991b1b !important; font-weight: bold; }
                        .min-burn-eco { background-color: #d1fae5 !important; color: #065f46 !important; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <table>
                        <!-- EXECUTIVE BRANDING PROTOCOL INTERFACE -->
                        <tr><td colspan="6" class="brand-bar">📋 MONVAEL OS — BUSINESS RUNWAY INTELLIGENCE ENGINE</td></tr>
                        <tr>
                            <td colspan="3" style="background-color:#f8fafc; color:#64748b; font-size:10px; font-weight: 600;">Generated Logs: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</td>
                            <td colspan="3" style="background-color:#f8fafc; text-align:right; font-size:11px;">
                                <a href="https://monvael.in" target="_blank" class="brand-link">🌐 monvael.in</a>
                            </td>
                        </tr>
                        <tr><td colspan="6" style="background-color:#ffffff; border:none; height:16px;"></td></tr>

                        <!-- CAPITAL METRICS SNAPSHOT SNAP -->
                        <tr><td colspan="6" class="section-banner">📌 CENTRAL PLATFORM LIQUIDITY STATEMENT</td></tr>
                        <tr class="metric-header">
                            <td colspan="2">Allocated Capital Limit</td>
                            <td colspan="2">Total Aggregate Burn</td>
                            <td colspan="2">Remaining Active Runway</td>
                        </tr>
                        <tr>
                            <td colspan="2" class="metric-cell" style="color:#0f172a;">${formatCurrency(capitalLimit)}</td>
                            <td colspan="2" class="metric-cell" style="color:#dc2626;">${formatCurrency(totalSpent)}</td>
                            <td colspan="2" class="metric-cell" style="color:${activeRunway < 0 ? '#dc2626' : '#16a34a'};">${formatCurrency(activeRunway)}</td>
                        </tr>
                        <tr><td colspan="6" style="background-color:#ffffff; border:none; height:16px;"></td></tr>

                        <!-- CONDITIONAL MATRIX LEGEND CODES -->
                        <tr><td colspan="6" class="section-banner">🎨 MONITOR EXTREME TRAJECTORY INDICATORS</td></tr>
                        <tr><td class="max-burn-alert" style="text-align:center; font-size: 11px;">🚨 MAXIMUM BURN</td><td colspan="5" style="background-color:#ffffff; color:#991b1b; font-weight: 600;">High-velocity operational burn transaction vector (Sabse Jyada Kharch)</td></tr>
                        <tr><td class="min-burn-eco" style="text-align:center; font-size: 11px;">💚 SYSTEM OPTIMAL</td><td colspan="5" style="background-color:#ffffff; color:#065f46; font-weight: 600;">Minimum structural baseline operational resource leak (Sabse Kam Kharch)</td></tr>
                        <tr><td colspan="6" style="background-color:#ffffff; border:none; height:16px;"></td></tr>

                        <!-- PRIMARY TRANSACTION LOG STREAM TABLE -->
                        <tr><td colspan="6" class="section-banner">📝 HISTORICAL TRANSACTION LEDGER ROWS</td></tr>
                        <tr class="ledger-header">
                            <td>Transaction ID</td>
                            <td>Core Description / Title</td>
                            <td>Category Vector</td>
                            <td>Execution Date</td>
                            <td>Granular Remarks / Notes</td>
                            <td>Amount</td>
                        </tr>
            `;

            // Sequential rows mapping logic loops with dynamic light class interceptors
            expenses.forEach(item => {
                let rowColorClass = 'class="standard-row"';
                if (item.amount === maxAmount && expenses.length > 1) rowColorClass = 'class="max-burn-alert"';
                else if (item.amount === minAmount && expenses.length > 1) rowColorClass = 'class="min-burn-eco"';

                excelTemplate += `
                    <tr ${rowColorClass}>
                        <!-- MSO text format rule loops prevent scientific digits exponential distortions completely -->
                        <td style="mso-number-format:'\\@'; text-align:center; font-weight: 600; color: #475569;">${item.id}</td>
                        <td style="font-weight: 600;">${item.title}</td>
                        <td style="text-align:center; font-weight: 600;">${item.category}</td>
                        <td style="text-align:center; color: #475569;">${item.date}</td>
                        <td>${item.remarks || "N/A"}</td>
                        <td class="price-tag">${formatCurrency(item.amount)}</td>
                    </tr>
                `;
            });

            excelTemplate += `
                    </table>
                </body>
                </html>
            `;

            // BLOB PIPELINE EXPORT INVOCATION ENGINE
            const blobPackage = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
            const dataUrlReference = URL.createObjectURL(blobPackage);

            // Execute automated browser downlader link attachment actions
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.href = dataUrlReference;
            downloadAnchorNode.download = `monvael_executive_report_${Date.now()}.xls`;
            
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            
            // Garbage collection array optimizations
            downloadAnchorNode.remove();
            URL.revokeObjectURL(dataUrlReference);

            triggerToast("Premium corporate light Excel sheet downloaded successfully!");
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
                <button onclick="disarmAlarm('${cat}')" class="text-xxs text-red-800 font-bold px-3 py-1.5 bg-red-50 hover:bg-red-500/80 hover:text-white rounded-xl transition-colors border border-red-200/30">Disarm</button>
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

        // >>> SCRIPT.JS KE THEME EVENT MEIN IS DETECTOR HOOK KO ADD KARDO <<<
        const mobileThemeBtn = document.getElementById('theme-toggle-btn-mobile');
        if (mobileThemeBtn) {
            mobileThemeBtn.addEventListener('click', () => {
                const currentMode = document.documentElement.getAttribute('data-theme') || 'light';
                const nextMode = currentMode === 'light' ? 'dark' : 'light';
                applyAmbientThemeState(nextMode);
                if (!dom.viewAnalytics.classList.contains('hidden')) renderAnalyticsCharts();
            });
        }

    // Fire default bootstrap sync loop
    applyAmbientThemeState(activeTheme);

        // =========================================================================
    // DYNAMIC MULTI-CURRENCY RUNTIME INTERCEPTOR
    // =========================================================================
    const applyGlobalCurrencyState = (targetCurrency) => {
        if (!CURRENCY_CONFIG[targetCurrency]) return;

        currentCurrency = targetCurrency;
        localStorage.setItem('monvael_currency_engine', targetCurrency);

        const activeConfig = CURRENCY_CONFIG[targetCurrency];

        // Global UI indicators ko target karke real-time update dena
        const formSign = document.getElementById('form-currency-sign');
        const thresholdSign = document.getElementById('threshold-currency-sign');
        const alarmSign = document.getElementById('alarm-currency-sign');

        if (formSign) formSign.textContent = activeConfig.symbol;
        if (thresholdSign) thresholdSign.textContent = activeConfig.symbol;
        if (alarmSign) alarmSign.textContent = activeConfig.symbol;

        if (dom.currencySwitcher) dom.currencySwitcher.value = targetCurrency;

        if (dom.capitalInput){
            dom.capitalInput.value = capitalLimit;
        }
        // Core metric tables aur state arrays ko crash ke bina dobara calulate karna
        updateCoreMetrics();
        renderLedgerRows();
        synchronizeAlarmsRegistryView();
        
        if (dom.viewAnalytics && !dom.viewAnalytics.classList.contains('hidden')) {
            renderAnalyticsCharts();
        }
    };

    // UI Input listener switch setup
    if (dom.currencySwitcher) {
        dom.currencySwitcher.addEventListener('change', (e) => {
            applyGlobalCurrencyState(e.target.value);
            triggerToast(`System currency converted to: ${e.target.value}`);
        });
    }

    // Global Initial System Boot Loop - Iski spelling sahi kar di hai!
    applyGlobalCurrencyState(currentCurrency);

});

/**
 * Monvael OS - Context-Aware Semantic SEO & Knowledge Matrix Engine
 * Orchestrates localized dynamic view optimizations without database overhead.
 */
document.addEventListener("DOMContentLoaded", function () {
  const seoContainer = document.getElementById("dynamic-seo-content");
  
  // High-Performance Architectural Master Manifest Mapping Matrix Spans
  const seoManifestRegistry = {
    ledger: `
      <div class="space-y-3 max-w-2xl text-left">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[9px] font-mono font-black tracking-widest uppercase px-2.5 py-0.5 bg-slate-100 border border-slate-200/60 text-slate-600 rounded-md mv-seo-badge">CORE_LEDGER_STREAM</span>
          <span class="text-[10px] text-slate-400 font-mono tracking-tight mv-seo-vector">Index Vector: /runway-analytics</span>
        </div>
        <h4 class="text-sm font-black text-slate-900 uppercase tracking-wide tracking-tight mv-seo-title">Startup Burn Rate Calculator & Real-Time Cash Ledger Grid</h4>
        <p class="text-xs text-slate-500 leading-relaxed font-normal mv-seo-text">
          Log macro-burn parameters and analyze your precise <strong>corporate operational burn rate</strong> instantly. Monvael's browser-localized compliance framework functions as a zero-latency financial logging console, generating an active <strong>financial runway matrix</strong> for scaling SaaS founders and corporate developers without configuring clunky database infrastructures or third-party authentication barriers.
        </p>
      </div>
      <div class="text-[10px] font-mono text-slate-400 border border-slate-200/60 rounded-xl p-3.5 bg-slate-50/50 shrink-0 select-none md:max-w-[240px] text-left leading-normal mv-seo-kw-box">
        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Indexed Latent Terms</span>
        Keywords: startup burn rate tracker, calculate cash runway free tool, corporate cash flow ledger app, office expense tracker browser app, local asset logging console.
      </div>
    `,
    analytics: `
      <div class="space-y-3 max-w-2xl text-left">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[9px] font-mono font-black tracking-widest uppercase px-2.5 py-0.5 bg-slate-100 border border-slate-200/60 text-slate-600 rounded-md mv-seo-badge">ANALYTICS_MATRIX</span>
          <span class="text-[10px] text-slate-400 font-mono tracking-tight mv-seo-vector">Index Vector: /velocity-stream</span>
        </div>
        <h4 class="text-sm font-black text-slate-900 uppercase tracking-wide tracking-tight mv-seo-title">Weekly Expense Velocity Grid & Cash Flow Consumption Analytics</h4>
        <p class="text-xs text-slate-500 leading-relaxed font-normal mv-seo-text">
          Track localized capital consumption patterns as they execute inside the terminal layer. The specialized <strong>weekly expense velocity grid</strong> processes dynamic trend trajectories utilizing hardware-accelerated animated pillar components. Discover peak spend variables, isolate lifestyle overhead allocations, and monitor encrypted <strong>transactional memory cache statistics</strong> via a pure minimalist layout grid.
        </p>
      </div>
      <div class="text-[10px] font-mono text-slate-400 border border-slate-200/60 rounded-xl p-3.5 bg-slate-50/50 shrink-0 select-none md:max-w-[240px] text-left leading-normal mv-seo-kw-box">
        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Indexed Latent Terms</span>
        Keywords: saas cash flow ledger grid, personal finance weekly expense velocity, analyze trend trajectories, transactional memory statistics tracker, browser spending charts.
      </div>
    `,
    alarms: `
      <div class="space-y-3 max-w-2xl text-left">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[9px] font-mono font-black tracking-widest uppercase px-2.5 py-0.5 bg-slate-100 border border-slate-200/60 text-slate-600 rounded-md mv-seo-badge">SENTINEL_MONITOR</span>
          <span class="text-[10px] text-slate-400 font-mono tracking-tight mv-seo-vector">Index Vector: /alarms-engine</span>
        </div>
        <h4 class="text-sm font-black text-slate-900 uppercase tracking-wide tracking-tight mv-seo-title">Localized Category Allocation Threshold Alarms & Budget Sentinel</h4>
        <p class="text-xs text-slate-500 leading-relaxed font-normal mv-seo-text">
          Enforce rigid boundary parameters to isolate custom asset categories against systemic operational overflow. Monvael's autonomous <strong>threshold allocation alarms engine</strong> lets independent financial advisors and tax consultants configure strict maximum allocation caps on targeted sectors, triggering automated local sentinel warnings the precise millisecond spending metrics breach parameters.
        </p>
      </div>
      <div class="text-[10px] font-mono text-slate-400 border border-slate-200/60 rounded-xl p-3.5 bg-slate-50/50 shrink-0 select-none md:max-w-[240px] text-left leading-normal mv-seo-kw-box">
        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Indexed Latent Terms</span>
        Keywords: automated income tax expense tracker, free money manager tool browser extension, custom budget threshold alarms, localized category allocation caps.
      </div>
    `
  };

  /**
   * Executes smooth opacity transitions to hot-swap content matrices
   * @param {string} viewKey - Target system state key mapped inside the registry
   */
  function shiftDynamicSeoPayload(viewKey) {
    if (seoContainer && seoManifestRegistry[viewKey]) {
      seoContainer.style.opacity = "0";
      setTimeout(function () {
        seoContainer.innerHTML = seoManifestRegistry[viewKey];
        seoContainer.style.opacity = "1";
      }, 140);
    }
  }

  // Hook workspace dynamic routing changes into dashboard trigger nodes safely
  const navLedgerNode = document.getElementById("tab-ledger");
  const navAnalyticsNode = document.getElementById("tab-analytics");
  const navAlarmsNode = document.getElementById("tab-alarms");

  if (navLedgerNode) navLedgerNode.addEventListener("click", function () { shiftDynamicSeoPayload("ledger"); });
  if (navAnalyticsNode) navAnalyticsNode.addEventListener("click", function () { shiftDynamicSeoPayload("analytics"); });
  if (navAlarmsNode) navAlarmsNode.addEventListener("click", function () { shiftDynamicSeoPayload("alarms"); });

  // Default configuration init execution on operational launch
  shiftDynamicSeoPayload("ledger");
});


document.addEventListener("DOMContentLoaded", function () {
  const hamburgerBtn = document.getElementById("hamburger-menu-btn");
  const navLinks = document.getElementById("nav-links");
  const navButtons = document.querySelectorAll(".nav-target-btn");

  if (hamburgerBtn && navLinks) {
    
    // Toggle on mobile
    hamburgerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (window.innerWidth < 640) {
        if (navLinks.style.display === "flex") {
          navLinks.style.setProperty("display", "none", "important");
        } else {
          navLinks.style.setProperty("display", "flex", "important");
          navLinks.style.setProperty("flex-direction", "column", "important");
          navLinks.style.setProperty("width", "100%", "important");
        }
      }
    });

    // Auto close menu on button select
    navButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (window.innerWidth < 640) {
          navLinks.style.setProperty("display", "none", "important");
        }
      });
    });

    

    // Close menu on backdrop tap
    document.addEventListener("click", function (e) {
      if (window.innerWidth < 640 && !navLinks.contains(e.target) && e.target !== hamburgerBtn) {
        navLinks.style.setProperty("display", "none", "important");
      }
    });

    

    // Device responsive reset guardrail
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 640) {
        navLinks.style.removeProperty("display");
        navLinks.style.removeProperty("flex-direction");
        navLinks.style.removeProperty("width");
      } else {
        navLinks.style.setProperty("display", "none", "important");
      }
    });
  }

 


});



