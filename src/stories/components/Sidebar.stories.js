import React, { useState } from "react";
import { storiesOf } from "@storybook/react";

import { grommet, Box, Button, Grommet, Nav, Text } from "grommet";

const SidebarButton = ({ label, ...rest }) => (
    <Button plain {...rest}>
        {({ hover }) => (
            <Box
                //background={hover ? "" : undefined}
                pad={{ horizontal: "small", vertical: "medium" }}
            >
                
                { label} 
                

            </Box>
        )}
    </Button>
);

const SidebarNav = () => {
    //const [active, setActive] = useState();
    return (
        <Grommet full theme={grommet}>
            <Box fill direction="row">
                <Nav background="#212121" width="90px" height="230px" Text color="#FFFF">
                    {["angie userLogin"].map(label => (
                        <SidebarButton
                        
                            label={label} 
                        />
                    ))}
                </Nav>
            </Box>
        </Grommet>
    );
};

storiesOf("Nav", module).add("Sidebar", () => <SidebarNav />);