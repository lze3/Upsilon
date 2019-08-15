module.exports = {
    prefix: 'd.',
    logging: false,
    embedColors: {
        success: '#88E742',
        error: '#E74242',
        debug: '#429BE7',
        action: '#EBD158',
        punitive: '#EB5858',
        msgDelete: '#6958EB',
        msgEdit: '#58C3EB'
    },
    logChannels: {
        actions: '611293519302230047',
        member: '539493323287691275'
    },

    /**
     * Sets the state for Discord logging
     * @param {boolean} state
     */
    toggleLogging: function(state) {
        this.logging = state;
    }
};