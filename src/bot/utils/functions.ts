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
}

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

/**
 * Prefixes current time (hh:mm:ss) as well as a message to a log printed to `stdout`
 *
 * @param message Message you wish to log
 */
export function time_log(message: string): void {
    const current_time: Date = new Date();
    let hour: string = current_time.getHours().toString();
    let min: string = current_time.getMinutes().toString();
    let sec: string = current_time.getSeconds().toString();

    if (current_time.getHours() < 10) {
        hour = '0' + hour;
    }

    if (current_time.getMinutes() < 10) {
        min = '0' + min;
    }

    if (current_time.getSeconds() < 10) {
        sec = '0' + sec;
    }

    return console.log(`[${hour}:${min}:${sec}]`.red + ` ${message}`);
}

/**
 * Gets an environmental variable, if undefined it returns the second param
 *
 * @param {string} variable Variable name.
 * @param {string} defaultVal Default value if value is undefined.
 */
export function get_environment_variable(variable: string, defaultVal: string): string {
    return process.env[variable] ?? defaultVal;
}

/**
 * Capitalises any given string.
 *
 * @param init_str Upper or lower case string.
 */
export function capitalize(init_str: string): string {
    return init_str.charAt(0).toUpperCase() + init_str.slice(1);
}

/**
 * An object where key is shortened auth level and value is full auth level name
 */
export const hsgAuths: {[key: string]: string} = {
    'CR': 'Casual Restricted',
    'CU': 'Casual Unrestricted',
    'M1': 'New Member',
    'M2': 'Member',
    'GS': 'General Staff',
    'A1': 'Junior Administrator',
    'A2': 'Senior Administrator',
    'A3': 'Lead Administrator',
    'DV': 'Developer',
    'CD': 'Chief of Development',
    'DR': 'Director'
};

/**
 * FiveM player data structure
 */
export interface IPlayerDataStruct {
    name: string;
    id: number;
    identifiers: string[];
    ping: number;
}

/**
 * Returns boolean and string.
 *
 * @param acr Takes server var property 'gametype'
 * @returns An array with 1st index being is server HSG server, 2nd index being auth level name if index 1 is not false, else `null`.
 *
 * @example
 *  get_auth_level_by_acronym('HSG-RP | Authorization CU'); // [true, 'Casual Unrestricted']
 *  get_auth_level_by_acronym('fivem'); // [false, null]
 */
export function get_auth_level_by_acronym(acr: string): [boolean, string|null] {
    let shortened_auth: string;

    if (acr.includes('Authorization')) {
        shortened_auth = acr.replace('HSG-RP | Authorization ', '');
    }

    return hsgAuths[shortened_auth] ? [true, hsgAuths[shortened_auth]] : [false, null];
}

/**
 * Structure for FiveM server data returned from ip:port/dynamic.json
 *
 * @example
 * {
 *      "clients": 21,
 *      "gametype": "fivem",
 *      "hostname": "meow",
 *      "iv": "981675851",
 *      "mapname": "fivem-map-skater",
 *      "sv_maxclients": 32
 * }
 */
export interface IServerDataStruct {
    /**
     * Returns total amount of clients on the server.
     */
    clients: number;

    /**
     * Returns current game type.
     */
    gametype: string;

    /**
     * Returns name of the server.
     */
    hostname: string;

    /**
     * Returns version number.
     */
    iv: string;

    /**
     * Returns current map name.
     */
    mapname: string;

    /**
     * Returns maximum amount of clients.
     */
    sv_maxclients: string;
}