import { useCallback, useState } from 'react';
/**
 * Provide a dialog to get the duration of a race postponement
 * Time is set in 5 minute intervals with an initial value of 30 minutes
 * @param {Object} props
 * @param {Race} props.race to postpone
 * @param {PostponeRaceForm~postponeRace} props.onPostpone called when postpone button clicked
 * @param {PostponeRaceDialog~closeParentDialog} props.closeParentDialog call this to close a dialog containing this form
 */
 function PostponeRaceForm({race, onPostpone, closeParentDialog = null}) {
    const [duration, setDuration] = useState(30);
    
    const handlePostponeButtonClick = useCallback((event) => {
        event.preventDefault();
        onPostpone(race, duration * 60 * 1000);
        if (closeParentDialog) {
            closeParentDialog();
        }
    }, [race, duration, onPostpone, closeParentDialog]);

    function handleDelayChange({target}) {
        if (target.value >= 0) {
            setDuration(target.value);
        }
    };

    return(
        <form action='' method='get'>
            <div>
                <label htmlFor='delay-input'>Delay</label>
                <input id='delay-input' type='number' name='delay' min='0' step='5' value={duration} onChange={handleDelayChange} />
            </div>
            <div>
                {closeParentDialog ? <button type='button' onClick={closeParentDialog}>Cancel</button> : null}
                <button type='button' onClick={handlePostponeButtonClick}>Postpone</button>
            </div>
        </form>
    )
};

export default PostponeRaceForm;

/**
 * Action to take when PostponeRaceDialog postpone button clicked
 * @callback PostponeRaceForm~postponeRace
 * @param {Race} race to postpone
 * @param {Number} duration, in milliseconds, by which to delay the race
 */

/**
 * Callback to closea containing dialog
 * @callback PostponeRaceDialog~closeParentDialog
 */