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

// Hartico AdBlocker v1.0 - Content Script
// Elimina anuncios dinamicos del DOM en tiempo real + proteccion de clicks

(function() {
    'use strict';

    const CONFIG = {
        debug: false,
        checkInterval: 500,
        maxRetries: 10,
        retryDelay: 1000,
    };

    let currentMode = 'strict';
    let siteMode = 'default';
    let isEnabled = true;
    let isWhitelisted = false;
    let blockingActive = false;

    let sessionAdsBlocked = 0;
    let sessionDomainsBlocked = new Set();

    const AD_DOMAINS = [
        'googleadservices.com', 'googlesyndication.com', 'doubleclick.net',
        'googletagmanager.com', 'googletagservices.com', 'amazon-adsystem.com',
        'adnxs.com', 'criteo.com', 'criteo.net', 'pubmatic.com', 'openx.net',
        'rubiconproject.com', 'casalemedia.com', 'adsrvr.org', 'advertising.com',
        'adsymptotic.com', 'adsafeprotected.com', 'moatads.com',
        'scorecardresearch.com', 'quantserve.com', 'media.net', 'yieldmo.com',
        'facebook.com/tr', 'analytics.twitter.com', 'bat.bing.com',
        'ads.yahoo.com', 'advertising.yahoo.com', 'adsystem.yahoo.com',
        'outbrain.com', 'taboola.com', 'revcontent.com', 'mgid.com',
        'adform.net', 'adroll.com', 'sharethrough.com', 'teads.tv',
        'spotxchange.com', 'smartadserver.com', 'iasds.net', 'doubleverify.com',
        'gstatic.com', 'fundingchoicesmessages.google.com', 'consentmanager.net',
        'appconsent.net', 'userconsent.org', 'id5-sync.com', 'eids.eu',
        'tag.aticdn.net', 'cdn.prebid.org', 'prebid-server.rubiconproject.com',
        'prebid.media.net', 'eus.rubiconproject.com', 'fastlane.rubiconproject.com',
        'hb.pubmatic.com', 'showads.pubmatic.com', 'secure.adnxs.com',
        'ib.adnxs.com', 'adservetx.media.net', 'contextual.media.net',
        'bidder.criteo.com', 'static.criteo.net', 'hb.yieldmo.com',
        'cdn.yieldmo.com', 'hb.yahoo.net', 'platform.twitter.com',
        'connect.facebook.net', 'aax.amazon-adsystem.com', 's.amazon-adsystem.com',
        'c.amazon-adsystem.com', 'adsystem.amazon.com', 'partner.googleadservices.com',
        'pagead2.googlesyndication.com', 'adservice.google.com', 'tpc.googlesyndication.com',
        'googleads.g.doubleclick.net', 'google-analytics.com',
        'clients2.google.com', 'clients3.google.com', 'clients4.google.com', 'clients5.google.com',
    ];

    const TRACKER_DOMAINS = [
        'google-analytics.com', 'googletagmanager.com', 'connect.facebook.net',
        'analytics.twitter.com', 'bat.bing.com', 'scorecardresearch.com',
        'quantserve.com', 'moatads.com', 'adsafeprotected.com', 'iasds.net',
        'doubleverify.com', 'id5-sync.com', 'eids.eu', 'tag.aticdn.net',
    ];

    const AD_SELECTORS = [
        '.adsbygoogle', '.adsbygoogle-noablate', 'ins.adsbygoogle',
        '[data-ad-client]', '[data-ad-slot]', '[data-google-query-id]',
        'iframe[name="googlefcPresent"]', 'iframe#google_esf',
        'iframe[src*="googlesyndication.com"]', 'iframe[src*="doubleclick.net"]',
        'iframe[src*="googleadservices.com"]', 'iframe[src*="google.com/pagead"]',
        'iframe[src*="googletagservices.com"]', 'iframe[src*="amazon-adsystem.com"]',
        'iframe[src*="adnxs.com"]', 'iframe[src*="criteo.com"]',
        'iframe[src*="criteo.net"]', 'iframe[src*="pubmatic.com"]',
        'iframe[src*="openx.net"]', 'iframe[title="Advertisement"]',
        '#google_ads_frame', '#google_ads_frame1', '#google_ads_frame2',
        '#aswift_0', '#aswift_1', '#aswift_2', '#ad_iframe', '#mys-wrapper',
        '[id*="google_ads"]:not([data-ved]):not(.g):not(.rg_i)', '[id*="__gtm"]',
        '.ad-wrapper', '.ad-container', '.ad-unit', '.ad-slot',
        '.ad-banner', '.ad-box', '.sponsored', '.sponsored-content',
        '.promoted', '.promoted-content', '.native-ad', '.outbrain',
        '.taboola', '.revcontent', '.mgid',
        '#google_center_div', '#ad_unit', '#ads',
        '.ad_container', '.google-ad', '.google-ad-container',
    ];

    const TRACKER_SELECTORS = [
        '.fc-dialog-container', '.fc-consent-root', '.fc-dialog-overlay',
        '#cookie-banner', '#cookie-consent', '.cc-banner', '.cc-window',
        '.cookie-notice', '.cookie-banner', '.gdpr-banner', '.gdpr-notice',
        '.onetrust-consent-sdk', '#onetrust-consent-sdk', '#onetrust-banner-sdk',
        '.ot-sdk-show-settings', '.cookiebot', '#CybotCookiebotDialog',
        '.CybotCookiebotDialog', '.usercentrics-root', '#usercentrics-root',
        '.sourcepoint-modal', '#sourcepoint-modal',
    ];

    const PROTECTED_SELECTORS = [
        '[data-ved]', '.rg_i', '.YQ4gaf', '.bRMDJf',
        'img[src*="googleusercontent.com"]', 'img[src*="gstatic.com"]',
        '.g', '.yuRUbf', '.LC20lb', '.VwiC3b',
        '.ytd-video-renderer', '.ytd-thumbnail', '#thumbnail',
        'img:not([src*="googlesyndication.com"]):not([src*="doubleclick.net"]):not([src*="googleadservices.com"])',
    ];

    const originalAppend = Element.prototype.appendChild;
    const originalAppend2 = Element.prototype.append;
    const originalInsertBefore = Element.prototype.insertBefore;

    function log(...args) {
        if (CONFIG.debug) console.log('[Hartico AdBlocker]', ...args);
    }

    function isAdDomain(src) {
        if (!src) return false;
        try {
            const url = new URL(src, window.location.href);
            const hostname = url.hostname.toLowerCase();
            if (!hostname || hostname === window.location.hostname.toLowerCase()) return false;

            if (currentMode === 'relaxed') {
                const basicAdDomains = [
                    'googleadservices.com', 'googlesyndication.com', 'doubleclick.net',
                    'googletagmanager.com', 'googletagservices.com', 'amazon-adsystem.com',
                    'adnxs.com', 'criteo.com', 'criteo.net', 'pubmatic.com', 'openx.net', 'rubiconproject.com',
                ];
                return basicAdDomains.some(d => hostname === d || hostname.endsWith('.' + d));
            }
            return AD_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
        } catch {
            return false;
        }
    }

    function getActiveSelectors() {
        let selectors = [...AD_SELECTORS];
        if (currentMode === 'strict') {
            selectors = selectors.concat(TRACKER_SELECTORS);
        }
        return selectors;
    }

    function isProtected(el) {
        if (el.tagName === 'IMG') {
            const src = el.src || '';
            if (!isAdDomain(src)) return true;
        }
        for (const selector of PROTECTED_SELECTORS) {
            try {
                if (el.matches && el.matches(selector)) return true;
                if (el.closest) {
                    const ancestor = el.closest(selector);
                    if (ancestor) return true;
                }
            } catch (e) {}
        }
        return false;
    }

    function killAds() {
        if (!blockingActive) return 0;
        let removed = 0;
        let blockedDomains = new Set();
        const selectors = getActiveSelectors();

        for (const selector of selectors) {
            try {
                const elements = document.querySelectorAll(selector);
                for (const el of elements) {
                    if (el && el.parentNode && !isProtected(el)) {
                        el.remove();
                        removed++;
                    }
                }
            } catch (e) {}
        }

        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
            if (isAdDomain(iframe.src) && !isProtected(iframe)) {
                try {
                    const u = new URL(iframe.src, window.location.href);
                    blockedDomains.add(u.hostname.toLowerCase());
                    sessionDomainsBlocked.add(u.hostname.toLowerCase());
                } catch(e) {}
                iframe.remove();
                removed++;
            }
        }

        const scripts = document.querySelectorAll('script[src]');
        for (const script of scripts) {
            if (isAdDomain(script.src)) {
                try {
                    const u = new URL(script.src, window.location.href);
                    blockedDomains.add(u.hostname.toLowerCase());
                    sessionDomainsBlocked.add(u.hostname.toLowerCase());
                } catch(e) {}
                script.remove();
                removed++;
            }
        }

        document.querySelectorAll('div').forEach(div => {
            if (isProtected(div)) return;
            const style = window.getComputedStyle(div);
            if (style.position === 'fixed' || style.position === 'absolute') {
                const rect = div.getBoundingClientRect();
                const isLarge = rect.width > window.innerWidth * 0.3 && rect.height > window.innerHeight * 0.3;
                const isEmpty = div.children.length === 0 || div.textContent.trim().length === 0;
                const hasPointerEvents = style.pointerEvents !== 'none';
                if (isLarge && isEmpty && hasPointerEvents) {
                    div.style.pointerEvents = 'none';
                    if (div.children.length === 0 && div.textContent.trim().length === 0) {
                        div.remove();
                        removed++;
                    }
                }
            }
        });

        if (removed > 0) {
            log(`Eliminados ${removed} elementos`);
            sessionAdsBlocked += removed;
            try {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                    chrome.runtime.sendMessage({
                        action: 'updateStats',
                        adsBlocked: removed,
                        domainsBlocked: blockedDomains.size
                    });
                }
            } catch (e) {}
        }
        return removed;
    }

    function disableAdsByGoogle() {
        if (!blockingActive) return;
        try {
            Object.defineProperty(window, 'adsbygoogle', {
                get: () => ({ push: () => {}, loaded: true, cmd: [] }),
                set: () => {},
                configurable: false
            });
        } catch (e) {}
    }

    function interceptAppendChild() {
        if (!blockingActive) return;

        function blockAdElement(child) {
            try {
                if (!child || child.nodeType !== Node.ELEMENT_NODE) return false;
                if (isProtected(child)) return false;

                const tag = child.tagName;
                if (tag === 'IFRAME') {
                    const src = child.src || '';
                    if (isAdDomain(src) || child.id === 'google_esf') return true;
                }
                if (tag === 'SCRIPT') {
                    const src = child.src || '';
                    if (isAdDomain(src)) return true;
                }
                if (tag === 'IMG') {
                    const src = child.src || '';
                    if (isAdDomain(src)) return true;
                    return false;
                }

                const selectors = getActiveSelectors();
                for (const selector of selectors) {
                    try {
                        if (child.matches && child.matches(selector)) return true;
                    } catch (e) {}
                }
            } catch (err) {
                return false;
            }
            return false;
        }

        Element.prototype.appendChild = function(child) {
            try {
                if (blockAdElement(child)) return child;
            } catch (e) {}
            return originalAppend.call(this, child);
        };

        Element.prototype.append = function(...children) {
            try {
                const filtered = children.filter(c => !blockAdElement(c));
                return originalAppend2.apply(this, filtered);
            } catch (e) {
                return originalAppend2.apply(this, children);
            }
        };

        Element.prototype.insertBefore = function(newNode, referenceNode) {
            try {
                if (blockAdElement(newNode)) return newNode;
            } catch (e) {}
            return originalInsertBefore.call(this, newNode, referenceNode);
        };
    }

    function restoreAppendChild() {
        Element.prototype.appendChild = originalAppend;
        Element.prototype.append = originalAppend2;
        Element.prototype.insertBefore = originalInsertBefore;
    }

    let observer = null;

    function setupMutationObserver() {
        if (!window.MutationObserver || !blockingActive) return;

        observer = new MutationObserver((mutations) => {
            if (!blockingActive) return;
            let hasAd = false;
            const selectors = getActiveSelectors();

            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (isProtected(node)) continue;
                        const el = node;
                        for (const selector of selectors) {
                            try {
                                if (el.matches && el.matches(selector)) { hasAd = true; break; }
                                if (el.querySelector) {
                                    const children = el.querySelectorAll(selector);
                                    if (children.length > 0) { hasAd = true; break; }
                                }
                            } catch (e) {}
                        }
                        if (el.tagName === 'IFRAME' && isAdDomain(el.src)) hasAd = true;
                        if (hasAd) break;
                    }
                }
                if (hasAd) break;
            }

            if (hasAd) {
                requestAnimationFrame(() => killAds());
            }
        });

        function startObserving() {
            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
            } else {
                setTimeout(startObserving, 100);
            }
        }
        startObserving();
    }

    function disconnectObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    let periodicInterval = null;

    function setupPeriodicCleanup() {
        if (!blockingActive) return;
        let retries = 0;
        periodicInterval = setInterval(() => {
            if (!blockingActive) {
                clearInterval(periodicInterval);
                return;
            }
            const removed = killAds();
            if (removed === 0) {
                retries++;
                if (retries >= CONFIG.maxRetries) {
                    clearInterval(periodicInterval);
                }
            } else {
                retries = 0;
            }
        }, CONFIG.checkInterval);
    }

    function stopPeriodicCleanup() {
        if (periodicInterval) {
            clearInterval(periodicInterval);
            periodicInterval = null;
        }
    }

    let injectedStyle = null;

    function injectClickProtectionCSS() {
        if (!blockingActive) return;
        if (injectedStyle) return;

        const style = document.createElement('style');
        const selectors = getActiveSelectors();
        const selectorList = selectors.join(', ');

        style.textContent = `
            ${selectorList} {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                width: 0 !important;
                height: 0 !important;
                position: absolute !important;
                z-index: -9999 !important;
                pointer-events: none !important;
            }
            body > div[style*="position: fixed"][style*="z-index"]:empty,
            body > div[style*="position: absolute"][style*="z-index"]:empty {
                pointer-events: none !important;
            }
            main, main *, article, article *, section, section *,
            .content, .content *, [role="main"], [role="main"] * {
                pointer-events: auto !important;
            }
            img[src*="googleusercontent.com"], img[src*="gstatic.com"],
            .rg_i, .YQ4gaf, .bRMDJf {
                display: block !important; visibility: visible !important; opacity: 1 !important;
                width: auto !important; height: auto !important;
                position: static !important; z-index: auto !important; pointer-events: auto !important;
            }
        `;
        (document.head || document.documentElement).appendChild(style);
        injectedStyle = style;
    }

    function removeInjectedCSS() {
        if (injectedStyle && injectedStyle.parentNode) {
            injectedStyle.parentNode.removeChild(injectedStyle);
            injectedStyle = null;
        }
    }

    async function loadStateFromBackground() {
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                const response = await chrome.runtime.sendMessage({ action: 'getCurrentSiteMode', domain: window.location.hostname });
                if (response) {
                    currentMode = response.effectiveMode || 'strict';
                    siteMode = response.siteMode || 'default';
                    isEnabled = response.enabled !== false;
                    isWhitelisted = response.isWhitelisted === true;
                    log('Estado cargado - enabled:', isEnabled, 'whitelisted:', isWhitelisted, 'mode:', currentMode);
                }
            }
        } catch (e) {
            log('No se pudo cargar el estado');
        }
    }

    function activateBlocking() {
        if (blockingActive) return;
        blockingActive = true;
        disableAdsByGoogle();
        interceptAppendChild();
        injectClickProtectionCSS();
        killAds();
        setupMutationObserver();
        setupPeriodicCleanup();
        log('Bloqueo ACTIVADO');
    }

    function deactivateBlocking() {
        if (!blockingActive) return;
        blockingActive = false;
        restoreAppendChild();
        disconnectObserver();
        stopPeriodicCleanup();
        removeInjectedCSS();
        log('Bloqueo DESACTIVADO');
    }

    function updateBlockingState() {
        if (isEnabled && !isWhitelisted && siteMode !== 'allow') {
            activateBlocking();
        } else {
            deactivateBlocking();
        }
    }

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'stateChanged') {
                isEnabled = request.enabled;
                updateBlockingState();
                sendResponse({ success: true });
            }
            if (request.action === 'modeChanged') {
                currentMode = request.mode;
                updateBlockingState();
                sendResponse({ success: true });
            }
            if (request.action === 'siteSettingsChanged') {
                if (request.domain === window.location.hostname) {
                    siteMode = request.siteMode;
                    updateBlockingState();
                }
                sendResponse({ success: true });
            }
            if (request.action === 'listsChanged') {
                loadStateFromBackground().then(() => {
                    updateBlockingState();
                });
                sendResponse({ success: true });
            }
        });
    }

    async function init() {
        await loadStateFromBackground();
        updateBlockingState();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                if (blockingActive) {
                    killAds();
                    disableAdsByGoogle();
                    injectClickProtectionCSS();
                }
            });
        }

        window.addEventListener('load', () => {
            if (blockingActive) {
                setTimeout(killAds, 1000);
                setTimeout(killAds, 3000);
                setTimeout(killAds, 5000);
            }
        });

        log('Hartico AdBlocker v1.0 inicializado');
    }

    init();
})();