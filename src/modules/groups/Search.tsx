import React from "react";

export const Search = (props:any) => {
    return <form
        style={{ display: 'inline-block' }}
        onSubmit={event => {
            event.preventDefault();
        }}
    >
        <input
            id="find-box"
            type="text"
            placeholder="Search..."
            style={{ fontSize: '1rem' }}
            value={props.searchString}
            onChange={event =>
                props.onChange(event.target.value)
            }
        />

        <button
            type="button"
            disabled={!props.searchFoundCount}
            onClick={props.selectPrevMatch}
        >
            &lt;
        </button>

        <button
            type="submit"
            disabled={!props.searchFoundCount}
            onClick={props.selectNextMatch}
        >
            &gt;
        </button>
    </form>
}
