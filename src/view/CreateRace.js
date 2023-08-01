import React from 'react';
import { useContext } from 'react';
import ModelContext from './ModelContext';

function CreateRace({ onCreate }) {
    const model = useContext(ModelContext);
    // race.time is stored here as a string to avoid conversion issues if a new time is being typed in (mostly an issue with unit testing :-( )
    const [race, setRace] = React.useState({'name': '', 'time': new Date(Date.now() + 60 * new Date().getTimezoneOffset() * -1000).toISOString().substring(0, 16), 'dinghyClass': {'name': ''}});
    const [result, setResult] = React.useState({'message': ''});
    const [dinghyClassMap, setDinghyClassMap] = React.useState(new Map());
    const [dinghyClassOptions, setDinghyClassOptions] = React.useState([]);

    const clear = React.useCallback(() => {
        setRace({'name': '', 'time': new Date(Date.now() + 60 * new Date().getTimezoneOffset() * -1000).toISOString().substring(0, 16), 'dinghyClass': {'name': ''}});
        showMessage('');
    }, []);

    React.useEffect(() => {
        model.getDinghyClasses().then(result => {
            if (result.success) {
                // build dinghy class options
                var options = [];
                var map = new Map();
                // set handicap options
                options.push(<option key="handicap" value={null}></option> );
                map.set('', null);
                // set dinghy classes
                result.domainObject.forEach(dinghyClass => {
                    options.push(<option key={dinghyClass.name} value={dinghyClass.name}>{dinghyClass.name}</option>);
                    map.set(dinghyClass.name, dinghyClass);
                });
                setDinghyClassMap(map);
                setDinghyClassOptions(options);
            }
            else {
                showMessage('Unable to load dinghy classes\n' + result.message);
            }
        });

    }, [model]);

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
            setRace({...race, 'dinghyClass': dinghyClassMap.get(target.value)});
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
            <label htmlFor="race-class-select">Race Class</label>
            <select id="race-class-select" name="dinghyClass" multiple={false} onChange={handleChange} value={race.dinghyClass ? race.dinghyClass.name : ''} >{dinghyClassOptions}</select>
            <output id="race-message-output" />
            <button id="race-create-button" type="button" onClick={handleCreate}>Create</button>
        </form>
    );
}

export default CreateRace;