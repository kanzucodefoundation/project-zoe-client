import * as React from "react";

const GridWrapper = (props: any) => <div style={{padding: props.padding || 8}}>
    {props.children}
</div>

export default GridWrapper