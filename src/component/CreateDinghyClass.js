import React from 'react';
import { screen } from 'react';

function CreateDinghyClass({ onCreate }) {

    function handleClick(event) {
        event.preventDefault();
        const input = document.getElementById('dinghy-class-input');
        onCreate({'name': input.value});
    }

    return (
        <form action="" method="get">
            <label htmlFor="dinghy-class-input">Class Name</label>
            <input id="dinghy-class-input" type="text" />
            <button id="dinghy-class-create-button" type="button" onClick={handleClick}>Create</button>
        </form>
    )
}

export default CreateDinghyClass;