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
    const [helmName, setHelmName] = useState('');
    const [crewName, setCrewName] = useState('');
    const [sailNumber, setSailNumber] = useState('');
    const [dinghyClassName, setDinghyClassName] = useState('');
    const [dinghyClassHasCrew, setDinghyClassHasCrew] = useState(false);
    const [result, setResult] = useState({'message': ''});
    const [competitorMap, setCompetitorMap] = useState(new Map());
    const [competitorOptions, setCompetitorOptions] = useState([]);
    const [dinghyClassMap, setDinghyClassMap] = React.useState(new Map());
    const [dinghyClassOptions, setDinghyClassOptions] = React.useState([]);
    const [dinghyMap, setDinghyMap] = React.useState(new Map());
    const [dinghyOptions, setDinghyOptions] = React.useState([]);
    const [entriesTable, setEntriesTable] = React.useState([]);

    const clear = React.useCallback(() => {
        setHelmName('');
        setCrewName('');
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
                    options.push(<option key={dinghy.dinghyClass.name + dinghy.sailNumber} value={dinghy.sailNumber}>{dinghy.sailNumber}</option>)
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

    // build entries table
    React.useEffect(() => {
        model.getEntriesByRace(race).then(result => {
            if (result.success) {
                const rows = result.domainObject.map(entry => {
                    return <tr key={entry.helm.name}>
                        <td key={'helm'}>{entry.helm.name}</td>
                        <td key={'sailNumber'}>{entry.dinghy.sailNumber}</td>
                        <td key={'dinghyClass'}>{entry.dinghy.dinghyClass.name}</td>
                        {(!race.dinghyClass || race.dinghyClass.crewSize > 1) ? <td key={'crew'}>{entry.crew ? entry.crew.name : ''}</td> : null}
                    </tr>
                });
                setEntriesTable(<table>
                    <thead>
                        <tr>
                            <th key="helm">Helm</th>
                            <th key="sailNumber">Sail Number</th>
                            <th key="dinghyClass">Class</th>
                            {(!race.dinghyClass || race.dinghyClass.crewSize > 1) ? <th key="crew">Crew</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                    </table>);
            }
            else {
                showMessage('Unable to load race entries\n' + result.message);
            }
        });
    }, [race, model, result]);
    
    // if error display message 
    React.useEffect(() => {
        if (result && result.success) {
            clear();
        }
        if (result && !result.success) {
            showMessage(result.message);
        }
    }, [result, clear]);

    // check if dinghy class has crew
    React.useEffect(() => {
        if (race.dinghyClass) {
            setDinghyClassHasCrew(race.dinghyClass.crewSize > 1);
        }
        else if (dinghyClassName) {
            setDinghyClassHasCrew(dinghyClassMap.get(dinghyClassName).crewSize > 1);
        }
        else {
            setDinghyClassHasCrew(false);
        }
    }, [race, dinghyClassName, dinghyClassMap]);
    
    function handleChange({target}) {
        if (target.name === 'sailNumber') {
            setSailNumber(target.value);
        }
        if (target.name === 'helm') {
            setHelmName(target.value);
        }
        if (target.name === 'crew') {
            setCrewName(target.value);
        }
        if (target.name === 'dinghyClass') {
            setDinghyClassName(target.value);
        }
    }

    async function handleCreate(event) {
        event.preventDefault();        
        const creationPromises = [];
        // handle creation of 
        if (!competitorMap.has(helmName)) {
            creationPromises.push(controller.createCompetitor({'name': helmName, 'url': ''}));
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
        if (crewName && !competitorMap.has(crewName)) {
            creationPromises.push(controller.createCompetitor({'name': crewName, 'url': ''}));
        }
        else {
            creationPromises.push(Promise.resolve({'success': true}));
        }
        const creationResults = await Promise.all(creationPromises);
        let success = true;
        let message = '';
        creationResults.forEach(result => {
            if (!result.success) {
                if (message) {
                    message =+ '/n';
                }
                success = result.success;
                message =+ message;
            }
        });
        if (success) {
            const helm = competitorMap.has(helmName) ? competitorMap.get(helmName) : {'name': helmName, 'url': ''};
            const dinghy = dinghyMap.has(sailNumber) ? dinghyMap.get(sailNumber) : {'sailNumber': sailNumber, 'dinghyClass': dinghyClassMap.get(dinghyClassName), 'url': ''};
            const crew = crewName ? (competitorMap.has(crewName) ? competitorMap.get(crewName) : {'name': crewName, 'url': ''}) : null;
            if (crew) {
                setResult(await controller.signupToRace(race, helm, dinghy, crew));
            }
            else {
                setResult(await controller.signupToRace(race, helm, dinghy));
            }
        }
        else {
            setResult({'success': false, 'message': message});
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

    function crewInput() {
        let crewInput = null;
        if (dinghyClassHasCrew) {
            crewInput = (
                <>
                    <label htmlFor="crew-input">Crew's Name</label>
                    <input id="crew-input" name="crew" list="competitor-datalist" onChange={handleChange} value={crewName} />
                </>
            );
        };
        return crewInput;
    }

    function showMessage(message) {
        const output = document.getElementById('entry-message-output');
        output.value = message;
    }

    function getButtonText() {
        if (!competitorMap.has(helmName) && (crewName && !competitorMap.has(crewName)) && !dinghyMap.has(sailNumber)) {
            return 'Add helm & crew & dinghy & sign-up';
        }
        if (!competitorMap.has(helmName) && !dinghyMap.has(sailNumber)) {
            return 'Add helm & dinghy & sign-up';
        }
        if ((crewName && !competitorMap.has(crewName)) && !dinghyMap.has(sailNumber)) {
            return 'Add crew & dinghy & sign-up';
        }
        if (!competitorMap.has(helmName) && !competitorMap.has(crewName)) {
            return 'Add helm & crew & sign-up';
        }
        if (!competitorMap.has(helmName)) {
            return 'Add helm & sign-up';
        }
        if (crewName && !competitorMap.has(crewName)) {
            return 'Add crew & sign-up';
        }
        if (!dinghyMap.has(sailNumber)) {
            return 'Add dinghy & sign-up';
        }
        return 'Sign-up';
    }

    return (
        <form action="" method="get">
            <datalist id="competitor-datalist">{competitorOptions}</datalist>
            <label htmlFor="helm-input">Helm's Name</label>
            <input id="helm-input" name="helm" list="competitor-datalist" onChange={handleChange} value={helmName} />
            {crewInput()}
            {dinghyClassInput(race)}
            <datalist id="dinghy-datalist">{dinghyOptions}</datalist>
            <label htmlFor="sail-number-input">Sail Number</label>
            <input id="sail-number-input" name="sailNumber" list="dinghy-datalist" onChange={handleChange} value={sailNumber} />
            <output id="entry-message-output" />
            <button id="entry-create-button" type="button" onClick={handleCreate} >{getButtonText()}</button>
            <h3>Signed-up</h3>
            {entriesTable}
        </form>
    )
}

export default SignUp;

