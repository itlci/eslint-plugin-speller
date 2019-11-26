/**
 * @fileoverview Speller rule
 * @author Łukasz Cichorek
 */
"use strict";

const nspell = require("nspell");
const { readFileSync } = require("fs");
const getWords = require("lodash.words");
const defaultDictName = "dictionary-en-us";
const mem = require("mem");
const path = require("path");
var spells = null;

var checkWord = null;
var suggestWord = null;

function checkWordBase(word) {
  return spells.some(spell => spell.correct(word));
}

function suggestWordBase(word) {
  return spells.map(spell => spell.suggest(word)).flat();
}

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
          },
          attachItWords: {
            type: "boolean",
            default: true
          },
          suggest: {
            type: "boolean",
            default: true
          },
          cache: {
            type: "boolean",
            default: true
          }
        }
      }
    ],
    type: "suggestion"
  },

  create: function(context) {
    let defaultOptions = {
      comments: true,
      literals: true,
      identifiers: true,
      dictionary: ["dictionary-en-us"],
      customDictionary: [],
      attachItWords: true,
      suggest: true,
      cache: true
    };
    var options = Object.assign(defaultOptions, context.options[0]);
    if (options.dictionary && typeof options.dictionary == "string") {
      options.dictionary = [options.dictionary];
    }
    if (!options.dictionary || options.dictionary.length == 0) {
      options.dictionary = ["dictionary-en-us"];
    }

    if (!spells) {
      spells = [];
      options.dictionary.forEach(function(dictionary) {
        let base = require.resolve(dictionary);
        let dict = {
          dic: readFileSync(path.join(base, "../index.dic"), "utf-8"),
          aff: readFileSync(path.join(base, "../index.aff"), "utf-8")
        };
        spells.push(nspell(dict));
      });
      if (options.customDictionary) {
        spells[0].personal(options.customDictionary.join("\n"));
      }

      if (options.attachItWords) {
        spells[0].personal(require("speller-it-words").getWords());
      }
      if (options.cache) {
        checkWord = mem(checkWordBase);
        suggestWord = mem(suggestWordBase);
      } else {
        checkWord = checkWordBase;
        suggestWord = checkWordBase;
      }
    }

    function spellWords(words, node) {
      words.forEach(function(word) {
        if (isNaN(word) && !checkWord(word)) {
          if (options.suggest) {
            var suggestedWords = suggestWord(word);
            if (suggestedWords.length > 0) {
              context.report(
                node,
                "Incorrect word: {{word}}. Maybe you meant: {{suggestedWords}}",
                {
                  word: word,
                  suggestedWords: suggestedWords.join(", ")
                }
              );
            } else {
              context.report(node, "Incorrect word: {{word}}", {
                word: word
              });
            }
          } else {
            context.report(node, "Incorrect word: {{word}}", {
              word: word
            });
          }
        }
      });
    }

    return {
      ...(options.identifiers && {
        Identifier(node) {
          let words = getWords(node.name);
          spellWords(words, node);
        }
      }),
      ...(options.literals && {
        Literal(node) {
          let words = getWords(node.value);
          spellWords(words, node);
        },
        TemplateElement(node) {
          let words = getWords(node.value.raw);
          spellWords(words, node);
        }
      }),
      ...(options.comments && {
        Program() {
          const comments = context.getSourceCode().getAllComments();
          comments
            .filter(token => token.type !== "Shebang")
            .forEach(node => {
              let words = getWords(node.value);
              spellWords(words, node);
            });
        }
      })
    };
  }
};
