module.exports = {
    /**
     * Converts a boolean to a 'Yes' or 'No' string
     * @param {boolean} bool
     */
    convertBoolToStrState: function(bool) {
        if (typeof bool !== 'boolean') throw new TypeError('Passed ' + typeof bool + ' instead of a boolean!');
        return bool ? 'Yes' : 'No';
    }
};