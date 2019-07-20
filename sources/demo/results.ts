/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

import {
    IDictionaryEntry,
    Utilities
} from '@ordbok/core';
import {
    IFileIndex,
    Index
} from '@ordbok/index-plugin';
import * as Config from './config';

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

function clear (): void {

    container.innerHTML = '';
}

function init (): void {

    initContainer();
    initLanguages();
}

function initContainer (): void {

    const element = document.getElementById('results');

    if (!element) {
        throw new Error('Results container not found!');
    }

    container = element;
}

function initLanguages (): void {

    languages = {};

    files = new Index(Config.BASE_URL);

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

function show (result: IDictionaryEntry): void {

    const table = document.createElement('TABLE') as HTMLTableElement;

    container.appendChild(table);

    showStructure(table, result);

    Object
        .keys(result)
        .filter(languageKey => languageKey !== Config.META_KEY)
        .forEach(languageKey => showTranslation(
            table,
            languageKey,
            result[languageKey].translation,
            ([] as Array<string>)
                .concat(
                    (result[Config.META_KEY] && result[Config.META_KEY].grammar),
                    result[languageKey].grammar
                )
                .filter(function (grammar: (string|undefined)): boolean {
                    return !!grammar;
                })
        ));
}

function showStructure (table: HTMLTableElement, entry: IDictionaryEntry): void {

    const tr = document.createElement('TR');

    table.appendChild(tr);

    let th = document.createElement('TH');

    tr.appendChild(th);

    th.innerText = 'Language';

    const structure = (entry[Config.META_KEY] && entry[Config.META_KEY].structure || ['']);

    structure.forEach(title => {

        th = document.createElement('TH');

        tr.appendChild(th);

        th.innerText = title;
    });
}

function showTranslation (
    table: HTMLTableElement,
    languageKey: string,
    translation: Array<string>,
    grammar: Array<string>
): void {

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
