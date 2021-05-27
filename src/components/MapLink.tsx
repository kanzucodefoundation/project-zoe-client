import React from "react";

interface IProps {
  value: string;
  title: string;
}
const MapLink = ({ value, title }: IProps) => {
  const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    title
  )}&query_place_id=${value}`;
  return (
    <a
      style={{ textDecoration: "none" }}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
    >
      {title}
    </a>
  );
};

export default MapLink;
