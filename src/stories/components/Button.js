import React from 'react';
import { Button as GrommetBtn } from 'grommet';


class Button extends React.Component {
    render() {
        return (
            //<GrommetBtn label="default" />
            //To ensure our button component receives any props passed to it from Button.stories.js
            <GrommetBtn label={this.props.label} {...this.props} />
        );
    }
}

export default Button;