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
        actions: '610681448436858880',
        channel: '610877037078511636',
        member: '610876982359752714'
    },

    toggleLogging: function(state) {
        this.logging = state;
    }
};