/**
 * @fileoverview Speller rule
 * @author Łukasz Cichorek
 */
"use strict";

const nspell = require("nspell");
const { readFileSync } = require("fs");
const getWords = require("lodash.words");
const defaultDictName = "dictionary-en-us";
var spells = null;

module.exports = {
  meta: {
    docs: {
      description: "Speller Description",
      category: "Fill me in",
      recommended: false
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          literals: {
            type: "boolean",
            default: true
          },
          identifiers: {
            type: "boolean",
            default: true
          },
          comments: {
            type: "boolean",
            default: true
          },
          dictionary: {
            type: ["string", "array"],
            default: "dictionary-en-us"
          },
          customDictionary: {
            type: "array",
            default: null
          }
        }
      }
    ],
    type: "suggestion"
  },

  create: function(context) {
    const options = context.options[0];
    var verifyLiterals = true;
    var verifyIdentifiers = true;
    var verifyComments = true;
    var customDictionary = null;
    var dictionaries = null;

    if (options) {
      verifyLiterals = !options.literals == false;
      verifyIdentifiers = !options.identifiers == false;
      verifyComments = !options.comments == false;
      if (options.customDictionary && Array.isArray(options.customDictionary)) {
        customDictionary = options.customDictionary;
      }
      if (options.dictionary) {
        if (Array.isArray(options.dictionary)) {
          dictionaries = options.dictionary;
        } else if (typeof options.dictionary == "string") {
          dictionaries = [options.dictionary];
        }
      }
    }
    if (!dictionaries || dictionaries.length == 0) {
      dictionaries = [defaultDictName];
    }

    if (!spells) {
      let path = require("path");
      spells = [];
      dictionaries.forEach(function(dictionary) {
        let base = require.resolve(dictionary);
        let dict = {
          dic: readFileSync(path.join(base, "../index.dic"), "utf-8"),
          aff: readFileSync(path.join(base, "../index.aff"), "utf-8")
        };
        spells.push(nspell(dict));
      });
      if (customDictionary) {
        spells[0].personal(customDictionary.join("\n"));
      }
      /**
       * currently a dictionary of software terms has been rigidly inserted
       * ultimately there will be a separate NPM package
       */
      spells[0].personal(readFileSync("./lib/dicts/software.txt", "utf-8"));
    }

    function checkWord(word) {
      return spells.some(spell => spell.correct(word));
    }

    function spellWords(words, node) {
      words.forEach(function(word) {
        if (isNaN(word) && !checkWord(word)) {
          context.report(node, "Incorrect word: {{word}}", {
            word: word
          });
        }
      });
    }

    return {
      ...(verifyIdentifiers && {
        Identifier(node) {
          var words = getWords(node.name);
          spellWords(words, node);
        }
      }),
      ...(verifyLiterals && {
        Literal(node) {
          var words = getWords(node.value);
          spellWords(words, node);
        },
        TemplateElement(node) {
          var words = getWords(node.value.raw);
          spellWords(words, node);
        }
      }),
      ...(verifyComments && {
        Program() {
          const comments = context.getSourceCode().getAllComments();
          comments
            .filter(token => token.type !== "Shebang")
            .forEach(node => {
              var words = getWords(node.value);
              spellWords(words, node);
            });
        }
      })
    };
  }
};
