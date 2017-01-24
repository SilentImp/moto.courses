'use strict';

import { transliterate as tr, slugify } from 'transliteration';
const translit = require('translitit-cyrillic-russian-to-latin');
const cyrillicPatternOne = /[\u0400-\u04FF]/;
const cyrillicPatternTwo = /[а-яА-ЯЁёҐїЇіІєЄ]/;

/**
 * @class Class to get variations of name
 */
export default class Translit {

    /**
     * @constructor
     * @param names {Array} array of names
     * @returns {Array} array of names with variations
     */
    constructor (names) {

        if (!Array.isArray(names) && (typeof names == "string")) {
            names = new Array(names);
        }

        let name_list = [],
            index = names.length;

        while (index--) {
            if (cyrillicPatternOne.test(names[index])) {
                name_list.push(names[index]);
                name_list.push(tr(names[index]));
                name_list.push(translit(names[index]));
            } else {
                name_list.push(names[index]);
            }
        }

        return name_list.filter(function(item, pos) {
            return name_list.indexOf(item) == pos;
        });

    }
}