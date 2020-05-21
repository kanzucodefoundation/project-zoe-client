import React from 'react';
import { storiesOf } from '@storybook/react';

import Name from './Name';
storiesOf('Components', module)
    .add('Name', () => (
        <div>
            <h2>Normal</h2>
            <Name name="Rety Adonai" />
            <h2>Highlighted</h2>
            <Name name="Rety Adonai" type="highlight" />
            <h2>Disabled</h2>
            <Name name="Rety Adonai" type="disabled" />
        </div>
    ))
