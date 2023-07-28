import React from 'react';
import { useContext, useState } from 'react';
import ControllerContext from './ControllerContext';
/**
 * Form for signing up to a race
 * @param {Object} props
 * @param {Race} props.race The race to sign up to
 * @returns {HTMLFormElement}
 */
function SignUp({ race }) {
    const controller = useContext(ControllerContext);
    const [competitor, setCompetitor] = useState({'name': '', 'url': ''});
    const [dinghy, setDinghy] = useState({'sailNumber': '', 'dinghyClass': {'name': '', 'url': ''}, 'url': ''});
    const [result, setResult] = useState({'message': ''});

    const clear = React.useCallback(() => {
        setCompetitor({'name': ''});
        setDinghy({'sailNumber': '', 'dinghyClass': {'name': '', 'url': ''}, 'url': ''});
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
    
    function handleChange({target}) {
        if (target.name === 'sailNumber') {
            setDinghy({...dinghy, 'sailNumber': target.value});
        }
        if (target.name === 'competitor') {
            setCompetitor({...competitor, 'name': target.value});
        }
        if (target.name === 'dinghyClass') {
            setDinghy({...dinghy, 'dinghyClass': {...dinghy.dinghyClass, 'name': target.value}});
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
                    <label htmlFor="dinghy-class-input">Dinghy Class</label>
                    <input id="dinghy-class-input" name="dinghyClass" type="text" onChange={handleChange} value={dinghy.dinghyClass.name} />
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
            <label htmlFor="competitor-input">Competitor's Name</label>
            <input id="competitor-input" name="competitor" type="text" onChange={handleChange} value={competitor.name} />
            {dinghyClass(race)}
            <label htmlFor="sail-number-input">Sail Number</label>
            <input id="sail-number-input" name="sailNumber" type="text" onChange={handleChange} value={dinghy.sailNumber}/>
            <output id="entry-message-output" />
            <button id="entry-create-button" type="button" onClick={handleCreate} >Create</button>
        </form>
    )
}

export default SignUp;

