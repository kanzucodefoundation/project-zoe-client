import React from 'react';
import InfoMessage from '../../components/messages/InfoMessage';

export default {
  title: 'Info Message',
  component: InfoMessage,
};

export const Basic = () => <InfoMessage text="Hello World"/>;
export const Complex = () => <InfoMessage text={<span role="img" aria-label="so cool">
😀 😎 👍 💯
</span>}/>;
