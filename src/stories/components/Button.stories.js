import React from "react";
import { storiesOf } from "@storybook/react";
import Button from '../components/Button';
storiesOf('Button', module)
    .add('primary', () => <Button primary label="primary" />)
    .add('secondary', () => <Button primary={false} label="secondary" />)
    .add('plain', () => <Button plain label="plain" />)
    .add('Disabled', () => <Button disabled label="Disabled" />);
