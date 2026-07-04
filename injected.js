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

// AdBlockNitro v1.0.0 — Injected Script
// Neutraliza APIs de publicidad antes de que los scripts del sitio las usen

(function() {
    'use strict';

    function safeAssign(obj, prop, value) {
        try {
            obj[prop] = value;
        } catch (e) {
            try {
                Object.defineProperty(obj, prop, {
                    value: value,
                    configurable: true,
                    writable: true
                });
            } catch (e2) {
                console.warn('[AdBlockNitro] No se pudo sobrescribir ' + prop + ':', e2.message);
            }
        }
    }

    function safeDefine(obj, prop, descriptor) {
        try {
            Object.defineProperty(obj, prop, descriptor);
        } catch (e) {
            console.warn('[AdBlockNitro] No se pudo redefinir ' + prop + ':', e.message);
        }
    }

    function noop() { return 0; }
    function noopFn() {}
    function noopPromise() { return Promise.resolve(); }
    function noopPromiseNull() { return Promise.resolve(null); }
    function noopPromiseArr() { return Promise.resolve([]); }
    function noopPromiseObj() { return Promise.resolve({ id: 'blocked', version: 'blocked' }); }

    // === GOOGLE PUBLISHER TAG ===
    try {
        window.googletag = window.googletag || { cmd: [] };
        window.googletag.cmd.push = noop;
        window.googletag.pubads = function() {
            return {
                refresh: noopFn, display: noopFn, collapseEmptyDivs: noopFn,
                enableSingleRequest: noopFn, setTargeting: noopFn, clearTargeting: noopFn,
                setCategoryExclusion: noopFn, clearCategoryExclusions: noopFn,
                setCookieOptions: noopFn, setTagForChildDirectedTreatment: noopFn,
                clearTagForChildDirectedTreatment: noopFn, setVideoContent: noopFn,
                setForceSafeFrame: noopFn, setSafeFrameConfig: noopFn
            };
        };
        window.googletag.enableServices = noopFn;
        window.googletag.defineSlot = function() {
            return {
                addService: function(){ return this; }, setTargeting: function(){ return this; },
                clearTargeting: function(){ return this; }, setCategoryExclusion: function(){ return this; },
                clearCategoryExclusions: function(){ return this; }, setCollapseEmptyDiv: function(){ return this; },
                setForceSafeFrame: function(){ return this; }
            };
        };
        window.googletag.defineOutOfPageSlot = window.googletag.defineSlot;
        window.googletag.defineUnit = window.googletag.defineSlot;
        window.googletag.destroySlots = function() { return true; };
        window.googletag.display = noopFn;
        window.googletag.companionAds = function() { return { setRefreshUnfilledSlots: noopFn }; };
        window.googletag.sizeMapping = function() { return { addSize: function(){ return this; }, build: function(){ return []; } }; };
    } catch (e) { console.warn('[AdBlockNitro] googletag:', e.message); }

    // === GOOGLE FUNDING CHOICES ===
    try {
        safeAssign(window, 'googlefc', window.googlefc || {});
        window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
        window.googlefc.callbackQueue.push = noop;
        window.googlefc.getConsentStatus = function() { return 2; };
        window.googlefc.getConsentedProviderIds = function() { return []; };
        window.googlefc.getInitialConsentStatus = function() { return 2; };
        window.googlefc.getUpdateConsentStatus = function() { return 2; };
        window.googlefc.showRevocationMessage = noopFn;
    } catch (e) { console.warn('[AdBlockNitro] googlefc:', e.message); }

    // === GTAG / GA / DATALAYER ===
    try {
        safeAssign(window, 'gtag', noopFn);
        safeAssign(window, 'dataLayer', window.dataLayer || []);
        window.dataLayer.push = noop;
        safeAssign(window, 'ga', noopFn);
        safeAssign(window, 'GoogleAnalyticsObject', 'ga');
    } catch (e) { console.warn('[AdBlockNitro] gtag/ga:', e.message); }

    // === FACEBOOK PIXEL ===
    try { safeAssign(window, 'fbq', noopFn); safeAssign(window, '_fbq', window.fbq); safeAssign(window, 'facebookPixel', noopFn); } catch (e) {}

    // === TWITTER PIXEL ===
    try { safeAssign(window, 'twq', noopFn); safeAssign(window, 'twitterPixel', noopFn); } catch (e) {}

    // === MICROSOFT BING (UET) ===
    try { safeAssign(window, 'uetq', { push: noopFn }); } catch (e) {}

    // === LINKEDIN INSIGHT ===
    try { safeAssign(window, '_linkedin_data_partner_ids', []); safeAssign(window, 'lintrk', noopFn); } catch (e) {}

    // === PINTEREST TAG ===
    try { safeAssign(window, 'pintrk', noopFn); } catch (e) {}

    // === TIKTOK PIXEL ===
    try { safeAssign(window, 'ttq', noopFn); } catch (e) {}

    // === SNAPCHAT PIXEL ===
    try { safeAssign(window, 'snaptr', noopFn); } catch (e) {}

    // === REDDIT PIXEL ===
    try { safeAssign(window, 'rdt', noopFn); } catch (e) {}

    // === CRITEO ===
    try { safeAssign(window, 'criteo_q', []); window.criteo_q.push = noop; } catch (e) {}

    // === OUTBRAIN ===
    try { safeAssign(window, 'OutbrainPermaConf', {}); safeAssign(window, 'OB_releaseVer', noopFn); } catch (e) {}

    // === TABOOLA ===
    try { safeAssign(window, '_taboola', []); window._taboola.push = noop; } catch (e) {}

    // === MGID ===
    try { safeAssign(window, 'MGIDWidget', noopFn); } catch (e) {}

    // === ADROLL ===
    try { safeAssign(window, 'adroll_adv_id', ''); safeAssign(window, 'adroll_pix_id', ''); safeAssign(window, '__adroll_loaded', true); } catch (e) {}

    // === AMAZON ASSOCIATES ===
    try { safeAssign(window, 'amzn_assoc_placement', ''); safeAssign(window, 'amzn_assoc_tracking_id', ''); } catch (e) {}

    // === GOOGLE ADSENSE ===
    try {
        safeAssign(window, 'adsbygoogle', []);
        window.adsbygoogle.push = noop;
        window.adsbygoogle.loaded = true;
        window.adsbygoogle.cmd = window.adsbygoogle.cmd || [];
        window.adsbygoogle.cmd.push = noop;
    } catch (e) { console.warn('[AdBlockNitro] adsbygoogle:', e.message); }

    // === PREBID ===
    try {
        safeAssign(window, 'pbjs', {});
        window.pbjs.que = window.pbjs.que || [];
        window.pbjs.que.push = noop;
        window.pbjs.requestBids = noopFn;
        window.pbjs.setConfig = noopFn;
        window.pbjs.addAdUnits = noopFn;
    } catch (e) {}

    // === HOTJAR ===
    try { safeAssign(window, 'hj', noopFn); safeAssign(window, '_hjSettings', { hjid: 0, hjsv: 0 }); } catch (e) {}

    // === MIXPANEL ===
    try { safeAssign(window, 'mixpanel', { track: noopFn, identify: noopFn, people: { set: noopFn, track: noopFn } }); } catch (e) {}

    // === SEGMENT ===
    try { safeAssign(window, 'analytics', { track: noopFn, page: noopFn, identify: noopFn, group: noopFn, alias: noopFn, ready: noopFn, on: noopFn, once: noopFn, off: noopFn }); } catch (e) {}

    // === AMPLITUDE ===
    try {
        safeAssign(window, 'amplitude', {
            getInstance: function() {
                return { init: noopFn, logEvent: noopFn, setUserId: noopFn, setUserProperties: noopFn, setOptOut: noopFn };
            }
        });
    } catch (e) {}

    // === HEAP ===
    try { safeAssign(window, 'heap', { track: noopFn, identify: noopFn }); } catch (e) {}

    // === MATOMO / PIWIK ===
    try { safeAssign(window, '_paq', []); window._paq.push = noop; safeAssign(window, 'Matomo', {}); safeAssign(window, 'Piwik', {}); } catch (e) {}

    // === Quantcast ===
    try { safeAssign(window, '_qevents', []); window._qevents.push = noop; safeAssign(window, '__qc', noopFn); } catch (e) {}

    // === Comscore ===
    try { safeAssign(window, '_comscore', []); window._comscore.push = noop; safeAssign(window, 'COMSCORE', { beacon: noopFn }); } catch (e) {}

    // === Moat ===
    try { safeAssign(window, 'moatApi', { dispatchEvent: noopFn }); } catch (e) {}

    // === DoubleVerify ===
    try { safeAssign(window, 'dvObj', { publish: noopFn }); } catch (e) {}

    // === SmartAdServer ===
    try { safeAssign(window, 'SmartAdServerAjax', noopFn); safeAssign(window, 'sas', { cmd: [], call: noopFn, render: noopFn, setup: noopFn }); window.sas.cmd.push = noop; } catch (e) {}

    // === AppNexus ===
    try { safeAssign(window, 'apntag', { anq: [], loadTags: noopFn, showTag: noopFn }); window.apntag.anq.push = noop; } catch (e) {}

    // === Rubicon ===
    try { safeAssign(window, 'rubicontag', { cmd: [], run: noopFn }); window.rubicontag.cmd.push = noop; } catch (e) {}

    // === Media.net ===
    try { safeAssign(window, 'medianet', { cmd: [], versionId: '', crid: '', chnm: '' }); window.medianet.cmd.push = noop; } catch (e) {}

    // === OpenX ===
    try { safeAssign(window, 'OX_dfp_ads', []); safeAssign(window, 'OX_dfp_options', {}); safeAssign(window, 'OX_ads', []); window.OX_ads.push = noop; } catch (e) {}

    // === Ezoic ===
    try { safeAssign(window, 'ezstandalone', { define: function() { return { render: noopFn }; }, enabled: false }); } catch (e) {}

    // === Mediavine ===
    try { safeAssign(window, 'mediavine', { cmd: [] }); window.mediavine.cmd.push = noop; } catch (e) {}

    // === AdThrive ===
    try { safeAssign(window, 'adthrive', { cmd: [], host: '', conf: {} }); window.adthrive.cmd.push = noop; } catch (e) {}

    // === NitroPay ===
    try { safeAssign(window, 'nitroAds', { createAd: noopFn, addUserToken: noopFn }); } catch (e) {}

    // === Admiral ===
    try { safeAssign(window, 'admiral', noopFn); safeAssign(window, 'admiral', { d: [] }); if (window.admiral.d) window.admiral.d.push = noop; } catch (e) {}

    // === FingerprintJS ===
    try {
        safeAssign(window, 'FingerprintJS', {
            load: function() { return Promise.resolve({ get: function() { return Promise.resolve({ visitorId: 'blocked' }); } }); }
        });
    } catch (e) {}

    // === Fingerprint2 ===
    try { safeAssign(window, 'Fingerprint2', noopFn); window.Fingerprint2.get = function(cb) { if (cb) cb('blocked', []); }; } catch (e) {}

    // === ClientJS ===
    try { safeAssign(window, 'ClientJS', noopFn); window.ClientJS.prototype.getFingerprint = function() { return 'blocked'; }; } catch (e) {}

    // === Cloudflare Turnstile ===
    try { safeAssign(window, 'turnstile', { ready: function(cb) { if (cb) cb(); }, render: function() { return 'blocked'; }, reset: noopFn }); } catch (e) {}

    // === hCaptcha ===
    try { safeAssign(window, 'hcaptcha', { render: function() { return 'blocked'; }, execute: function() { return Promise.resolve('blocked'); }, reset: noopFn }); } catch (e) {}

    // === reCAPTCHA ===
    try { safeAssign(window, 'grecaptcha', { ready: function(cb) { if (cb) cb(); }, render: function() { return 'blocked'; }, execute: function() { return Promise.resolve('blocked'); }, reset: noopFn }); } catch (e) {}

    // === Cookiebot ===
    try { safeAssign(window, 'Cookiebot', { show: noopFn, hide: noopFn, consent: { stamp: 'blocked', necessary: true, preferences: false, statistics: false, marketing: false }, dialog: { visible: false } }); } catch (e) {}

    // === CookieYes ===
    try { safeAssign(window, 'cookieyes', {}); } catch (e) {}

    // === Usercentrics ===
    try { safeAssign(window, 'UC_UI', { showSecondLayer: noopFn, isInitialized: function() { return true; } }); } catch (e) {}

    // === Sourcepoint ===
    try { safeAssign(window, '_sp_', { config: { accountId: 0 }, loadPrivacyManagerModal: noopFn }); } catch (e) {}

    // === TCF API ===
    try { safeAssign(window, '__tcfapi', noopFn); } catch (e) {}
    try { safeAssign(window, '__gpp', noopFn); } catch (e) {}

    // === Topics API ===
    try { if ('browsingTopics' in Document.prototype) { Document.prototype.browsingTopics = noopPromiseArr; } } catch (e) {}

    // === FLoC ===
    try { if ('interestCohort' in Document.prototype) { Document.prototype.interestCohort = noopPromiseObj; } } catch (e) {}

    // === Attribution Reporting API ===
    try { if ('attributionReporting' in HTMLAnchorElement.prototype) { safeDefine(HTMLAnchorElement.prototype, 'attributionReporting', { get: function() { return {}; }, set: noopFn, configurable: true }); } } catch (e) {}

    // === Shared Storage API ===
    try {
        if ('sharedStorage' in window) {
            safeAssign(window, 'sharedStorage', {
                run: noopPromise, selectURL: function() { return Promise.resolve(0); },
                set: noopPromise, append: noopPromise, clear: noopPromise
            });
        }
    } catch (e) { console.warn('[AdBlockNitro] sharedStorage:', e.message); }

    // === Protected Audience API (FLEDGE) ===
    try {
        if ('joinAdInterestGroup' in navigator) { navigator.joinAdInterestGroup = noopPromise; }
        if ('leaveAdInterestGroup' in navigator) { navigator.leaveAdInterestGroup = noopPromise; }
        if ('runAdAuction' in navigator) { navigator.runAdAuction = noopPromiseNull; }
    } catch (e) {}

    // === Ad Topics API ===
    try { if ('getTopics' in Document.prototype) { Document.prototype.getTopics = noopPromiseArr; } } catch (e) {}

    console.log('[AdBlockNitro] Injected script active — All ad APIs neutralized');
})();
