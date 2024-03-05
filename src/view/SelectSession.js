function SelectSession({ sessionStart, sessionEnd, handleSessionStartChange, handleSessionEndChange }) {
    return (
        <div>
            <label htmlFor="select-session-start">Session Start</label>
            <input id="select-session-start" name="sessionStartTime" type="datetime-local" onChange={handleSessionStartChange} value={sessionStart} />
            <label htmlFor="select-session-end">Session End</label>
            <input id="select-session-end" name="sessionEndTime" type="datetime-local" onChange={handleSessionEndChange} value={sessionEnd} />
        </div>
    )
}

export default SelectSession;