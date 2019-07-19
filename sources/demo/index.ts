/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

import {
    Dictionary,
    IDictionaryEntry,
    Utilities
} from '@ordbok/core';
import {
    IFileIndex,
    Index
} from '@ordbok/index-plugin';

/* *
 *
 *  Constants
 *
 * */

/**
 * Meta key
 */
const META_KEY = Utilities.getKey('Meta');

/* *
 *
 *  Variables
 *
 * */

let searchInput: HTMLInputElement;
let resultOutput: HTMLTableElement;
let dictionary: Dictionary;
let index: Index;
let languageTitles: Record<string, string>;

/* *
 *
 *  Functions
 *
 * */

function find (): void {

    const searchKey = Utilities.getKey(searchInput.value);

    if (resultOutput) {
        resultOutput.innerHTML = '';
    }
    else {
        resultOutput = document.createElement('TABLE') as HTMLTableElement;
        resultOutput.setAttribute('border', '1');
        document.body.appendChild(resultOutput);
    }

    index
        .loadFileIndex('English')
        .then(function (fileIndex: IFileIndex) {

            const pageIndex: (number|undefined) = fileIndex[searchKey];

            if (typeof pageIndex === 'undefined') {
                return;
            }

            for (var i = 0, ie = pageIndex ; i <= ie ; ++i) {
                dictionary
                    .loadEntry(searchKey, i)
                    .then(show)
                    .catch(alert);
            }
        })
}

function show (entry?: IDictionaryEntry): void {

    if (!entry) {
        return;
    }

    showStructure(entry);

    Object
        .keys(entry)
        .filter(languageKey => languageKey !== META_KEY)
        .forEach(languageKey => showTranslations(
            languageKey,
            entry[languageKey].translation
        ));
}

function showStructure (entry: IDictionaryEntry): void {

    const tr = document.createElement('TR');

    resultOutput.appendChild(tr);

    let th = document.createElement('TH');

    tr.appendChild(th);

    th.innerText = 'Language';

    const structure = (entry[META_KEY] && entry[META_KEY].structure || ['']);

    structure.forEach(title => {

        th = document.createElement('TH');

        tr.appendChild(th);

        th.innerText = title;
    });
}

function showTranslations (languageKey: string, translations: Array<string>): void {

    const th = document.createElement('TH');
    const tr = document.createElement('TR');

    let td: HTMLElement;

    resultOutput.appendChild(tr);
    tr.appendChild(th);

    th.innerText = (languageTitles[languageKey] || languageKey);

    translations.forEach(translation => {

        td = document.createElement('TD');

        tr.appendChild(td);

        td.innerText = translation;
    });
}

export function start (): void {

    dictionary = new Dictionary('translations/');
    index = new Index('translations/');
    languageTitles = {};

    searchInput = document.getElementById('search') as HTMLInputElement;
    searchInput.addEventListener('change', find);

    index.loadHeadlines().then(languages => {
        languages
            .filter(language => language !== META_KEY)
            .forEach(language => {
                languageTitles[Utilities.getKey(language)] = language;
            });
    });
}
