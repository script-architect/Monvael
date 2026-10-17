/**
 * MONVAEL GLOBAL ROUTING & TRANSITION CONTROLLER ENGINE
 * Purpose: Manages global horizontal tabs sub-routing architecture safely.
 */

function switchTab(targetTabId) {
    // 1. Fetch all modular view panel blocks
    const panels = document.querySelectorAll('.view-panel');
    panels.forEach(panel => {
        panel.classList.add('hidden');
        panel.classList.remove('block');
    });

    // 2. Clear out existing styling from control navigation tabs
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.classList.remove('bg-emerald-800', 'text-white', 'shadow-sm');
        tab.classList.add('text-slate-400', 'hover:text-slate-200', 'hover:bg-slate-800/50');
    });

    // 3. Mount selected target viewport infrastructure node
    const activePanel = document.getElementById(`view-${targetTabId}`);
    if (activePanel) {
        activePanel.classList.remove('hidden');
        activePanel.classList.add('block');
    }

    // 4. Inject active financial premium highlights onto the current route navigation header
    const activeTab = document.getElementById(`tab-${targetTabId}`);
    if (activeTab) {
        activeTab.classList.remove('text-slate-400', 'hover:text-slate-200', 'hover:bg-slate-800/50');
        activeTab.classList.add('bg-emerald-800', 'text-white', 'shadow-sm');
    }
}
