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

import { useEffect, useState } from 'react';

function DropboxAuthorisationForm({ getUrl, onSubmit }) {
    const [url, setUrl] = useState('');
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        getUrl().then(result => setUrl(result));
    })

    function handleCodeInputChange({target}) {
        setCode(target.value);
    }

    async function handleSubmitButtonClick() {
        if (onSubmit) {
            try{
                await onSubmit(code);
                clear();
            }
            catch(error) {
                setMessage(error.message);
            };
        }
    }

    function clear() {
        setCode('');
        setMessage('');
    }

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
    }

    return(
        <div className='w3-container console' >
            <h1>Dropbox Authorisation</h1>
            <div className = 'w3-row w3-row-padding' >
                <label className='w3-col m2' >Get Dropbox Auth Code</label>
                <a rel='external' target='_blank' href={url} >{url}</a>
            </div>
            <form className='w3-container' action='' method='post'>
                <div className='w3-row'>
                    <label htmlFor='code-input' className='w3-col m2' >Code</label>
                    <input id='code-input' className='w3-half' name='code' type='text' value={code} onChange={handleCodeInputChange}></input>
                </div>
                <div className='w3-row'>
                    <div className='w3-col m6 w3-right' >
                        <button className={'cancel-button w3-btn w3-border bgis-pale-amber w3-hover-amber'} type='button' onClick={clear} >Cancel</button>
                        <button className={'submit-button w3-btn w3-border w3-light-green w3-hover-green'} type='button' onClick={handleSubmitButtonClick} >Submit</button>
                    </div>
                </div>
            </form>
            <p className={userMessageClasses()}>{message}</p>
        </div>
    )
}

export default DropboxAuthorisationForm;