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

// Hartico AdBlocker v1.0 - Background Service Worker
// Maneja reglas dinamicas, estado, modos y estadisticas

const MODES = {
    STRICT: 'strict',
    RELAXED: 'relaxed',
    CUSTOM: 'custom'
};

const DEFAULT_MODE = MODES.STRICT;

chrome.runtime.onInstalled.addListener((details) => {
    console.log('[AdBlockNitro] Instalado/Actualizado:', details.reason);

    chrome.storage.local.get([
        'enabled', 'mode', 'siteSettings', 'stats',
        'whitelist', 'blacklist', 'blocklistMode'
    ], (result) => {
        if (result.enabled === undefined) {
            chrome.storage.local.set({ enabled: true });
        }
        if (!result.mode) {
            chrome.storage.local.set({ mode: DEFAULT_MODE });
        }
        if (!result.siteSettings) {
            chrome.storage.local.set({ siteSettings: {} });
        }
        if (!result.stats) {
            chrome.storage.local.set({
                stats: {
                    adsBlocked: 0,
                    domainsBlocked: 0,
                    since: new Date().toISOString()
                }
            });
        }
        if (!result.whitelist) {
            chrome.storage.local.set({ whitelist: [] });
        }
        if (!result.blacklist) {
            chrome.storage.local.set({ blacklist: [] });
        }
        if (result.blocklistMode === undefined) {
            chrome.storage.local.set({ blocklistMode: false });
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStats') {
        chrome.storage.local.get(['stats'], (result) => {
            sendResponse(result.stats || { adsBlocked: 0, domainsBlocked: 0 });
        });
        return true;
    }

    if (request.action === 'getEnabled') {
        chrome.storage.local.get(['enabled'], (result) => {
            sendResponse({ enabled: result.enabled !== false });
        });
        return true;
    }

    if (request.action === 'setEnabled') {
        chrome.storage.local.set({ enabled: request.enabled }, () => {
            updateRules(request.enabled);
            notifyAllTabs({ action: 'stateChanged', enabled: request.enabled });
            sendResponse({ success: true });
        });
        return true;
    }

    if (request.action === 'getMode') {
        chrome.storage.local.get(['mode'], (result) => {
            sendResponse({ mode: result.mode || DEFAULT_MODE });
        });
        return true;
    }

    if (request.action === 'setMode') {
        chrome.storage.local.set({ mode: request.mode }, () => {
            applyMode(request.mode);
            notifyAllTabs({ action: 'modeChanged', mode: request.mode });
            sendResponse({ success: true });
        });
        return true;
    }

    if (request.action === 'getBlocklistMode') {
        chrome.storage.local.get(['blocklistMode'], (result) => {
            sendResponse({ blocklistMode: result.blocklistMode === true });
        });
        return true;
    }

    if (request.action === 'setBlocklistMode') {
        chrome.storage.local.set({ blocklistMode: request.blocklistMode }, () => {
            notifyAllTabs({ action: 'blocklistModeChanged', blocklistMode: request.blocklistMode });
            sendResponse({ success: true });
        });
        return true;
    }

    if (request.action === 'getSiteSettings') {
        chrome.storage.local.get(['siteSettings'], (result) => {
            sendResponse(result.siteSettings || {});
        });
        return true;
    }

    if (request.action === 'setSiteMode') {
        chrome.storage.local.get(['siteSettings'], (result) => {
            const settings = result.siteSettings || {};
            settings[request.domain] = request.siteMode;
            chrome.storage.local.set({ siteSettings: settings }, () => {
                notifyAllTabs({ action: 'siteSettingsChanged', domain: request.domain, siteMode: request.siteMode });
                sendResponse({ success: true });
            });
        });
        return true;
    }

    if (request.action === 'getCurrentSiteMode') {
        chrome.storage.local.get(['mode', 'siteSettings', 'enabled', 'whitelist', 'blacklist', 'blocklistMode'], (result) => {
            const domain = request.domain;
            const siteSettings = result.siteSettings || {};
            const siteMode = siteSettings[domain] || 'default';
            const whitelist = result.whitelist || [];
            const blacklist = result.blacklist || [];
            const isWhitelisted = whitelist.some(d => domain === d || domain.endsWith('.' + d));
            const isBlacklisted = blacklist.some(d => domain === d || domain.endsWith('.' + d));
            sendResponse({
                globalMode: result.mode || DEFAULT_MODE,
                siteMode: siteMode,
                effectiveMode: siteMode === 'default' ? (result.mode || DEFAULT_MODE) : siteMode,
                enabled: result.enabled !== false,
                isWhitelisted: isWhitelisted,
                isBlacklisted: isBlacklisted,
                blocklistMode: result.blocklistMode === true
            });
        });
        return true;
    }

    if (request.action === 'updateStats') {
        chrome.storage.local.get(['stats'], (result) => {
            const stats = result.stats || { adsBlocked: 0, domainsBlocked: 0, since: new Date().toISOString() };
            stats.adsBlocked += request.adsBlocked || 0;
            stats.domainsBlocked += request.domainsBlocked || 0;
            chrome.storage.local.set({ stats });
        });
        sendResponse({ success: true });
        return true;
    }

    if (request.action === 'resetStats') {
        chrome.storage.local.set({
            stats: {
                adsBlocked: 0,
                domainsBlocked: 0,
                since: new Date().toISOString()
            }
        }, () => {
            sendResponse({ success: true });
        });
        return true;
    }

    if (request.action === 'getLists') {
        chrome.storage.local.get(['whitelist', 'blacklist'], (result) => {
            sendResponse({
                whitelist: result.whitelist || [],
                blacklist: result.blacklist || []
            });
        });
        return true;
    }

    if (request.action === 'addToWhitelist') {
        chrome.storage.local.get(['whitelist'], (result) => {
            const list = result.whitelist || [];
            const domain = normalizeDomain(request.domain);
            if (domain && !list.includes(domain)) {
                list.push(domain);
                chrome.storage.local.set({ whitelist: list }, () => {
                    notifyAllTabs({ action: 'listsChanged' });
                    sendResponse({ success: true, list: list });
                });
            } else {
                sendResponse({ success: false, list: list, error: 'Ya existe o dominio invalido' });
            }
        });
        return true;
    }

    if (request.action === 'removeFromWhitelist') {
        chrome.storage.local.get(['whitelist'], (result) => {
            const list = (result.whitelist || []).filter(d => d !== request.domain);
            chrome.storage.local.set({ whitelist: list }, () => {
                notifyAllTabs({ action: 'listsChanged' });
                sendResponse({ success: true, list: list });
            });
        });
        return true;
    }

    if (request.action === 'addToBlacklist') {
        chrome.storage.local.get(['blacklist'], (result) => {
            const list = result.blacklist || [];
            const domain = normalizeDomain(request.domain);
            if (domain && !list.includes(domain)) {
                list.push(domain);
                chrome.storage.local.set({ blacklist: list }, () => {
                    notifyAllTabs({ action: 'listsChanged' });
                    sendResponse({ success: true, list: list });
                });
            } else {
                sendResponse({ success: false, list: list, error: 'Ya existe o dominio invalido' });
            }
        });
        return true;
    }

    if (request.action === 'removeFromBlacklist') {
        chrome.storage.local.get(['blacklist'], (result) => {
            const list = (result.blacklist || []).filter(d => d !== request.domain);
            chrome.storage.local.set({ blacklist: list }, () => {
                notifyAllTabs({ action: 'listsChanged' });
                sendResponse({ success: true, list: list });
            });
        });
        return true;
    }
});

function normalizeDomain(raw) {
    if (!raw) return '';
    return raw.trim().toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];
}

function notifyAllTabs(message) {
    chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, message).catch(() => {});
            }
        }
    });
}

async function applyMode(mode) {
    try {
        const enabledRulesets = [];
        const disabledRulesets = [];

        if (mode === MODES.STRICT) {
            enabledRulesets.push('ruleset_1');
            console.log('[AdBlockNitro] Modo STRICT activado');
        } else if (mode === MODES.RELAXED) {
            enabledRulesets.push('ruleset_1');
            console.log('[AdBlockNitro] Modo RELAXED activado');
        } else if (mode === MODES.CUSTOM) {
            enabledRulesets.push('ruleset_1');
            console.log('[AdBlockNitro] Modo CUSTOM activado');
        }

        await chrome.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: enabledRulesets,
            disableRulesetIds: disabledRulesets
        });
    } catch (e) {
        console.error('[AdBlockNitro] Error aplicando modo:', e);
    }
}

async function updateRules(enabled) {
    try {
        if (enabled) {
            await chrome.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ['ruleset_1']
            });
            console.log('[AdBlockNitro] Reglas activadas');
        } else {
            await chrome.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ['ruleset_1']
            });
            console.log('[AdBlockNitro] Reglas desactivadas');
        }
    } catch (e) {
        console.error('[AdBlockNitro] Error actualizando reglas:', e);
    }
}

chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((info) => {
    console.log('[AdBlockNitro] Request bloqueado:', info.request.url);
});
