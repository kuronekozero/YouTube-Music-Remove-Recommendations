// ==UserScript==
// @name         YouTube Music - Remove Home Recommendations
// @namespace    https://music.youtube.com/
// @version      4.0.0
// @description  Removes YouTube Music homepage recommendations and the large recommendation background image.
// @match        https://music.youtube.com/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    // The recommendation section from YouTube Music.
    const RECOMMENDATION_SECTION =
        '#content-wrapper > ytmusic-section-list-renderer';

    // The large background recommendation image.
    const BACKGROUND_RECOMMENDATION =
        'ytmusic-browse-response > #background > ytmusic-fullbleed-thumbnail-renderer';

    // Fallback: remove the picture inside the fullbleed thumbnail too.
    const BACKGROUND_PICTURE =
        'ytmusic-fullbleed-thumbnail-renderer picture.ytmusic-fullbleed-thumbnail-renderer';

    function isHomePage() {
        return (
            location.pathname === '/' ||
            location.pathname === '/home'
        );
    }

    function removeRecommendations() {
        if (!isHomePage()) {
            return;
        }

        // Remove the complete recommendations section.
        document
            .querySelectorAll(RECOMMENDATION_SECTION)
            .forEach((element) => {
                element.remove();
            });

        // Remove the large background recommendation image.
        document
            .querySelectorAll(BACKGROUND_RECOMMENDATION)
            .forEach((element) => {
                element.remove();
            });

        // Fallback: remove the picture directly too.
        document
            .querySelectorAll(BACKGROUND_PICTURE)
            .forEach((element) => {
                element.remove();
            });
    }

    // Hide the elements immediately so they do not flash while loading.
    const style = document.createElement('style');

    style.textContent = `
        ${RECOMMENDATION_SECTION},
        ${BACKGROUND_RECOMMENDATION},
        ${BACKGROUND_PICTURE} {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    `;

    (document.head || document.documentElement).appendChild(style);

    // YouTube Music dynamically rebuilds its DOM, so watch for changes.
    const observer = new MutationObserver(() => {
        removeRecommendations();
    });

    function startObserver() {
        if (!document.documentElement) {
            return;
        }

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        removeRecommendations();
    }

    if (document.documentElement) {
        startObserver();
    } else {
        const startupObserver = new MutationObserver(() => {
            if (document.documentElement) {
                startupObserver.disconnect();
                startObserver();
            }
        });

        startupObserver.observe(document, {
            childList: true,
            subtree: true
        });
    }

    // YouTube Music SPA navigation.
    [
        'yt-navigate-start',
        'yt-navigate-finish',
        'yt-page-data-updated',
        'yt-page-type-changed'
    ].forEach((eventName) => {
        window.addEventListener(
            eventName,
            removeRecommendations,
            true
        );
    });

    window.addEventListener('popstate', removeRecommendations, true);
    window.addEventListener('hashchange', removeRecommendations, true);

    // Extra fallback for delayed/lazy-loaded elements.
    setInterval(() => {
        removeRecommendations();
    }, 500);
})();
