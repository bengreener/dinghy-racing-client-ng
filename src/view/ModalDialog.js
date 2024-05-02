/*
 * Copyright 2022-2024 BG Information Systems Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

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
