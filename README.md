# eslint-plugin-speller

## Spell checker for code, eg. Literals, Identifiers, Template Literals and Comments

The rule validates the names of variables and functions. Validates the content of strings and comments. It is very useful in detecting potential typos, often unconscious and difficult to detect organoleptically, which unfortunately often lead to errors in code evaluation (once you use the correct name, a few lines later you make a typo). Applying this rule also increases code quality.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-speller`:

```
$ npm install eslint-plugin-speller --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-speller` globally.

The plugin uses nspell (hunspell compatible spell checker). By default, dictionary-en-us is used. If you want use other language you must install additional dictionaries from https://github.com/wooorm/dictionaries.
For example, if you want to use Polish, you should install the `dictionary-pl` package:

```
$ npm install dictionary-pl --save-dev
```

## Usage

Add `speller` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["speller"]
}
```

This plugin has only one rule. Enter the following configuration:

```json
{
  "rules": {
    "speller/speller": "warn"
  }
}
```

## Rule details

Examples of **incorrect** code for this rule:

```js
var incorrrectVariable = "This is incorrect variable name";
```

```js
var incorrectLiteral = "This is incorrect littteerall";
```

```js
var incorrectComment = "This is incorrect comment"; // Incorrrecct commment
```

Examples of **correct** code for this rule:

```js
var correctVariable = "This is correct variable";
```

```js
var correctLiteral = "This is correct literal";
```

```js
var correctComment = "This is correct comment"; // correct comment
```

### Options

This rule accepts a single options argument:

- Set the `comments` option to false if you want disable linting a comments (line or block). Default is true.
- Set the `literals` option to false if tou want disable linting a literals (simple Literals or Template Literals). Default is true
- Set the `identifiers` option to false if you want disable linting a identifiers (eg. name of variables or functions). Default is true.
- Set the `dictionary` option to the name of the npm dictionary package that is compatible with nspell. A list of dictionaries is available here -> https://github.com/wooorm/dictionaries. You must install the additional package on your own. The default is `dictionary-en-us` - you don't have to install it separately. It accepts Array or String.
- Set the `customDictionary` option to a list of your own words that do not appear in the dictionary.

#### Example option:

```json
{
  "comments": true,
  "literals": true,
  "identifiers": true,
  "dictionary": ["dictionary-en-us", "dictionary-pl"],
  "customDictionary": ["yourcustomword"]
}
```

#### Example configuration:

```json
"plugins": [
   "speller"
],
"rules": {
   "speller/speller": ["warn",
       {
            "comments": true,
            "literals": true,
            "identifiers": true,
            "dictionary": ["dictionary-en-us", "dictionary-pl"],
            "customDictionary": ["yourcustomword"]
        }
    ]
}
```

## When Not To Use It

If you like typos or incomprehensible variable names, don't use this rule.

## Further Reading

The rule uses the [nspell](https://github.com/wooorm/nspell) package, which is responsible for checking the existence of a word in the dictionary. Thanks to [wooorm](https://github.com/wooorm).
