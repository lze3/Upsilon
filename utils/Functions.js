module.exports = {
    /**
     * Converts a boolean to a 'Yes' or 'No' string
     * @param {boolean} bool
     * @return {string} 'Yes' if true, 'No' if false
     *
     * @example
     *
     *      convertBoolToStrState(true); // Yes
     */
    convertBoolToStrState: function(bool) {
        if (typeof bool !== 'boolean') throw new TypeError('Expected boolean, got ' + typeof bool);
        return bool ? 'Yes' : 'No';
    },

    /**
     * Converts decimal to hex
     * @param {number} decimal
     * @return {string} Hexadecimal
     *
     * @example
     *
     *      convertDecToHex(16711680); // 'FF0000'
     */
    convertDecToHex: function(decimal) {
        if (typeof decimal !== 'number') throw new TypeError('Expected number, got ' + typeof decimal);
        return decimal.toString(16);
    },

    /**
     * Converts hex to decimal
     * @param {string} hex
     * @return {number} Decimal
     *
     * @example
     *
     *      convertHexToDec('#d91e18'); // 14229016
     */
    convertHexToDec: function(hex) {
        if (typeof hex !== 'string') throw new TypeError('Expected string, got ' + typeof hex);
        return parseInt(hex, 16);
    },

    /**
     * Cleans the string of any carets (^)
     *
     * @param {string} str The initial string.
     */
    FiveMSanitize: function(str) {
        if (typeof str !== 'string') throw new TypeError('Expected string, got ' + typeof str);
        return str.replace(/\^[0-9]/, '');
    }
};