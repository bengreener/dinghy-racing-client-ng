import React from 'react';

function CreateDinghyClass({ onCreate }) {
    const [dinghyClass, setDinghyClass] = React.useState({'name': ''});
    const [result, setResult] = React.useState({message: ''});
    
    const clear = React.useCallback(() => {
        setDinghyClass({'name': ''});
        showMessage('');
    }, []);

    React.useEffect(() => {
        if (result && result.success) {
            clear();
        }
        if (result && !result.success) {
            showMessage(result.message);
        }
    }, [result, clear]);

    async function handleCreate(event) {
        event.preventDefault();
        setResult(await onCreate(dinghyClass));
    }

    function handleChange({target}) {
        setDinghyClass({...dinghyClass, [target.name]: target.value});
    }

    function showMessage(message) {
        const output = document.getElementById('dinghy-class-message-output');
        output.value = message;
    }

    return (
        <form action="" method="get">
            <label htmlFor="dinghy-class-input">Class Name</label>
            <input id="dinghy-class-input" name="name" type="text" onChange={handleChange} value={dinghyClass.name} />
            <output id="dinghy-class-message-output" />
            <button id="dinghy-class-create-button" type="button" onClick={handleCreate}>Create</button>
        </form>
    )
}

export default CreateDinghyClass;