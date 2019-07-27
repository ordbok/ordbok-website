/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

import * as Config from './config';
import * as Results from './results';
import {
    Dictionary,
    Utilities
} from '@ordbok/core';
import {
    IFileIndex,
    Index
} from '@ordbok/index-plugin';

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
 * Search countdown
 */
let countdown: number;

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
 *  Events
 *
 * */

/**
 * Handles button interaction.
 *
 * @param evt
 *        Event.
 */
function onButton (evt: Event): void {

    const element = evt.target;

    if (!(element instanceof HTMLButtonElement) ||
        !(element.previousSibling instanceof HTMLInputElement)
    ) {
        return;
    }

    search(element.previousSibling.value);
}

/**
 * Handles input interaction.
 *
 * @param evt
 *        Event.
 */
function onInput (evt: Event): void {

    const element = evt.target;

    if (!(element instanceof HTMLInputElement)) {
        return;
    }

    if (!element.value) {
        Results.clear();
    }
}

/**
 * Handles keyboard event.
 *
 * @param evt
 *        Keyboard event.
 */
function onKeyUp (evt: KeyboardEvent): void {

    const element = evt.target;

    if (!(element instanceof HTMLInputElement)) {
        return;
    }

    search(element.value);
}

/* *
 *
 *  Functions
 *
 * */

/**
 * Initializes search functionality.
 */
function init (): void {

    initTranslations();
    initFiles();
    initContainer();
}

/**
 * Initializes user interface.
 */
function initContainer (): void {

    const element = document.getElementById('search');

    if (!element) {
        throw new Error('Search container not found!');
    }

    container = element;

    initContainerButton();
    initContainerInput();
}

/**
 * Initializes search button.
 */
function initContainerButton (): void {

    const element = container.getElementsByTagName('button')[0];

    if (!element) {
        throw new Error('Search button not found!');
    }

    element.addEventListener('click', onButton)
}

/**
 * Initializes search input field.
 */
function initContainerInput (): void {

    const element = container.getElementsByTagName('input')[0];

    if (!element) {
        throw new Error('Search input not found!');
    }

    element.addEventListener('change', onInput);
    element.addEventListener('click', onInput);
    element.addEventListener('keyup', onKeyUp);
}

/**
 * Initializes file index.
 */
function initFiles (): void {

    files = new Index(Config.TRANSLATION_SUBFOLDER);
}

/**
 * Initializes translations dictionary.
 */
function initTranslations (): void {

    translations = new Dictionary(Config.TRANSLATION_SUBFOLDER);
}

/**
 * Starts search after a countdown of 500ms.
 *
 * @param query
 *        Search query
 */
function search (query: string): void {

    if (countdown) {
        window.clearTimeout(countdown);
    }

    countdown = window.setTimeout(searchIndex, 500, query);
}

/**
 * Search in the file index for a query match.
 *
 * @param query
 *        Search query
 */
function searchIndex (query: string): void {

    const searchKey = Utilities.getKey(query);

    if (translations.hasOpenRequest()) {
        return;
    }

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

/**
 * Collects translation details for result output.
 *
 * @param query
 *        Search query
 *
 * @param lastPageIndex
 *        Last page index to collect
 */
function searchTranslations (query: string, lastPageIndex: number): void {

    const searchKey = Utilities.getKey(query);

    for (let pageIndex = 0; pageIndex <= lastPageIndex ; ++pageIndex) {

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
