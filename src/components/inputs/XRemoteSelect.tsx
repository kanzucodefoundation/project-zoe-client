import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {search} from "../../utils/ajax";
import {remoteRoutes} from "../../data/constants";


interface PlaceType {
    structured_formatting: {
        secondary_text: string;
        main_text_matched_substrings: [
            {
                offset: number;
                length: number;
            }
        ];
    };
}


interface IProps {

}

export default function XRemoteSelect() {
    const [loading, setLoading] = React.useState(false);
    const [options, setOptions] = React.useState<PlaceType[]>([]);
    const handleInputChange = (event: React.ChangeEvent<any>) => {
        if (!event)
            return
        setLoading(true)
        search(remoteRoutes.contactsPerson, {query:event.target.value},
            resp => {
                const data = resp.map(({id, fullName}: any) => ({id, label: fullName}))
                setOptions(data)
            },
            undefined,
            () => {
                setLoading(false)
            })
    }

    const handleChange = (event: React.ChangeEvent<any>, value: any) => {

        console.log("Value changed", value)
    }

    return (
        <Autocomplete
            style={{width: 300}}
            getOptionLabel={option => option.label}
            filterOptions={x => x}
            options={options}
            onChange={handleChange}
            autoComplete
            includeInputInList
            freeSolo
            disableOpenOnFocus
            onInputChange={handleInputChange}
            renderInput={params => (
                <TextField
                    {...params}
                    label="Add a location"
                    variant="outlined"
                    fullWidth
                />
            )}
        />
    );
}
