import { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';

/**
 * Display a list of competitors and enable editing of the details for a selected competitor
 * @param {Object} props
 * @returns {HTMLDivElement}
 */
function CompetitorsConsole() {
    const model = useContext(ModelContext);
    const [competitorsMap, setCompetitorsMap] = useState(new Map());
    const [message, setMessage] = useState('');

    // get competitors
    useEffect(() => {
        let ignoreFetch = false; // set to true if RaceEntriewView rerendered before fetch completes to avoid using out of date result
        model.getCompetitors().then(result => {
            if (!ignoreFetch && !result.success) {
                setMessage('Unable to load competitors\n' + result.message);
            }
            else if (!ignoreFetch) {
                const map = new Map();
                result.domainObject.forEach(competitor => {
                    map.set(competitor.url, competitor);
                });
                setCompetitorsMap(map);
            }
        });
        // cleanup before effect runs and before form close
        return () => {
            ignoreFetch = true;
            setMessage(''); // clear any previous message
        }
    }, [model])

    return (
        <div>
            <h1>Competitors</h1>
            <p id="competitor-console-message" className={!message ? "hidden" : ""}>{message}</p>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Competitors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {competitorsMap.forEach((key, competitor) => <td key={key} id={key} >{competitor.name}</td>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CompetitorsConsole;