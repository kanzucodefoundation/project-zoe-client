import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import First from '../components/First';
storiesOf('First', module)
.add('getting started', () => <First />);