/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

import { Dictionary, Utilities } from '@ordbok/core';

/* *
 *
 *  Variables
 *
 * */

let translations: Dictionary;

let searchInput: HTMLInputElement;

/* *
 *
 *  Functions
 *
 * */

function find () {

    translations
        .loadEntry(Utilities.getKey(searchInput.value) + '-0')
        .then(markdownPage => {

            if (!markdownPage) {
                return;
            }

            alert(markdownPage[Utilities.getKey('New Norwegian')].words);
        })
        .catch(alert);
}

export function start () {

    translations = new Dictionary('translations/');

    searchInput = document.getElementById('search') as HTMLInputElement;
    searchInput.addEventListener('change', find)
}
