/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

import {
    Dictionary,
    Utilities
} from '@ordbok/core';
import {
    IFileIndex,
    Index
} from '@ordbok/index-plugin';
import * as Config from './config';
import * as Results from './results';

/* *
 *
 *  Variables
 *
 * */

/**
 * Search container
 */
let container: HTMLElement;

/**
 * File index
 */
let files: Index;

/**
 * Translation dictionary
 */
let translations: Dictionary;

/* *
 *
 *  Functions
 *
 * */

function init (): void {

    initTranslations();
    initFiles();
    initContainer();
}

function initContainer (): void {

    const element = document.getElementById('search');

    if (!element) {
        throw new Error('Search container not found!');
    }

    container = element;

    initContainerButton();
    initContainerInput();
}

function initContainerButton (): void {

    const element = container.getElementsByTagName('button')[0];

    if (!element) {
        throw new Error('Search button not found!');
    }

    element.addEventListener('click', onButtonClick)
}

function initContainerInput (): void {

    const element = container.getElementsByTagName('input')[0];

    if (!element) {
        throw new Error('Search input not found!');
    }

    element.addEventListener('change', onInputChange);
    element.addEventListener('keyup', onKeyUp);
}

function initFiles (): void {

    files = new Index(Config.BASE_URL);
}

function initTranslations (): void {

    translations = new Dictionary(Config.BASE_URL);
}

function onButtonClick (e: MouseEvent): void {

    const element = e.target;

    if (!(element instanceof HTMLButtonElement) ||
        !(element.previousSibling instanceof HTMLInputElement)
    ) {
        return;
    }

    searchIndex(element.previousSibling.value);
}

function onInputChange (e: Event): void {

    const element = e.target;

    if (!(element instanceof HTMLInputElement)) {
        return;
    }

    searchIndex(element.value);
}

function onKeyUp (e: KeyboardEvent): void {

    const element = e.target;

    if (!(element instanceof HTMLInputElement)) {
        return;
    }

    searchIndex(element.value);
}

function searchIndex (query: string): void {

    const searchKey = Utilities.getKey(query);

    Results.clear();

    files
        .loadFileIndex('English')
        .then(function (fileIndex: IFileIndex): void {

            const maxPageIndex: (number|undefined) = fileIndex[searchKey];

            if (typeof maxPageIndex === 'undefined') {
                return;
            }

            searchTranslations(query, maxPageIndex);
        });
}

function searchTranslations (query: string, maxPageIndex: number): void {

    const searchKey = Utilities.getKey(query);

    for (let pageIndex = 0; pageIndex <= maxPageIndex ; ++pageIndex) {

        translations
            .loadEntry(searchKey, pageIndex)
            .then(Results.show)
            .catch(alert);
    }
}

/* *
 *
 *  Exports
 *
 * */

export {
    init
}
