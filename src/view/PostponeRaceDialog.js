import { useEffect, useRef, useState } from 'react';
/**
 * Provide a dialog to get the duration of a race postponement
 * Time is set in 5 minute intervals with an initial value of 30 minutes
 * 
 * @param {Object} props
 * @param {Boolean} props.show or hide dialog
 * @param {Race} props.race to postpone
 * @param {PostponeRaceDialog~postponeCallback} props.onPostpone call this when postpone button clicked
 * @param {PostponeRaceDialog~onClose} props.onClose call this when dialog closed
 */
 function PostponeRaceDialog({show, race, onPostpone, onClose}) {
    const [duration, setDuration] = useState(30);
    const dialog = useRef(null);

    useEffect(() => {
        if (show && dialog.current) {
            dialog.current.showModal();
        }
    });

    function handleDelayChange({target}) {
        if (target.value >= 0) {
            setDuration(target.value);
        }        
    }

    function handlePostponeButtonClick(event) {
        event.preventDefault();
        onPostpone(race, duration * 60 * 1000);
        if (dialog.current) {
            dialog.current.close();
        }
        onClose();
    }

    function handleCancelButtonClick(event) {
        if (dialog.current) {
            dialog.current.close();
        }
        onClose();
    }

    function onCancel() {
        // event.preventDefault();
        onClose();
    }

    return(
        <dialog ref={dialog} onCancel={onCancel}>
            <form action='' method='dialog'>
                <div>
                    <label htmlFor='delay-input'>Delay</label>
                    <input id='delay-input' type='number' name='delay' min='0' step='5' value={duration} onChange={handleDelayChange} />
                </div>
                <div>
                    <button type='button' onClick={handleCancelButtonClick}>Cancel</button>
                    <button type='button' onClick={handlePostponeButtonClick}>Postpone</button>
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

/**
 * Callback to trigger parent to close dialog
 * @callback PostponeRaceDialog~onClose
 */
