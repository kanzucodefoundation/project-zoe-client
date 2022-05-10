import React from 'react';

interface IProps {
    data: any
}

const CodeView = ({data}: IProps) => {
    return (
        <div style={{width: 500, margin: '0 auto', padding: 30}}>
            <pre style={{width: '100%'}}>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}

export default CodeView;
