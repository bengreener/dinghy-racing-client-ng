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
 * A dialog to display a form that can be used to get values from the user
 * 
 * @param {Object} props
 * @param {Boolean} props.show or hide dialog
 * @param {ModalDialog~closeDialog} props.onClose call this when dialog closed
 * @param {String} [props.testId] 
 */
 function ModalDialog({show, onClose, children, testid = ''}) {
    const dialog = useRef(null);

    const handleCancel = useCallback((event) => {
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
        <dialog data-testid={testid} ref={dialog} onCancel={handleCancel}>
            {children}
        </dialog>
    )
};

export default ModalDialog;

/**
 * Callback to trigger parent to close dialog
 * @callback ModalDialog~closeDialog
 */