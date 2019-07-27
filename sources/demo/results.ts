/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

import * as Config from './config';
import {
    IDictionaryEntry,
    Utilities
} from '@ordbok/core';
import {
    Index
} from '@ordbok/index-plugin';

/* *
 *
 *  Variables
 *
 * */

/**
 * Results container
 */
let container: HTMLElement;

/**
 * Files index
 */
let files: Index;

/**
 * Dictionary of language keys and language names
 */
let languages: Record<string, string>;

/* *
 *
 *  Functions
 *
 * */

/**
 * Clears visible results
 */
function clear (): void {

    container.innerHTML = '';
}

/**
 * Initialize results management.
 */
function init (): void {

    initContainer();
    initLanguages();
}

/**
 * Initializes user interface.
 */
function initContainer (): void {

    const element = document.getElementById('results');

    if (!element) {
        throw new Error('Results container not found!');
    }

    container = element;
}

/**
 * Initializes language index.
 */
function initLanguages (): void {

    languages = {};

    files = new Index(Config.TRANSLATION_SUBFOLDER);

    files
        .loadHeadlines()
        .then(function (headlines: Array<string>): void {

            headlines
                .filter(function (headline: string): boolean {

                    return headline !== Config.META_KEY;
                })
                .forEach(function (headline: string): void {

                    languages[Utilities.getKey(headline)] = headline;
                });
        })
        .catch(function (error?: Error): void {

            console.error(error);
        });
}

/**
 * Shows a search result.
 *
 * @param searchResult
 *        Search result
 */
function show (searchResult: (IDictionaryEntry|undefined)): void {

    if (!searchResult) {
        return;
    }

    const table = document.createElement('TABLE') as HTMLTableElement;

    container.appendChild(table);

    showStructure(table, searchResult);

    Object
        .keys(searchResult)
        .filter(function (languageKey: string): boolean {

            return (languageKey !== Config.META_KEY);
        })
        .forEach(function (languageKey: string): void {

            showTranslation(table, searchResult, languageKey)
        });
}

/**
 * Adds a header to a result table.
 *
 * @param table
 *        Result table
 *
 * @param searchResult
 *        Search result
 */
function showStructure (table: HTMLTableElement, searchResult: IDictionaryEntry): void {

    const tr = document.createElement('TR');

    table.appendChild(tr);

    let th = document.createElement('TH');

    tr.appendChild(th);

    th.innerText = 'Language';

    const structure = (searchResult[Config.META_KEY] && searchResult[Config.META_KEY].structure || ['']);

    structure.forEach(title => {

        th = document.createElement('TH');

        tr.appendChild(th);

        th.innerText = title;
    });
}

/**
 * Adds a translation to a result table.
 *
 * @param table
 *        Result table
 *
 * @param searchResult
 *        Search result
 *
 * @param languageKey
 *        Language key of translation
 */
function showTranslation (
    table: HTMLTableElement,
    searchResult: IDictionaryEntry,
    languageKey: string
): void {

    const grammar = ([] as Array<string>)
        .concat(
            (searchResult[Config.META_KEY] && searchResult[Config.META_KEY].grammar),
            searchResult[languageKey].grammar
        )
        .filter(function (grammar: (string|undefined)): boolean {
            return !!grammar;
        });

    const translation = searchResult[languageKey].translation;

    const tr = document.createElement('TR');

    table.appendChild(tr);

    const th = document.createElement('TH');

    tr.appendChild(th);

    if (grammar.length > 0) {
        tr.setAttribute('title', grammar.join(', '));
    }

    th.innerText = (languages[languageKey] || languageKey);

    let td: HTMLElement;

    translation.forEach(function (translation: string): void {

        td = document.createElement('TD');

        tr.appendChild(td);

        td.innerText = translation;
    });
}

/* *
 *
 *  Exports
 *
 * */

export {
    clear,
    init,
    show
}
