/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

import { Dictionary, IDictionaryEntry, Utilities } from '@ordbok/core';

/* *
 *
 *  Constants
 *
 * */

const DEFAULTS_KEY = Utilities.getKey('Defaults');
const ENGLISH_KEY = Utilities.getKey('English');

/* *
 *
 *  Variables
 *
 * */

let searchInput: HTMLInputElement;
let resultOutput: HTMLTableElement;
let dictionary: Dictionary;

/* *
 *
 *  Functions
 *
 * */

function find (): void {

    dictionary
        .loadEntry(Utilities.getKey(searchInput.value) + '-0')
        .then(show)
        .catch(alert);
}

function show (entry?: IDictionaryEntry): void {

    if (!entry) {
        return;
    }

    resultOutput.innerHTML = '';

    showStructure(entry[DEFAULTS_KEY].structure);

    Object
        .keys(entry)
        .filter(languageKey => languageKey !== 'defaults')
        .forEach(languageKey => {

            let language = languageKey;

            dictionary
                .loadEntry(languageKey + '-0')
                .then(keyEntry => {

                    if (keyEntry) {
                        language = keyEntry[ENGLISH_KEY].translation[0];
                    }

                    showTranslations(language, entry[languageKey].translation)
                });
        });
}

function showStructure (structure: Array<string>): void {

    const tr = document.createElement('TR');

    let th = document.createElement('TH');

    resultOutput.appendChild(tr);
    tr.appendChild(th);

    th.innerText = 'Language';

    structure.forEach(title => {

        th = document.createElement('TH');

        tr.appendChild(th);

        th.innerText = title;
    });
}

function showTranslations (language: string, translations: Array<string>): void {

    const th = document.createElement('TH');
    const tr = document.createElement('TR');

    let td: HTMLElement;

    resultOutput.appendChild(tr);
    tr.appendChild(th);

    th.innerText = language;

    translations.forEach(translation => {

        td = document.createElement('TD');

        tr.appendChild(td);

        td.innerText = translation;
    });
}

export function start (): void {

    dictionary = new Dictionary('translations/');

    searchInput = document.getElementById('search') as HTMLInputElement;
    searchInput.addEventListener('change', find);

    resultOutput = document.createElement('TABLE') as HTMLTableElement;
    resultOutput.setAttribute('border', '1');
    document.body.appendChild(resultOutput);
}
