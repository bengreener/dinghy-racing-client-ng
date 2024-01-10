import { useCallback, useEffect, useRef } from 'react';
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
 function ModalDialog({show, onClose, children}) {
    const dialog = useRef(null);

    const onCancel = useCallback((event) => {
        event.preventDefault();
        onClose();
    }, [onClose])

    useEffect(() => {
        if (show && dialog.current) {
            dialog.current.showModal();
        }
        else if (dialog.current) {
            dialog.current.close();
        }
    });

    return(
        <dialog ref={dialog} onCancel={onCancel}>
            {children}
        </dialog>
    )
};

export default ModalDialog;

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
