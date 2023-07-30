import React from 'react';
import { useContext, useState } from 'react';
import ControllerContext from './ControllerContext';
import ModelContext from './ModelContext';
/**
 * Form for signing up to a race
 * @param {Object} props
 * @param {Race} props.race The race to sign up to
 * @returns {HTMLFormElement}
 */
function SignUp({ race }) {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [competitor, setCompetitor] = useState({'name': '', 'url': ''});
    const [dinghy, setDinghy] = useState({'sailNumber': '', 'dinghyClass': {'name': '', 'url': ''}, 'url': ''});
    const [result, setResult] = useState({'message': ''});
    const [competitorMap, setCompetitorMap] = useState(new Map());
    const [competitorOptions, setCompetitorOptions] = useState([]);
    const [dinghyClassMap, setDinghyClassMap] = React.useState(new Map());
    const [dinghyClassOptions, setDinghyClassOptions] = React.useState([]);

    const clear = React.useCallback(() => {
        setCompetitor({'name': '', 'url': ''});
        setDinghy({'sailNumber': '', 'dinghyClass': {'name': '', 'url': ''}, 'url': ''});
        showMessage('');
    }, []);

    React.useEffect(() => {
        model.getCompetitors().then((result) => {
            if (result.success) {
                const competitorMap = new Map();
                const options = [];
                competitorMap.set('', {'name': '', 'url': ''});
                options.push(<option key={''} value={''}>{''}</option>);
                result.domainObject.forEach(competitor => {
                   competitorMap.set(competitor.name, competitor);
                   options.push(<option key={competitor.name} value={competitor.name}>{competitor.name}</option>);
                });
                setCompetitorMap(competitorMap);
                setCompetitorOptions(options);
            }
            else {
                showMessage('Unable to load competitors\n' + result.message);
            }
        });
    }, [model]);

    React.useEffect(() => {
        model.getDinghyClasses().then(result => {
            if (result.success) {
                // build dinghy class options
                var options = [];
                var map = new Map();
                // set handicap options
                options.push(<option key={''} value={''}></option> );
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
    
    function handleChange({target}) {
        if (target.name === 'sailNumber') {
            setDinghy({...dinghy, 'sailNumber': target.value});
        }
        if (target.name === 'competitor') {
            setCompetitor(competitorMap.get(target.value));
        }
        if (target.name === 'dinghyClass') {
            setDinghy({...dinghy, 'dinghyClass': dinghyClassMap.get(target.value)});
        }
    }

    async function handleCreate(event) {
        event.preventDefault();
        setResult(await controller.signupToRace(race, competitor, dinghy));
    }

    function dinghyClass(race) {
        let dinghyClass = null;
    
        if (!race.dinghyClass) {
            dinghyClass = (
                <>
                    <label htmlFor="dinghy-class-select">Dinghy Class</label>
                    <select id="dinghy-class-select" name="dinghyClass" multiple={false} onChange={handleChange} value={dinghy.dinghyClass ? dinghy.dinghyClass.name : ''} >{dinghyClassOptions}</select>
                </>
            );
        }
        // if race has a specified dinghy class then set for selected dinghy as well
        else if (dinghy.dinghyClass.name === '') {
            setDinghy({...dinghy, 'dinghyClass': race.dinghyClass});
        }
        return dinghyClass;
    }

    function showMessage(message) {
        const output = document.getElementById('entry-message-output');
        output.value = message;
    }

    return (
        <form action="" method="get">
            <label htmlFor="competitor-select">Competitor's Name</label>
            <select id="competitor-select" name="competitor" multiple={false} onChange={handleChange} value={competitor.name} >{competitorOptions}</select>
            <output id="race-message-output" />
            {dinghyClass(race)}
            <label htmlFor="sail-number-input">Sail Number</label>
            <input id="sail-number-input" name="sailNumber" type="text" onChange={handleChange} value={dinghy.sailNumber}/>
            <output id="entry-message-output" />
            <button id="entry-create-button" type="button" onClick={handleCreate} >Create</button>
        </form>
    )
}

export default SignUp;

