import React, { useEffect, useState } from 'react';
import { GoogleMap, InfoWindow, LoadScript, Marker } from '@react-google-maps/api';
import { IGroup } from "./types";

interface IGroupMarkers {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface IProps {
  data: IGroupMarkers[];
}

const GroupMapView = ({ data }: IProps) => {
  const [selected, setSelected] = useState<IGroupMarkers>({
    name: '',
    location: {
      lat: 0,
      lng: 0,
    },
  });

  const [currentPosition, setCurrentPosition] = useState({
    lat: 0.3132008,
    lng: 32.5290855
  });

  const success = (position: any) => {
    const currentPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    setCurrentPosition(currentPosition);
  };

  const onSelect = (item: any) => {
    setSelected(item);
  };
  const mapStyles = {
    height: '100vh',
    width: '100%',
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(success);
  });

  const myKey = process.env.REACT_APP_GOOGLE_KEY;
  const key = String(myKey);

  return (
    <LoadScript googleMapsApiKey={key}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={13}
        center={currentPosition}
      >
        {data.map((address) => {
          return (
            <Marker
              key={address.name}
              clickable={true}
              position={address.location}
              onClick={() => onSelect(address)}
            />
          );
        })}
        {selected.location && (
          <InfoWindow position={selected.location}>
            <p>{selected.name}</p>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GroupMapView;
