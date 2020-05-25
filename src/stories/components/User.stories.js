import React from "react";
import { storiesOf } from "@storybook/react";
//import { Button, styles } from "@material-ui/core/Button"
import { grommet, Box, Button, Form, Text, Grommet, TextInput } from "grommet";



const LabelTextInput = () => (
    <Grommet theme={grommet}>
        <Box align="center" pad="large">
            <Form>
                <h2>User Login</h2>
                <TextInput
                    name="username" 
                    label="username" 
                    placeholder="username" 
                    autoComplete="off"
                    margin="normal"
                    required
                />
                    <br/>
                <TextInput
                    type='password'
                    name='password'
                    label='Password'
                    autoComplete="off"
                    margin="normal"
                    placeholder="password"
                    required
                />
                <br/>
                <Button type="submit" color="#0097A7">submit</Button>
                <Text margin={{ left: "small" }} size="small">
                
        </Text>
            </Form>
        </Box>
    </Grommet>
);

storiesOf("Form", module).add("User Login", () => <LabelTextInput />);