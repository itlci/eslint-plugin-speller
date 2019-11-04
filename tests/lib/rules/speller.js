/**
 * @fileoverview speller rule test
 * @author Łukasz Cichorek
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/speller"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("speller", rule, {
  valid: [
    {
      code: `
                  var validVariable = "This is valid variable name";
              `,
      errors: []
    },
    {
      code: `
                    var validVariable = "This is valid variable name"; // valid comment
                `,
      errors: []
    }
  ],

  invalid: [
    {
      code: `
                var incorrrectVariable = "This is incorrect variable name";
            `,
      errors: [
        {
          message: "Incorrect word: incorrrect",
          type: "Identifier"
        }
      ]
    },
    {
      code: `
                  var incorrectVariableContent = "This is incorrect varriable name";
              `,
      errors: [
        {
          message: "Incorrect word: varriable",
          type: "Literal"
        }
      ]
    },
    {
      code: `
                  var correctVariable = "This is correct variable name, but incorrect line comment"; // Incorrrect line commment
              `,
      errors: [
        {
          message: "Incorrect word: Incorrrect",
          type: "Line"
        },
        {
          message: "Incorrect word: commment",
          type: "Line"
        }
      ]
    },
    {
      code: `
        /*
            Incorrrect block commment
        */
        var correctVariable = "This is correct variable name, but incorrect block comment"; 
                `,
      errors: [
        {
          message: "Incorrect word: Incorrrect",
          type: "Block"
        },
        {
          message: "Incorrect word: commment",
          type: "Block"
        }
      ]
    }
  ]
});
