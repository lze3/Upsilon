/**
 * Converts a boolean to a string value, useful for user interactive things
 * @param bool The boolean you wish convert to string.
 * @return 'Yes' if boolean is truth-y, 'No' if boolean is false-y
 *
 * @example
 *
 *      convertBoolToStrState(true); // 'Yes'
 *      convertBoolToStrState(1); // 'Yes'
 */
export function convertBoolToStrState(bool: boolean): string {
    return bool && typeof bool === 'boolean' ? 'Yes' : 'No';
};

/**
 * Converts decimal to hex
 * @param {number} decimal
 * @return {string} Hexadecimal
 *
 * @example
 *
 *      convertDecToHex(16711680); // 'FF0000'
 */
export function convertDecToHex(decimal: number): string {
    return decimal.toString(16);
}

/**
 * Converts hex to decimal
 * @param {string} hex
 * @return {number} Decimal
 *
 * @example
 *
 *      convertHexToDec('#d91e18'); // 14229016
 */
export function convertHexToDec(hex: string): number {
    return parseInt(hex, 16);
}

/**
 * Cleans the string of any carets, tilde colors (e.g. \~r\~) and HTML tags (<FONT COLOR='#D9E18'>D</FONT>)
 *
 * @param {string} str The initial string.
 *
 * @example
 *
 *      FiveMSantize('~r~cool rp serber name, <font></font>'); // 'rcool rp serber name, font/font
 */
export function fivemSantize(str: string): string {
    return str.replace(
        /(>|<|~[a-zA-Z]~|\^[0-9])/g,
        ''
    );
}