import { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import ControllerContext from './ControllerContext';

/**
 * Display a list of competitors and enable editing of the details for a selected competitor
 * @param {Object} props
 * @returns {HTMLDivElement}
 */
function CompetitorsConsole() {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [competitorsMap, setCompetitorsMap] = useState(new Map());
    const [selectedCompetitor, setSelectedCompetitor] = useState();
    const [competitorName, setCompetitorName] = useState();
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

    async function updateCompetitor(competitor, name) {
        const result = await controller.updateCompetitor(selectedCompetitor, competitorName);
        if (result.success) {
            clearSelectedCompetitor();
        }
        else {
            setMessage(result.message);
        }
    }

    function clearSelectedCompetitor() {
        setSelectedCompetitor(null);
        setCompetitorName('');
        setMessage('');
    }
    function handleCompetitorRowClick({ currentTarget }) {
        const competitor = competitorsMap.get(currentTarget.id);
        setSelectedCompetitor(competitor);
        setCompetitorName(competitor.name);
        setMessage('');
    };

    function handleNameChange( { target }) {
        setCompetitorName(target.value);
    }

    function handleUpdateButtonClick() {
        updateCompetitor(selectedCompetitor, competitorName);
    }

    function competitorRows() {
        const rows = [];
        competitorsMap.forEach((competitor, key) => {
            rows.push(<tr key={key} id={key} onClick={handleCompetitorRowClick} ><td>{competitor.name}</td></tr>);
        });
        return rows;
    };

    return (
        <div className="competitors-console">
            <h1>Competitors</h1>
            <p id="competitor-console-message" className={!message ? "hidden" : ""}>{message}</p>
            {selectedCompetitor ? <label htmlFor="name-input" >Name</label> : null}
            {selectedCompetitor ? <input id="name-input" type="text" name="name" value={competitorName} onChange={handleNameChange} /> : null}
            {selectedCompetitor ? <button type='button' onClick={handleUpdateButtonClick} >Update</button> : null}
            {selectedCompetitor ? <button type='button' onClick={clearSelectedCompetitor} >Cancel</button> : null}
            <div className="scrollable">
                <table>
                    <thead>
                        <tr>
                            <th>Competitors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {competitorRows()}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CompetitorsConsole;