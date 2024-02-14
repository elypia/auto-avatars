# Contribution Guide

Thanks for taking the time to contribute to the project!

## Prerequisites

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org)

## Getting Started

Clone the repository with Git.

```sh
git clone https://github.com/Elypia/auto-avatars.git
```
As this is a JavaScript project and uses NPM for package management, start by installing development and test dependencies.

```sh
npm i
```

## Unit Tests

Before submitting PRs, execute tests to ensure existing functionality doesn't break. Please introduce new tests for new code.

You can execute tests with the following command:

```sh
npm run test
```

## Manual Testing

Read the documentation for manual testing in [Testing](./docs/testing.md).

## Localization

Language files can be found in `src/_locales/*/messages.json`. To support a new language, create a directory with the name of the language code you want to translate to.

The directory name should be a 2-letter-code for the language, you can review the [table of ISO 639 language codes](https://wikipedia.org/wiki/List_of_ISO_639_language_codes) for more information.

If you're writing for a specific dialect of a language, you may append an underscore followed by a 2-letter-code for the country after it. This can help to distinguish American English (`en_US`) from British English (`en_GB`), for example.

From there, you can refer to the contents of `messages.json`, only the `message` field needs to be translated. The rest should be left as-is.

Some messages feature HTML in them, such as the [`<strong>`](https://developer.mozilla.org/docs/Web/HTML/Element/strong) and [`<a>`](https://developer.mozilla.org/docs/Web/HTML/Element/a) tag. Make sure these are still semantically correct after translating, if you need help with this, feel free to connect with one of the maintainers.

### Tooling

Consider exploring solutions for spell and grammar checking for your editor before translating. Most editors have support for tools like:

* [EditorConfig](https://editorconfig.org) - for JSON file formatting.
* [codespell](https://github.com/codespell-project/codespell) - for spelling.
* [LanguageTool](https://languagetool.org) - for grammar checking.
