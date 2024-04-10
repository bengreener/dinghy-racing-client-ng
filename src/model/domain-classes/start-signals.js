/**
 * Class providng enumeration of start sequence options
 */
class StartSignals {
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
                return StartSignals.WARNINGSIGNAL;
            case 'PREPARATORYSIGNAL':
                return StartSignals.PREPARATORYSIGNAL;
            case 'ONEMINUTE':
                return StartSignals.ONEMINUTE;
            case 'STARTINGSIGNAL':
                return StartSignals.STARTINGSIGNAL;
        }
        return null;
    }
}

export default StartSignals;
