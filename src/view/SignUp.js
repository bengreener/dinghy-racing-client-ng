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
    const [sailNumber, setSailNumber] = useState('');
    const [dinghyClassName, setDinghyClassName] = useState('');
    const [result, setResult] = useState({'message': ''});
    const [competitorMap, setCompetitorMap] = useState(new Map());
    const [competitorOptions, setCompetitorOptions] = useState([]);
    const [dinghyClassMap, setDinghyClassMap] = React.useState(new Map());
    const [dinghyClassOptions, setDinghyClassOptions] = React.useState([]);
    const [dinghyMap, setDinghyMap] = React.useState(new Map());
    const [dinghyOptions, setDinghyOptions] = React.useState([]);

    const clear = React.useCallback(() => {
        setCompetitorName('');
        setSailNumber('');
        setDinghyClassName('');
        showMessage('');
    }, []);

    // get competitors
    React.useEffect(() => {
        model.getCompetitors().then((result) => {
            if (result.success) {
                const competitorMap = new Map();
                const options = [];
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

    // get dinghy classes
    React.useEffect(() => {
        model.getDinghyClasses().then(result => {
            if (result.success) {
                // build dinghy class options
                let options = [];
                let map = new Map();
                // set handicap options
                options.push(<option key={''} value={''}></option> );
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

    // get dinghies
    React.useEffect(() => {
        let dinghyClass = race.dinghyClass;
        if (!dinghyClass && dinghyClassMap.has(dinghyClassName)) {
            dinghyClass = dinghyClassMap.get(dinghyClassName);
        }
        model.getDinghies(dinghyClass).then(result => {
            if (result.success) {
                let options = [];
                let map = new Map();
                options.push(<option key={''} value = {''}></option>);
                result.domainObject.forEach(dinghy => {
                    options.push(<option key={dinghy.sailNumber} value={dinghy.sailNumber}>{dinghy.sailNumber}</option>)
                    map.set(dinghy.sailNumber, dinghy);
                });
                setDinghyMap(map);
                setDinghyOptions(options);
            }
            else {
                showMessage('Unable to load dinghies\n' + result.message);
            }
        })
    }, [model, race.dinghyClass, dinghyClassName, dinghyClassMap]);

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
            setSailNumber(target.value);
        }
        if (target.name === 'competitor') {
            setCompetitorName(target.value);
        }
        if (target.name === 'dinghyClass') {
            setDinghyClassName(target.value);
        }
    }

    async function handleCreate(event) {
        event.preventDefault();        
        const creationPromises = [];
        // handle creation of 
        if (!competitorMap.has(competitorName)) {
            creationPromises.push(controller.createCompetitor({'name': competitorName, 'url': ''}));
        }
        else {
            creationPromises.push(Promise.resolve({'success': true}));
        }
        if (!dinghyMap.has(sailNumber)) {
            creationPromises.push(controller.createDinghy({'sailNumber': sailNumber, 'dinghyClass': dinghyClassMap.get(dinghyClassName), 'url': ''}));
        }
        else {
            creationPromises.push(Promise.resolve({'success': true}));
        }
        const creationResults = await Promise.all(creationPromises);
        if (creationResults[0].success && creationResults[1].success) {
            setResult(await controller.signupToRace(race, 
                competitorMap.has(competitorName) ? competitorMap.get(competitorName) : {'name': competitorName, 'url': ''}, 
                dinghyMap.has(sailNumber) ? dinghyMap.get(sailNumber) : {'sailNumber': sailNumber, 'dinghyClass': dinghyClassMap.get(dinghyClassName), 'url': ''}
            ));
        }
        else if (!creationResults[0].success && !creationResults[1].success) {
            setResult({'success': false, 'message': creationResults[0].message + '\n' + creationResults[1].message});
        }
        else if (!creationResults[0].success) {
            setResult({'success': false, 'message': creationResults[0].message});
        }
        else if (!creationResults[1].success) {
            setResult({'success': false, 'message': creationResults[1].message});
        }
    }

    function dinghyClassInput(race) {
        let dinghyClassInput = null;    
        if (!race.dinghyClass) {
            dinghyClassInput = (
                <>
                    <label htmlFor="dinghy-class-select">Dinghy Class</label>
                    <select id="dinghy-class-select" name="dinghyClass" multiple={false} onChange={handleChange} value={dinghyClassName} >{dinghyClassOptions}</select>
                </>
            );
        }
        // if race has a specified dinghy class then set for selected dinghy as well
        else if (!dinghyClassName) {
            setDinghyClassName(race.dinghyClass.name);
        }
        return dinghyClassInput;
    }

    function showMessage(message) {
        const output = document.getElementById('entry-message-output');
        output.value = message;
    }

    function getButtonText() {
        if (!competitorMap.has(competitorName) && !dinghyMap.has(sailNumber)) {
            return 'Add competitor & dinghy & sign-up';
        }
        if (!competitorMap.has(competitorName)) {
            return 'Add competitor & sign-up';
        }
        if (!dinghyMap.has(sailNumber)) {
            return 'Add dinghy & sign-up';
        }
        return 'Sign-up';
    }

    return (
        <form action="" method="get">
            <datalist id="competitor-datalist">{competitorOptions}</datalist>
            <label htmlFor="competitor-input">Competitor's Name</label>
            <input id="competitor-input" name="competitor" list="competitor-datalist" onChange={handleChange} value={competitorName} />
            {dinghyClassInput(race)}
            <datalist id="dinghy-datalist">{dinghyOptions}</datalist>
            <label htmlFor="sail-number-input">Sail Number</label>
            <input id="sail-number-input" name="sailNumber" list="dinghy-datalist" onChange={handleChange} value={sailNumber} />
            <output id="entry-message-output" />
            <button id="entry-create-button" type="button" onClick={handleCreate} >{getButtonText()}</button>
        </form>
    )
}

export default SignUp;
