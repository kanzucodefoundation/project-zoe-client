import React from "react";
import { storiesOf } from "@storybook/react";

import { Anchor, Box, Grommet, Header } from "grommet";
import { grommet } from "grommet/themes";


const UserLogin = () => (
    <Grommet theme={grommet}>
        <Header background="#0097A7" width="380px" height="30px" pad="small">
            
            <Box direction="row" gap="medium">
                
                <Anchor label="Register" Text color="black" href="#" />
            </Box>
        </Header>
    </Grommet>
);

storiesOf("Header", module)
.add("UserLogin", () => <UserLogin />);