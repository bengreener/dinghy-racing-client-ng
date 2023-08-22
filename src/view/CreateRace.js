import React from 'react';
import { useContext } from 'react';
import DinghyRacingModel from '../model/dinghy-racing-model';
import ModelContext from './ModelContext';

function CreateRace({ onCreate }) {
    const model = useContext(ModelContext);
    const [race, setRace] = React.useState({...DinghyRacingModel.raceTemplate(), 'plannedStartTime': new Date(Date.now() + 60 * new Date().getTimezoneOffset() * -1000).toISOString().substring(0, 16), 'duration': 2700000});
    const [result, setResult] = React.useState({'message': ''});
    const [dinghyClassMap, setDinghyClassMap] = React.useState(new Map());
    const [dinghyClassOptions, setDinghyClassOptions] = React.useState([]);

    const clear = React.useCallback(() => {
        setRace({...DinghyRacingModel.raceTemplate(), 'plannedStartTime': new Date(Date.now() + 60 * new Date().getTimezoneOffset() * -1000).toISOString().substring(0, 16), 'duration': 2700000});
        showMessage('');
    }, []);

    React.useEffect(() => {
        model.getDinghyClasses().then(result => {
            if (result.success) {
                // build dinghy class options
                let options = [];
                let map = new Map();
                // set handicap options
                options.push(<option key="handicap" value={null}></option> );
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
        const domainRace = {...race, 'plannedStartTime': new Date(race.plannedStartTime)};
        setResult(await onCreate(domainRace));
    }

    function handleChange({target}) {
        if (target.name === 'dinghyClass') {
            setRace({...race, 'dinghyClass': dinghyClassMap.get(target.value)});
        }
        else if (target.name === 'duration') {
            setRace({...race, [target.name]: target.value * 60000});
        }
        else {
            setRace({...race, [target.name]: target.value});
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
            <input id="race-time-input" name="plannedStartTime" type="datetime-local" onChange={handleChange} value={race.plannedStartTime} />
            <label htmlFor="race-duration-input">Duration</label>
            <input id="race-duration-input" name="duration" type="number" onChange={handleChange} value={race.duration / 60000} />
            <label htmlFor="race-class-select">Race Class</label>
            <select id="race-class-select" name="dinghyClass" multiple={false} onChange={handleChange} value={race.dinghyClass ? race.dinghyClass.name : ''} >{dinghyClassOptions}</select>
            <output id="race-message-output" />
            <button id="race-create-button" type="button" onClick={handleCreate}>Create</button>
        </form>
    );
}

export default CreateRace;