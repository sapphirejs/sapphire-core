const IntlMessage = require('intl-messageformat')
const objectPath = require('object-path')
const MissingLocale = require('./errors/missing-locale')
const MissingLocaleKey = require('./errors/missing-locale-key')
const InvalidLocaleMessage = require('./errors/invalid-locale-message')

/**
* Internationalization package.

* @class Intl
*/
class Intl {
  /**
   * @param {Object} locales
   * @param {string} locale
   */
  constructor(locales, locale) {
    this._locales = locales
    this._locale = locale
    this._tempLocale = null
  }

  /**
   * Formats a locale string with a given
   * key path.
   *
   * @public
   * @param {string} path
   * @param {Object} data
   * @returns {string}
   * @throws {MissingLocale} When locale doesn't exist
   * @throws {MissingLocaleKey} When locale key doesn't exist
   * @throws {InvalidLocaleMessage} when locale message is not well formatted
   */
  format(path, data) {
    let locale = this._tempLocale || this._locale
    if (!this._localeExists(locale))
      throw new MissingLocale(`Locale '${locale}' not found`)

    this._tempLocale = null

    // Append the locale as a path, to reflect the
    // structure of the expected locales object.
    let localePath = `${locale}.${path}`
    // objectPath gets values from deeply nested object keys.
    let value = objectPath.get(this._locales, localePath)

    if (!value)
      throw new MissingLocaleKey(`Locale key '${path}' not found for locale '${locale}'`)

    try {
      let intl = new IntlMessage(value, locale)
      return intl.format(data)
    } catch(err) {
      throw new InvalidLocaleMessage(`Locale message on key '${path}' is invalid. System response: ${err.message}`)
    }
  }

  /**
   * Returns the current locale.
   *
   * @public
   * @returns {string}
   */
  get locale() {
    return this._locale
  }

  /**
   * Sets the locale dynamically.
   *
   * @public
   * @param {string} locale
   */
  set locale(locale) {
    this._locale = locale
  }

  /**
   * Sets the locale temporarily for a single
   * format call.
   *
   * @public
   * @param {string} locale
   * @returns {Intl}
   */
  in(locale) {
    this._tempLocale = locale
    return this
  }

  /**
   * Checks if the locale exists.
   *
   * @private
   * @param {string} locale
   * @returns {boolean}
   */
  _localeExists(locale) {
    return this._locales.hasOwnProperty(locale)
  }
}

module.exports = Intl
