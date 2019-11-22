(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.OrdbokDemo = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ordbok/core");
exports.TRANSLATION_SUBFOLDER = 'translations/';
exports.META_KEY = core_1.Utilities.getKey('Meta');

},{"@ordbok/core":6}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Results = require("./results");
var Search = require("./search");
function start() {
    try {
        Results.init();
        Search.init();
    }
    catch (error) {
        alert(error);
    }
}
exports.start = start;

},{"./results":3,"./search":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Config = require("./config");
var core_1 = require("@ordbok/core");
var index_plugin_1 = require("@ordbok/index-plugin");
var container;
var files;
var languages;
function clear() {
    container.innerHTML = '';
}
exports.clear = clear;
function init() {
    initContainer();
    initLanguages();
}
exports.init = init;
function initContainer() {
    var element = document.getElementById('results');
    if (!element) {
        throw new Error('Results container not found!');
    }
    container = element;
}
function initLanguages() {
    languages = {};
    files = new index_plugin_1.Index(Config.TRANSLATION_SUBFOLDER);
    files
        .loadHeadlines()
        .then(function (headlines) {
        headlines
            .filter(function (headline) {
            return headline !== Config.META_KEY;
        })
            .forEach(function (headline) {
            languages[core_1.Utilities.getKey(headline)] = headline;
        });
    })
        .catch(function (error) {
        console.error(error);
    });
}
function show(searchResult) {
    if (!searchResult) {
        return;
    }
    var table = document.createElement('TABLE');
    container.appendChild(table);
    showStructure(table, searchResult);
    Object
        .keys(searchResult)
        .filter(function (languageKey) {
        return (languageKey !== Config.META_KEY);
    })
        .forEach(function (languageKey) {
        showTranslation(table, searchResult, languageKey);
    });
}
exports.show = show;
function showStructure(table, searchResult) {
    var tr = document.createElement('TR');
    table.appendChild(tr);
    var th = document.createElement('TH');
    tr.appendChild(th);
    th.innerText = 'Language';
    var structure = (searchResult[Config.META_KEY] && searchResult[Config.META_KEY].structure || ['']);
    structure.forEach(function (title) {
        th = document.createElement('TH');
        tr.appendChild(th);
        th.innerText = title;
    });
}
function showTranslation(table, searchResult, languageKey) {
    var grammar = []
        .concat((searchResult[Config.META_KEY] && searchResult[Config.META_KEY].grammar), searchResult[languageKey].grammar)
        .filter(function (grammar) {
        return !!grammar;
    });
    var translation = searchResult[languageKey].translation;
    var tr = document.createElement('TR');
    table.appendChild(tr);
    var th = document.createElement('TH');
    tr.appendChild(th);
    if (grammar.length > 0) {
        tr.setAttribute('title', grammar.join(', '));
    }
    th.innerText = (languages[languageKey] || languageKey);
    var td;
    translation.forEach(function (translation) {
        td = document.createElement('TD');
        tr.appendChild(td);
        td.innerText = translation;
    });
}

},{"./config":1,"@ordbok/core":6,"@ordbok/index-plugin":13}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Config = require("./config");
var Results = require("./results");
var core_1 = require("@ordbok/core");
var index_plugin_1 = require("@ordbok/index-plugin");
var container;
var countdown;
var files;
var translations;
function onButton(evt) {
    var element = evt.target;
    if (!(element instanceof HTMLButtonElement) ||
        !(element.previousSibling instanceof HTMLInputElement)) {
        return;
    }
    search(element.previousSibling.value);
}
function onInput(evt) {
    var element = evt.target;
    if (!(element instanceof HTMLInputElement)) {
        return;
    }
    if (!element.value) {
        Results.clear();
    }
}
function onKeyUp(evt) {
    var element = evt.target;
    if (!(element instanceof HTMLInputElement)) {
        return;
    }
    search(element.value);
}
function init() {
    initTranslations();
    initFiles();
    initContainer();
}
exports.init = init;
function initContainer() {
    var element = document.getElementById('search');
    if (!element) {
        throw new Error('Search container not found!');
    }
    container = element;
    initContainerButton();
    initContainerInput();
}
function initContainerButton() {
    var element = container.getElementsByTagName('button')[0];
    if (!element) {
        throw new Error('Search button not found!');
    }
    element.addEventListener('click', onButton);
}
function initContainerInput() {
    var element = container.getElementsByTagName('input')[0];
    if (!element) {
        throw new Error('Search input not found!');
    }
    element.addEventListener('change', onInput);
    element.addEventListener('click', onInput);
    element.addEventListener('keyup', onKeyUp);
    element.focus();
}
function initFiles() {
    files = new index_plugin_1.Index(Config.TRANSLATION_SUBFOLDER);
}
function initTranslations() {
    translations = new core_1.Dictionary(Config.TRANSLATION_SUBFOLDER);
}
function search(query) {
    if (countdown) {
        window.clearTimeout(countdown);
    }
    countdown = window.setTimeout(searchIndex, 500, query);
}
function searchIndex(query) {
    var searchKey = core_1.Utilities.getKey(query);
    if (translations.hasOpenRequest()) {
        return;
    }
    Results.clear();
    files
        .loadFileIndex('English')
        .then(function (fileIndex) {
        var maxPageIndex = fileIndex[searchKey];
        if (typeof maxPageIndex === 'undefined') {
            return;
        }
        searchTranslations(query, maxPageIndex);
    });
}
function searchTranslations(query, lastPageIndex) {
    var searchKey = core_1.Utilities.getKey(query);
    for (var pageIndex = 0; pageIndex <= lastPageIndex; ++pageIndex) {
        translations
            .loadEntry(searchKey, pageIndex)
            .then(Results.show)
            .catch(alert);
    }
}

},{"./config":1,"./results":3,"@ordbok/core":6,"@ordbok/index-plugin":13}],5:[function(require,module,exports){
"use strict";
/*!---------------------------------------------------------------------------*/
/*! Copyright (c) ORDBOK contributors. All rights reserved.                   */
/*! Licensed under the MIT License. See the LICENSE file in the project root. */
/*!---------------------------------------------------------------------------*/
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./demo/index"));

},{"./demo/index":2}],6:[function(require,module,exports){
"use strict";
/*!---------------------------------------------------------------------------*/
/*! Copyright (c) ORDBOK contributors. All rights reserved.                   */
/*! Licensed under the MIT License. See the LICENSE file in the project root. */
/*!---------------------------------------------------------------------------*/
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./lib"));

},{"./lib":9}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ajax = (function () {
    function Ajax(baseUrl, cacheTimeout, responseTimeout) {
        if (baseUrl === void 0) { baseUrl = ''; }
        if (cacheTimeout === void 0) { cacheTimeout = 3600000; }
        if (responseTimeout === void 0) { responseTimeout = 60000; }
        this._cache = {};
        this._requests = 0;
        this.baseUrl = baseUrl;
        this.cacheTimeout = (cacheTimeout < 0 ? 0 : cacheTimeout);
        this.responseTimeout = (responseTimeout < 0 ? 0 : responseTimeout);
    }
    Ajax.prototype.onError = function (progressEvent) {
        var context = this.context;
        if (!context) {
            return;
        }
        var error = new Error('error');
        error.result = this.response.toString();
        error.serverStatus = this.status;
        error.timestamp = progressEvent.timeStamp;
        error.url = context.url;
        if (context.isCountingRequest) {
            context.isCountingRequest = false;
            context.ajax._requests--;
        }
        context.reject(error);
    };
    Ajax.prototype.onLoad = function (progressEvent) {
        var context = this.context;
        if (!context) {
            return;
        }
        if (context.isCountingRequest) {
            context.isCountingRequest = false;
            context.ajax._requests--;
        }
        context.resolve({
            result: (this.response || '').toString(),
            serverStatus: this.status,
            timestamp: progressEvent.timeStamp,
            url: context.url
        });
    };
    Ajax.prototype.onTimeout = function (progressEvent) {
        var context = this.context;
        if (!context) {
            return;
        }
        var error = new Error('timeout');
        error.result = this.response.toString();
        error.serverStatus = this.status;
        error.timestamp = progressEvent.timeStamp;
        error.url = context.url;
        if (context.isCountingRequest) {
            context.isCountingRequest = false;
            context.ajax._requests--;
        }
        context.reject(error);
    };
    Ajax.prototype.hasOpenRequest = function () {
        if (this._requests < 0) {
            this._requests = 0;
        }
        return (this._requests > 0);
    };
    Ajax.prototype.request = function (urlPath) {
        var ajax = this;
        return new Promise(function (resolve, reject) {
            var url = ajax.baseUrl + urlPath;
            var context = { ajax: ajax, resolve: resolve, reject: reject, url: url };
            if (ajax.cacheTimeout > 0) {
                var cachedResult = ajax._cache[url];
                var cacheTimeout = (new Date()).getTime() + ajax.cacheTimeout;
                if (cachedResult &&
                    cachedResult.timestamp > cacheTimeout) {
                    resolve(cachedResult);
                    return;
                }
                delete ajax._cache[url];
            }
            var server = new XMLHttpRequest();
            server.context = context;
            context.isCountingRequest = false;
            try {
                if (ajax.cacheTimeout <= 0 &&
                    url.indexOf('?') === -1) {
                    server.open('GET', (url + '?' + (new Date()).getTime()), true);
                }
                else {
                    server.open('GET', url, true);
                }
                ajax._requests++;
                context.isCountingRequest = true;
                server.timeout = ajax.responseTimeout;
                server.addEventListener('load', ajax.onLoad);
                server.addEventListener('error', ajax.onError);
                server.addEventListener('timeout', ajax.onTimeout);
                server.send();
            }
            catch (catchedError) {
                var error = catchedError;
                error.result = (server.response || '');
                error.timestamp = (new Date()).getTime();
                error.serverStatus = server.status;
                error.url = context.url;
                if (context.isCountingRequest) {
                    context.isCountingRequest = false;
                    context.ajax._requests--;
                }
                reject(error);
            }
        });
    };
    return Ajax;
}());
exports.Ajax = Ajax;

},{}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ajax_1 = require("./ajax");
var utilities_1 = require("./utilities");
var Dictionary = (function (_super) {
    __extends(Dictionary, _super);
    function Dictionary() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Dictionary.parse = function (stringified) {
        var dictionaryPage = {};
        var categorySplit;
        var dictionarySection;
        stringified
            .split(Dictionary.LINE_SEPARATOR)
            .forEach(function (line) {
            if (line.indexOf(Dictionary.PAIR_SEPARATOR) === -1) {
                dictionaryPage[line] = dictionarySection = {};
                return;
            }
            if (!dictionarySection) {
                return;
            }
            categorySplit = line.split(Dictionary.PAIR_SEPARATOR, 2);
            dictionarySection[categorySplit[0]] = (categorySplit[1].split(Dictionary.VALUE_SEPARATOR));
        });
        return dictionaryPage;
    };
    Dictionary.stringify = function (markdownPage) {
        var stringified = [];
        var markdownSection;
        Object
            .keys(markdownPage)
            .forEach(function (headline) {
            stringified.push(utilities_1.Utilities.getKey(headline));
            markdownSection = markdownPage[headline];
            Object
                .keys(markdownSection)
                .forEach(function (category) {
                return stringified.push(utilities_1.Utilities.getKey(category) +
                    Dictionary.PAIR_SEPARATOR +
                    markdownSection[category].join(Dictionary.VALUE_SEPARATOR));
            });
        });
        return stringified.join(Dictionary.LINE_SEPARATOR);
    };
    Dictionary.prototype.loadEntry = function (baseName, pageIndex) {
        if (pageIndex === void 0) { pageIndex = 0; }
        return this
            .request(utilities_1.Utilities.getKey(baseName) +
            Dictionary.FILE_SEPARATOR +
            pageIndex +
            Dictionary.FILE_EXTENSION)
            .then(function (response) {
            if (response instanceof Error ||
                response.serverStatus >= 400) {
                return;
            }
            return Dictionary.parse(response.result);
        })
            .catch(function (error) {
            console.error(error);
            return;
        });
    };
    Dictionary.FILE_EXTENSION = '.txt';
    Dictionary.FILE_SEPARATOR = '-';
    Dictionary.LINE_SEPARATOR = '\n';
    Dictionary.PAIR_SEPARATOR = ':';
    Dictionary.VALUE_SEPARATOR = ';';
    return Dictionary;
}(ajax_1.Ajax));
exports.Dictionary = Dictionary;

},{"./ajax":7,"./utilities":12}],9:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./ajax"));
__export(require("./dictionary"));
__export(require("./markdown"));
__export(require("./str"));
__export(require("./utilities"));

},{"./ajax":7,"./dictionary":8,"./markdown":10,"./str":11,"./utilities":12}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var str_1 = require("./str");
var HEADLINE_REGEXP = /^(?:#+([\s\S]*)|([\s\S]*?)\n(?:={3,}|-{3,}))$/;
var PAIR_REGEXP = /^([^\:\n\r\t\v]+):([\s\S]*)$/;
var PAGE_REGEXP = /(?:^\n?|\n\n)-{3,}(?:\n\n|\n?$)/;
var PARAGRAPH_REGEXP = /\n{2,}/;
var Markdown = (function () {
    function Markdown(markdown) {
        this._pages = [];
        this._raw = markdown;
        this.parse(markdown);
    }
    Markdown.parsePage = function (markdownPage) {
        var page = {};
        var match;
        var section;
        markdownPage
            .split(PARAGRAPH_REGEXP)
            .forEach(function (paragraph) {
            match = HEADLINE_REGEXP.exec(paragraph);
            if (match) {
                page[str_1.Str.trimSpaces(match[1] || match[2])] = section = {};
            }
            if (!section) {
                return;
            }
            match = PAIR_REGEXP.exec(paragraph);
            if (match) {
                section[match[1]] = match[2]
                    .split(';')
                    .map(str_1.Str.trimSpaces);
            }
        });
        return page;
    };
    Object.defineProperty(Markdown.prototype, "pages", {
        get: function () {
            return this._pages;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Markdown.prototype, "raw", {
        get: function () {
            return this._raw;
        },
        enumerable: true,
        configurable: true
    });
    Markdown.prototype.parse = function (markdown) {
        var pages = this._pages;
        markdown
            .split(PAGE_REGEXP)
            .forEach(function (page) { return pages.push(Markdown.parsePage(page)); });
    };
    return Markdown;
}());
exports.Markdown = Markdown;

},{"./str":11}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BRACKET_REGEXP = /\([^\)]*\)|\[[^\]]*\]|\{[^\}]*\}/g;
var SPACE_REGEXP = /\s+/g;
var Str = (function (_super) {
    __extends(Str, _super);
    function Str(str) {
        return _super.call(this, str) || this;
    }
    Str.endsWith = function (str, pattern) {
        if (str === pattern) {
            return true;
        }
        var strLength = str.length;
        var patternLength = pattern.length;
        return (patternLength <= strLength &&
            str.lastIndexOf(pattern) === strLength - patternLength);
    };
    Str.removeBrackets = function (str) {
        return str.replace(BRACKET_REGEXP, '').replace(SPACE_REGEXP, ' ').trim();
    };
    Str.trimSpaces = function (str) {
        return str.replace(SPACE_REGEXP, ' ').trim();
    };
    Str.prototype.endsWith = function (pattern) {
        return Str.endsWith(this.toString(), pattern);
    };
    Str.prototype.removeBrackets = function () {
        return new Str(Str.removeBrackets(this.toString()));
    };
    Str.prototype.trimSpaces = function () {
        return new Str(Str.trimSpaces(this.toString()));
    };
    return Str;
}(String));
exports.Str = Str;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NON_CHARACTER_REGEXP = /[^0-9A-Za-z\u0080-\uFFFF -]/g;
var PATH_REGEXP = /^(.*?)([^\.\/]*)([^\/]*)$/;
var SPACE_REGEXP = /\s+/g;
var Utilities;
(function (Utilities) {
    function getExtension(filePath) {
        var match = PATH_REGEXP.exec(filePath);
        return (match && match[3] || '');
    }
    Utilities.getExtension = getExtension;
    function getBaseName(filePath) {
        var match = PATH_REGEXP.exec(filePath);
        return (match && match[2] || '');
    }
    Utilities.getBaseName = getBaseName;
    function getKey(text) {
        return text
            .replace(NON_CHARACTER_REGEXP, ' ')
            .trim()
            .replace(SPACE_REGEXP, '-')
            .toLowerCase();
    }
    Utilities.getKey = getKey;
    function getNorm(text) {
        return text
            .replace(NON_CHARACTER_REGEXP, ' ')
            .trim()
            .replace(SPACE_REGEXP, ' ')
            .toLowerCase();
    }
    Utilities.getNorm = getNorm;
    function getParentPath(path) {
        var match = PATH_REGEXP.exec(path);
        return (match && match[1] || '');
    }
    Utilities.getParentPath = getParentPath;
    function rotate(text) {
        var isDecode = text.indexOf('base64,') === 0;
        if (isDecode) {
            text = atob(text.substr(7));
        }
        var result = [];
        for (var charCode = 0, index = 0, indexEnd = text.length; index < indexEnd; ++index) {
            charCode = text.charCodeAt(index);
            charCode += (charCode < 128 ? 128 : -128);
            result.push(String.fromCharCode(charCode));
        }
        text = result.join('');
        if (!isDecode) {
            text = 'base64,' + btoa(text);
        }
        return text;
    }
    Utilities.rotate = rotate;
    function splat(obj) {
        if (obj instanceof Array) {
            return obj
                .reduce(function (result, value) {
                if (value && typeof value === 'object') {
                    result.push.apply(result, splat(value));
                }
                else {
                    result.push(value);
                }
                return result;
            }, []);
        }
        else {
            return splat(Object.values(obj));
        }
    }
    Utilities.splat = splat;
})(Utilities = exports.Utilities || (exports.Utilities = {}));

},{}],13:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"./lib":14,"dup":6}],14:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ordbok/core");
var Index = (function (_super) {
    __extends(Index, _super);
    function Index(baseUrl, cacheTimeout, responseTimeout) {
        if (baseUrl === void 0) { baseUrl = ''; }
        return _super.call(this, (baseUrl + Index.SUBFOLDER), cacheTimeout, responseTimeout) || this;
    }
    Index.parse = function (stringified) {
        var fileIndex = {};
        var pair;
        stringified
            .split(core_1.Dictionary.LINE_SEPARATOR)
            .forEach(function (line) {
            if (line.indexOf(core_1.Dictionary.PAIR_SEPARATOR) === -1) {
                return;
            }
            pair = line.split(core_1.Dictionary.PAIR_SEPARATOR);
            if (pair.length < 2) {
                return;
            }
            fileIndex[pair[0]] = parseInt(pair[1]);
        });
        return fileIndex;
    };
    Index.stringify = function (fileIndex) {
        return Object
            .keys(fileIndex)
            .map(function (fileTarget) {
            return core_1.Utilities.getKey(fileTarget) +
                core_1.Dictionary.PAIR_SEPARATOR +
                fileIndex[fileTarget];
        })
            .join(core_1.Dictionary.LINE_SEPARATOR);
    };
    Index.stringifyHeadlines = function (headlines) {
        return headlines.join(core_1.Dictionary.LINE_SEPARATOR);
    };
    Index.prototype.loadHeadlines = function () {
        return this
            .request('index' + core_1.Dictionary.FILE_EXTENSION)
            .then(function (response) {
            if (response instanceof Error ||
                response.serverStatus >= 400) {
                throw new Error('HTTP ' + response.serverStatus);
            }
            return response.result.split(core_1.Dictionary.LINE_SEPARATOR);
        });
    };
    Index.prototype.loadFileIndex = function (headline) {
        return this
            .request(core_1.Utilities.getKey(headline) + core_1.Dictionary.FILE_EXTENSION)
            .then(function (response) {
            if (response instanceof Error ||
                response.serverStatus >= 400) {
                return {};
            }
            return Index.parse(response.result);
        })
            .catch(function (error) {
            console.error(error);
            return {};
        });
    };
    Index.SUBFOLDER = 'index/';
    return Index;
}(core_1.Ajax));
exports.Index = Index;

},{"@ordbok/core":6}]},{},[5])(5)
});
