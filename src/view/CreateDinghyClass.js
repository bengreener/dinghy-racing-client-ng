import React from 'react';

function CreateDinghyClass({ onCreate }) {

    function handleCreate(event) {
        event.preventDefault();
        const input = document.getElementById('dinghy-class-input');
        onCreate({'name': input.value});
    }

    return (
        <form action="" method="get">
            <label htmlFor="dinghy-class-input">Class Name</label>
            <input id="dinghy-class-input" type="text" />
            <button id="dinghy-class-create-button" type="button" onClick={handleCreate}>Create</button>
        </form>
    )
}

export default CreateDinghyClass;