import React from 'react';

function CreateRace() {
    return (
        <form action="" method="post">
            <label htmlFor="race-name-input">Race Name</label>
            <input id="race-name-input" name="name" type="text" /> {/* onChange={handleChange} value={dinghyClass.name} /> */}
            <label htmlFor="race-time-input">Race Time</label>
            <input id="race-time-input" name="time" type="datetime-local" /> {/*onChange={handleChange} value={dinghyClass.name} /> */}
            <label htmlFor="race-name-input">Race Class</label>
            <input id="race-class-input" name="class" type="text" /> {/* onChange={handleChange} value={dinghyClass.name} /> */}
        </form>
    );
}

export default CreateRace;