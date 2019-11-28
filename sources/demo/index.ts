/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

import * as Results from './results';
import * as Search from './search';

/* *
 *
 *  Functions
 *
 * */

export function start (): void {

    try {

        Results.init();
        Search.init();
    }
    catch (error) {

        alert(error);
    }
}
