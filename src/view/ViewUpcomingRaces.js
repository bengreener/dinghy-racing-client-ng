import React, { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';

/**
 * Show races that are scheduled to be held
 * @param {Object} props
 * @param {ViewUpcomingRaces~showSignUpForm} props.showSignUpForm A function that will result in a sign up form for a race being displayed
 * @returns {HTMLElement}
 */
function ViewUpcomingRaces({ showSignUpForm = false }) {
    const model = useContext(ModelContext);
    const [raceMap, setRaceMap] = useState(new Map());  
    const [message, setMessage] = useState('');

    function handleRowClick({currentTarget}) {
        if (showSignUpForm) {
            showSignUpForm(raceMap.get(currentTarget.id));
        }
    }

    useEffect(() => {
        model.getRacesOnOrAfterTime(new Date()).then(result => {
            if (result.success) {
                let map = new Map();
                const races = result.domainObject;
                races.forEach(race => {
                    map.set(race.url, race);
                });
                setRaceMap(map);
            }
            else {
                setMessage('Unable to load races\n' + result.message);
            }
        });
    }, [model])

    return (
        <>
        <table>
            <thead>
                <tr>
                    <th>Race</th><th>Class</th><th>Start Time</th>
                </tr>
            </thead>
            <tbody>
                {Array.from(raceMap.values()).map(race => <tr key={race.url} id={race.url} onClick={handleRowClick}><td>{race.name}</td><td>{race.dinghyClass ? race.dinghyClass.name : ''}</td><td>{race.plannedStartTime.toLocaleString()}</td></tr>)}
            </tbody>
        </table>
        <p id="view-upcoming-races-message" className={!message ? "hidden" : ""}>{message}</p>
        </>
    );
}

export default ViewUpcomingRaces;

/**
 * @callback ViewUpcomingRaces~showSignUpForm
 * @param {Race} race The race to sign up to
 */