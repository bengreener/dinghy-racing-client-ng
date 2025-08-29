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

import React, { useState } from 'react';

/**
 * A container for race headers.
 * Provide show/ hide feature for contained headers
 */
function CollapsableContainer({ heading, children }) {
    const [showChildren, setShowChildren] = useState(false);

    function handleToggleChildrenButtonClick() {
        setShowChildren(s => !s);
    }

    return (
        <div>
            <h1>
                {heading}
                <button id='toggle-children-button' className='embedded' type='button' title={!showChildren ? 'Hide' : 'Show'} onClick={handleToggleChildrenButtonClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                </button>
            </h1>
            <div hidden={showChildren}>
                {children}
            </div>
        </div>
    )
}

export default CollapsableContainer;