import React from 'react';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';

import withScriptjs from 'react-google-maps/lib/withScriptjs';
import withGoogleMap from 'react-google-maps/lib/withGoogleMap';
import GoogleMap from 'react-google-maps/lib/components/GoogleMap';
import Marker from 'react-google-maps/lib/components/Marker';

import { googleMapOptions } from 'site/common';

const resolveStyles = (styles) => {
  if (typeof styles === 'object') {
    return styles;
  }
  try {
    return JSON.parse(styles);
  } catch (e) {
    return [];
  }
};

const Map = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${googleMapOptions.key}&v=3.exp&libraries=geometry,drawing,places`,
  }),
  withScriptjs,
  withGoogleMap,
)((props) => {
  const { isMarkerShown, map: { styles, zoom, marker: { lat, lng, icon, url } }, mapOptions, markerChild, markerOptions } = props;

  return (
    <GoogleMap
      zoom={zoom ? parseInt(zoom, 10) : 0}
      center={{ lat, lng }}
      defaultOptions={{ styles }}
      options={{ styles: resolveStyles(styles), ...mapOptions }}
    >
      {isMarkerShown && (
        <React.Fragment>
          <Marker
            options={{ icon, scaledSize: [10, 10] }}
            onClick={() => { if (url) window.open(url, '_blank'); }}
            position={{ lat, lng }}
            {...markerOptions}
          >
            {markerChild}
          </Marker>
        </React.Fragment>
      )}
    </GoogleMap>
  );
});

Map.defaultProps = {
  isHomePageMap: false,
};

export default Map;
