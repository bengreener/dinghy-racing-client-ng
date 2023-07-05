import React from 'react';

function CreateRace({ onCreate }) {
    const [race, setRace] = React.useState({'name': '', 'time': new Date().toISOString().substring(0, 16), 'dinghyClass': {'name': ''}});
    const [result, setResult] = React.useState({'message': ''});

    const clear = React.useCallback(() => {
        setRace({'name': '', 'time': new Date().toISOString().substring(0, 16), 'dinghyClass': {'name': ''}});
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
        const domainRace = {...race, 'time': new Date(race.time)};
        setResult(await onCreate(domainRace));
    }

    function handleChange({target}) {
        if (target.name !== 'dinghyClass') {
            setRace({...race, [target.name]: target.value});
        }
        else {
            setRace({...race, 'dinghyClass': {'name': target.value}});
        }
    }

    function showMessage(message) {
        const output = document.getElementById('race-message-output');
        output.value = message;
    }

    return (
        <form action="" method="post">
            <label htmlFor="race-name-input">Race Name</label>
            <input id="race-name-input" name="name" type="text" onChange={handleChange} value={race.name} />
            <label htmlFor="race-time-input">Race Time</label>
            <input id="race-time-input" name="time" type="datetime-local" onChange={handleChange} value={race.time} />
            <label htmlFor="race-class-input">Race Class</label>
            <input id="race-class-input" name="dinghyClass" type="text" onChange={handleChange} value={race.dinghyClass.name} />
            <output id="race-message-output" />
            <button id="race-create-button" type="button" onClick={handleCreate}>Create</button>
        </form>
    );
}

export default CreateRace;