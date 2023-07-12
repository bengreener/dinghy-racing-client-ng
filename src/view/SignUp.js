import React from 'react';

/**
 * Form for signing up to a race
 * @param {Object} props
 * @param {Race} props.race The race to sign up to
 * @returns {HTMLFormElement}
 */
function SignUp({ race }) {
    
    function dinghyClass(race) {
        let dinghyClass = null;
    
        if (!race.dinghyClass) {
            dinghyClass = (
                <>
                    <label htmlFor="dinghy-class-input">Dinghy Class</label>
                    <input id="dinghy-class-input" name="dinghyClass" type="text" />
                </>
            )
        }
        return dinghyClass;
    }

    return (
        <form action="" method="get">
            <label htmlFor="competitor-input">Competitor's Name</label>
            <input id="competitor-input" name="competitor" type="text" />
            {dinghyClass(race)}
            <label htmlFor="sail-number-input">Sail Number</label>
            <input id="sail-number-input" name="sailNumber" type="text" />
        </form>
    )
}

export default SignUp;

