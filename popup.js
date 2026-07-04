/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  AdBlockNitro v1.0.0                                          ║
 * ║  Copyright (c) 2026 Ajotaz — https://ajotaz.com             ║
 * ║  Contact: contact@ajotaz.com                                  ║
 * ║  GitHub: https://github.com/Ajotaz/AdBlockNitro              ║
 * ║  Licensed under the AdBlockNitro License Agreement.          ║
 * ║  See LICENSE for full terms.                                  ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

// AdBlockNitro v1.0.0 — Popup Script

document.addEventListener('DOMContentLoaded', async () => {
    const toggle = document.getElementById('enabled-toggle');
    const blocklistToggle = document.getElementById('blocklist-toggle');
    const blocklistDesc = document.getElementById('blocklist-desc');
    const statusText = document.getElementById('status-text');
    const statusDot = document.querySelector('.status-dot');
    const adsBlockedEl = document.getElementById('ads-blocked');
    const domainsBlockedEl = document.getElementById('domains-blocked');
    const sinceDateEl = document.getElementById('since-date');
    const btnReset = document.getElementById('btn-reset');
    const modeDesc = document.getElementById('mode-desc');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsClose = document.getElementById('settings-close');

    const modePills = document.querySelectorAll('.mode-pill');
    const siteCard = document.getElementById('site-card');
    const siteDomainEl = document.getElementById('site-domain');
    const siteBadge = document.getElementById('site-badge');
    const siteBtns = document.querySelectorAll('.site-btn');

    const whitelistInput = document.getElementById('whitelist-input');
    const whitelistAdd = document.getElementById('whitelist-add');
    const whitelistList = document.getElementById('whitelist-list');
    const blacklistInput = document.getElementById('blacklist-input');
    const blacklistAdd = document.getElementById('blacklist-add');
    const blacklistList = document.getElementById('blacklist-list');

    let currentDomain = '';
    let currentMode = 'custom';
    let blocklistMode = false;

    const MODE_DESCRIPTIONS = {
        strict: 'Maxima proteccion: ads + trackers + cookies + fingerprinting',
        relaxed: 'Solo anuncios obvios: Google Ads, banners, pop-ups',
        custom: 'Configura cada sitio individualmente'
    };

    async function getCurrentTab() {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        return tabs[0] || null;
    }

    async function loadState() {
        try {
            const res = await chrome.runtime.sendMessage({ action: 'getEnabled' });
            toggle.checked = res.enabled;
            updateStatusBanner(res.enabled);
        } catch (e) { console.error('Error cargando estado:', e); }
    }

    async function loadBlocklistMode() {
        try {
            const res = await chrome.runtime.sendMessage({ action: 'getBlocklistMode' });
            blocklistMode = res.blocklistMode === true;
            blocklistToggle.checked = blocklistMode;
            updateBlocklistDesc();
        } catch (e) { console.error('Error cargando blocklistMode:', e); }
    }

    function updateBlocklistDesc() {
        if (blocklistMode) {
            blocklistDesc.textContent = 'Activado: solo bloquea anuncios en los sitios que anadas a la lista de bloqueo. YouTube, Discord y el resto quedan libres.';
            blocklistDesc.style.color = 'var(--accent-text)';
        } else {
            blocklistDesc.textContent = 'Desactivado: bloquea anuncios en todas las webs excepto las que anadas a la lista de permitidos.';
            blocklistDesc.style.color = 'var(--text-muted)';
        }
    }

    function updateStatusBanner(enabled) {
        if (enabled) {
            statusText.textContent = 'Proteccion activa';
            statusDot.classList.add('active');
        } else {
            statusText.textContent = 'Proteccion pausada';
            statusDot.classList.remove('active');
        }
    }

    async function loadMode() {
        try {
            const res = await chrome.runtime.sendMessage({ action: 'getMode' });
            currentMode = res.mode || 'custom';
            updateModeUI(currentMode);
        } catch (e) { console.error('Error cargando modo:', e); }
    }

    async function loadSiteInfo() {
        try {
            const tab = await getCurrentTab();
            if (tab && tab.url) {
                const url = new URL(tab.url);
                currentDomain = url.hostname;
                siteDomainEl.textContent = currentDomain;
                const res = await chrome.runtime.sendMessage({ action: 'getCurrentSiteMode', domain: currentDomain });
                updateSiteUI(res.siteMode || 'default', res);
            } else {
                siteDomainEl.textContent = 'Ninguna pestana activa';
                siteBadge.textContent = '--';
                siteBadge.className = 'site-badge';
            }
        } catch (e) { console.error('Error cargando sitio:', e); siteDomainEl.textContent = 'No disponible'; }
    }

    async function loadStats() {
        try {
            const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
            adsBlockedEl.textContent = formatNumber(stats.adsBlocked || 0);
            domainsBlockedEl.textContent = formatNumber(stats.domainsBlocked || 0);
            sinceDateEl.textContent = stats.since ? new Date(stats.since).toLocaleDateString('es-ES') : 'Hoy';
        } catch (e) { console.error('Error cargando stats:', e); }
    }

    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    function updateModeUI(mode) {
        modePills.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
        modeDesc.textContent = MODE_DESCRIPTIONS[mode] || MODE_DESCRIPTIONS.custom;
        siteCard.style.display = 'block';
    }

    function updateSiteUI(siteMode, res) {
        siteBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.action === siteMode));
        siteBadge.className = 'site-badge';

        if (siteMode === 'block') {
            siteBadge.textContent = 'Bloqueado';
            siteBadge.classList.add('blocked');
        } else if (siteMode === 'allow') {
            siteBadge.textContent = 'Permitido';
            siteBadge.classList.add('allowed');
        } else {
            if (blocklistMode) {
                if (res && res.isBlacklisted) {
                    siteBadge.textContent = 'En lista de bloqueo';
                    siteBadge.classList.add('blocked');
                } else {
                    siteBadge.textContent = 'Libre (no en lista)';
                }
            } else {
                if (res && res.isWhitelisted) {
                    siteBadge.textContent = 'En lista de permitidos';
                    siteBadge.classList.add('allowed');
                } else {
                    siteBadge.textContent = 'Por defecto';
                }
            }
        }
    }

    // === TOGGLE PRINCIPAL: pausar = auto-whitelist + recargar ===
    toggle.addEventListener('change', async () => {
        const enabled = toggle.checked;
        updateStatusBanner(enabled);
        try {
            const tab = await getCurrentTab();
            let domain = '';
            if (tab && tab.url) {
                try {
                    domain = new URL(tab.url).hostname;
                } catch(e) {}
            }

            if (!enabled && domain) {
                // El usuario esta PAUSANDO: auto-whitelist este dominio
                await chrome.runtime.sendMessage({ action: 'addToWhitelist', domain });
            }

            await chrome.runtime.sendMessage({ action: 'setEnabled', enabled });

            if (tab && tab.id) {
                chrome.tabs.reload(tab.id);
            }
        } catch (e) { console.error('Error cambiando estado:', e); }
    });

    blocklistToggle.addEventListener('change', async () => {
        blocklistMode = blocklistToggle.checked;
        updateBlocklistDesc();
        try {
            await chrome.runtime.sendMessage({ action: 'setBlocklistMode', blocklistMode });
            loadSiteInfo();
        } catch (e) { console.error('Error cambiando blocklistMode:', e); }
    });

    modePills.forEach(btn => {
        btn.addEventListener('click', async () => {
            const mode = btn.dataset.mode;
            currentMode = mode;
            updateModeUI(mode);
            try { await chrome.runtime.sendMessage({ action: 'setMode', mode }); }
            catch (e) { console.error('Error cambiando modo:', e); }
        });
    });

    siteBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.dataset.action;
            updateSiteUI(action, null);
            try { await chrome.runtime.sendMessage({ action: 'setSiteMode', domain: currentDomain, siteMode: action }); }
            catch (e) { console.error('Error cambiando modo del sitio:', e); }
        });
    });

    btnReset.addEventListener('click', async () => {
        try {
            await chrome.runtime.sendMessage({ action: 'resetStats' });
            loadStats();
            btnReset.innerHTML = `<svg class="icon-btn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Reseteado`;
            setTimeout(() => {
                btnReset.innerHTML = `<svg class="icon-btn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg> Resetear estadisticas`;
            }, 1500);
        } catch (e) { console.error('Error reseteando stats:', e); }
    });

    function openSettings() {
        settingsOverlay.classList.add('active');
        loadLists();
    }

    function closeSettings() {
        settingsOverlay.classList.remove('active');
    }

    settingsBtn.addEventListener('click', openSettings);
    settingsClose.addEventListener('click', closeSettings);
    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) closeSettings();
    });

    async function loadLists() {
        try {
            const res = await chrome.runtime.sendMessage({ action: 'getLists' });
            renderList(whitelistList, res.whitelist || [], 'whitelist');
            renderList(blacklistList, res.blacklist || [], 'blacklist');
        } catch (e) { console.error('Error cargando listas:', e); }
    }

    function renderList(container, items, listType) {
        container.innerHTML = '';
        if (items.length === 0) return;
        items.forEach(domain => {
            const li = document.createElement('li');
            li.className = 'settings-list-item';
            li.innerHTML = `
                <span class="domain">${escapeHtml(domain)}</span>
                <button class="remove-btn" data-domain="${escapeHtml(domain)}" data-list="${listType}" title="Eliminar">&times;</button>
            `;
            container.appendChild(li);
        });

        container.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const domain = btn.dataset.domain;
                const list = btn.dataset.list;
                try {
                    if (list === 'whitelist') {
                        await chrome.runtime.sendMessage({ action: 'removeFromWhitelist', domain });
                    } else {
                        await chrome.runtime.sendMessage({ action: 'removeFromBlacklist', domain });
                    }
                    loadLists();
                } catch (e) { console.error('Error eliminando:', e); }
            });
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getDomainFromInput(input) {
        let val = input.value.trim().toLowerCase();
        val = val.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        return val;
    }

    whitelistAdd.addEventListener('click', async () => {
        const domain = getDomainFromInput(whitelistInput);
        if (!domain) return;
        try {
            const res = await chrome.runtime.sendMessage({ action: 'addToWhitelist', domain });
            if (res.success) {
                whitelistInput.value = '';
                loadLists();
            }
        } catch (e) { console.error('Error anadiendo:', e); }
    });

    whitelistInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') whitelistAdd.click();
    });

    blacklistAdd.addEventListener('click', async () => {
        const domain = getDomainFromInput(blacklistInput);
        if (!domain) return;
        try {
            const res = await chrome.runtime.sendMessage({ action: 'addToBlacklist', domain });
            if (res.success) {
                blacklistInput.value = '';
                loadLists();
            }
        } catch (e) { console.error('Error anadiendo:', e); }
    });

    blacklistInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') blacklistAdd.click();
    });

    await loadState();
    await loadBlocklistMode();
    await loadMode();
    await loadSiteInfo();
    await loadStats();
    setInterval(loadStats, 1000);
});
