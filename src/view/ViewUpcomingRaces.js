import React, { useContext, useEffect, useState } from 'react';
import { ModelContext } from './ModelContext';

function ViewUpcomingRaces() {
    const model = useContext(ModelContext);
    // const [races, setRaces] = useState([]);
    const [rows, setRows] = useState();


    useEffect(() => {
        model.getRacesOnOrAfterTime(new Date).then(result => {
            if (result.success) {
                // setRaces(result.domainObject);
                const races = result.domainObject;
                setRows(races.map(race => <tr><td>{race.name}</td><td>{race.dinghyClass ? race.dinghyClass.name : ''}</td><td>{race.time.toLocaleString()}</td></tr>));
            }
        });
    }, [])

    return (
        <table>
            <thead>
                <tr>
                    <th>Race</th><th>Class</th><th>Start Time</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    );
}

export default ViewUpcomingRaces;