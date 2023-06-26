const DinghyRacingController = {
    createDinghyClass: function ({name}) {
        if (name === null || name === '') {
            return Promise.resolve({'success': false, 'message': 'A name is required for a new dinghy class.'})
        }
        return Promise.resolve({'success': true});
    }
};

export default DinghyRacingController