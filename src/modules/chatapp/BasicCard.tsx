import { Card, CardContent } from "@material-ui/core";
import * as React from "react";

interface Tprops {
  name:any;
  text:any
}


export default function BasicCard(props:Tprops) {
  return (
    <Card>
      <CardContent>
        <span>{props.name}</span>
        <p>{props.text}</p>
      </CardContent>
    </Card>
  );
}
