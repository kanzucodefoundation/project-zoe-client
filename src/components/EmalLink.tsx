import React from 'react';
interface IProps {
    value:string
}
const EmailLink = ({value}:IProps) => (
    <a style={{textDecoration:'none'}} href={`mailto:${value}`}>{value}</a>
);

export default EmailLink
