/**
 * @license MIT
 * @author Sophie Bremer
 */

import { Dictionary } from '@ordbok/core';

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

    const theEntry = translations.loadEntry(searchInput.value);

    alert(theEntry.getSection('Norwegian').word); // = engelsk
}

export function start () {

    translations = new Dictionary('translations');

    searchInput = document.getElementById('search') as HTMLInputElement;
    searchInput.addEventListener('change', find)
}
