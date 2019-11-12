import React from 'react';
interface IProps {
    value:string
}
const PhoneLink = ({value}:IProps) => (
    <a href={`tel:${value}`}>{value}</a>
);

export default PhoneLink
