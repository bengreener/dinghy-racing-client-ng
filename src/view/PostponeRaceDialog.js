import { useRef, useState } from 'react';
/**
 * Provide a dialog to get the duration of a race postponement
 * Time is set in 5 minute intervals with an initial value of 30 minutes
 * @param {Object} props
 * @param {Race} props.race to postpone
 * @param {PostponeRaceDialog~postponeCallback} onPostpone call this when postpone button clicked
 */
 function PostponeRaceDialog({race, onPostpone}) {
    const [duration, setDuration] = useState(30);
    const dialog = useRef(null);

    function handleDelayChange({target}) {
        if (target.value >=0) {
            setDuration(target.value);
        }        
    }

    function handlePostponeButtonClick(event) {
        event.preventDefault();
        onPostpone(race, duration);
        if (dialog.current) {
            dialog.current.close();
        }
    }

    return(
        <dialog ref={dialog}>
            <form action='' method='dialog'>
                <div>
                    <label htmlFor='delay-input'>Delay</label>
                    <input id='delay-input' type='number' name='delay' min='0' step='5' value={duration} onChange={handleDelayChange} />
                </div>
                <div>
                    <button value='cancel' formMethod='dialog'>Cancel</button>
                    <button onClick={handlePostponeButtonClick}>Postpone</button>
                </div>
            </form>
        </dialog>
    )
};

export default PostponeRaceDialog;

/**
 * Action to take when PostponeRaceDialog postpone button clicked
 * @callback PostponeRaceDialog~postponeRace
 * @param {Race} race to postpone
 * @param {Number} duration, in milliseconds, by which to delay the race
 */