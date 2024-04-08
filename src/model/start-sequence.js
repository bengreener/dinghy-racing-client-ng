/**
 * Class providng enumeration of start sequence options
 */
class StartSequence {
    static WARNINGSIGNAL = 'WARNINGSIGNAL';
    static PREPARATORYSIGNAL = 'PREPARATORYSIGNAL';
    static ONEMINUTE = 'ONEMINUTE';
	static STARTINGSIGNAL = 'STARTINGSIGNAL';

    /**
     * Return a StartSequence stage value based on the supplied string
     * @param {string} stage
     */
    static from(stage) {
        const lowerStage = stage?.toUpperCase();
        switch (lowerStage) {
            case 'WARNINGSIGNAL':
                return StartSequence.WARNINGSIGNAL;
            case 'PREPARATORYSIGNAL':
                return StartSequence.PREPARATORYSIGNAL;
            case 'ONEMINUTE':
                return StartSequence.ONEMINUTE;
            case 'STARTINGSIGNAL':
                return StartSequence.STARTINGSIGNAL;
        }
        return null;
    }
}

export default StartSequence;
