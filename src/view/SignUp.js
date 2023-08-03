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
    const [competitorName, setCompetitorName] = useState('');
    const [competitor, setCompetitor] = useState({'name': '', 'url': ''});
    const [sailNumber, setSailNumber] = useState('');
    const [dinghy, setDinghy] = useState({'sailNumber': '', 'dinghyClass': {'name': '', 'url': ''}, 'url': ''});
    const [result, setResult] = useState({'message': ''});
    const [competitorMap, setCompetitorMap] = useState(new Map());
    const [competitorOptions, setCompetitorOptions] = useState([]);
    const [dinghyClassMap, setDinghyClassMap] = React.useState(new Map());
    const [dinghyClassOptions, setDinghyClassOptions] = React.useState([]);
    const [dinghyMap, setDinghyMap] = React.useState(new Map());
    const [dinghyOptions, setDinghyOptions] = React.useState([]);

    const clear = React.useCallback(() => {
        setCompetitorName('');
        setCompetitor({'name': '', 'url': ''});
        setSailNumber('');
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
                let options = [];
                let map = new Map();
                // set handicap options
                options.push(<option key={''} value={''}></option> );
                map.set('', {'name': '', 'url': ''});
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
        let dinghyClass = race.dinghyClass;
        if (!dinghyClass && dinghy.dinghyClass && dinghy.dinghyClass.url) {
            dinghyClass = dinghy.dinghyClass;
        }
        model.getDinghies(dinghyClass).then(result => {
            if (result.success) {
                let options = [];
                let map = new Map();
                options.push(<option key={''} value = {''}></option>);
                map.set('', {'sailNumber': '', 'dinghyClass': {'name': '', 'url': ''}, 'url': ''});
                result.domainObject.forEach(dinghy => {
                    options.push(<option key={dinghy.sailNumber} value={dinghy.sailNumber}>{dinghy.sailNumber}</option>)
                    map.set(dinghy.sailNumber, dinghy);
                });
                setDinghyMap(map);
                setDinghyOptions(options);
            }
            else {
                showMessage('Unable to load dinghy classes\n' + result.message);
            }
        })
    }, [model, race.dinghyClass, dinghy])

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
            if (dinghyMap.has(target.value)) {
                setDinghy(dinghyMap.get(target.value));
            }
            else if (dinghyClass.sailNumber) {
                // remove any earlier match
                setDinghy({'sailNumber': '', 'dinghyClass': {'name': '', 'url': ''}, 'url': ''});
            }
            setSailNumber(target.value);
        }
        if (target.name === 'competitor') {
            if (competitorMap.has(target.value)) {
                setCompetitor(competitorMap.get(target.value));
            }
            else if (competitor.name) {
                // remove any earlier match
                setCompetitor({'name': '', 'url': ''});
            }
            setCompetitorName(target.value);
        }
        if (target.name === 'dinghyClass') {
            setDinghy({...dinghy, 'dinghyClass': dinghyClassMap.get(target.value)});
        }
    }

    async function handleCreate(event) {
        event.preventDefault();
        if (!dinghyMap.has(sailNumber)) {
            const addDinghyResult = await controller.createDinghy({'sailNumber': sailNumber, 'dinghyClass': dinghy.dinghyClass});
            if (addDinghyResult.success) {
                setResult(await controller.signupToRace(race, competitor, {'sailNumber': sailNumber, 'dinghyClass': dinghy.dinghyClass}));
            }
            else {
                setResult(addDinghyResult);
            }
        }
        else {
            setResult(await controller.signupToRace(race, competitor, dinghy));
        }
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
            <datalist id="competitor-datalist">{competitorOptions}</datalist>
            <label htmlFor="competitor-input">Competitor's Name</label>
            <input id="competitor-input" name="competitor" list="competitor-datalist" onChange={handleChange} value={competitorName} />
            {dinghyClass(race)}
            <datalist id="dinghy-datalist">{dinghyOptions}</datalist>
            <label htmlFor="sail-number-input">Sail Number</label>
            <input id="sail-number-input" name="sailNumber" list="dinghy-datalist" onChange={handleChange} value={sailNumber} />
            <output id="entry-message-output" />
            <button id="entry-create-button" type="button" onClick={handleCreate} >{dinghyMap.has(sailNumber) ? 'Sign-up' : 'Add dinghy & sign-up'}</button>
        </form>
    )
}

export default SignUp;

