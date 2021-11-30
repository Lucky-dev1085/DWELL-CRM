import React, { FC } from 'react';
import { compose, withProps, lifecycle } from 'recompose';
import { FormGroup, Input } from 'reactstrap';
import { withScriptjs } from 'react-google-maps';

import StandaloneSearchBox from 'react-google-maps/lib/components/places/StandaloneSearchBox';
import { googleMapOptions } from 'site/common';
import { Tooltip } from 'site/components';
import { ErrorMessage, FormLabel } from 'site/components/common';

interface Refs {
  searchBox?: { getPlaces?: () => void },
}

interface GeolocationProps {
  label?: string,
  inputProps?: {
    placeholder?: string,
    disabled?: boolean,
    onChange?: (data: { target: { id: string, value: string | number } }) => void,
    defaultValue?: string
  },
  hideTooltip?: boolean,
  invalid?: string,
  setLocation: (places?: string[]) => void,
  address?: string,
}

const Geolocation: FC<GeolocationProps> = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${googleMapOptions.key}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div style={{ height: '100%' }} />,
    containerElement: <div style={{ height: '400px' }} />,
  }),
  lifecycle({
    componentWillMount() {
      const { props: { setLocation } } = this;
      const refs = {} as Refs;

      this.setState({
        places: [],
        onSearchBoxMounted: (ref) => {
          refs.searchBox = ref;
        },
        onPlacesChanged: () => {
          const places = refs.searchBox.getPlaces();

          this.setState(
            {
              places,
            },
            () => {
              setLocation(places);
            },
          );
        },
      });
    },
  }),
  withScriptjs,
)(props => (
  <FormGroup>
    <div data-standalone-searchbox="">
      <StandaloneSearchBox
        ref={props.onSearchBoxMounted}
        bounds={props.bounds}
        onPlacesChanged={props.onPlacesChanged}
      >
        <div>
          <div className="d-flex">
            <FormLabel className="w-100 uppercase mb-10" htmlFor="mapZoom">{props.label}</FormLabel>
            {!props.hideTooltip && <Tooltip section="HOME" selector="marker.location" />}
          </div>
          <Input
            type="text"
            className="mb-1"
            isInvalid={props.invalid}
            defaultValue={props.address}
            {...props.inputProps}
          />
          {props.invalid && <ErrorMessage>{props.invalid}</ErrorMessage>}
        </div>
      </StandaloneSearchBox>
    </div>
  </FormGroup>
));

Geolocation.defaultProps = {
  label: 'Marker location',
  inputProps: {},
  hideTooltip: false,
  invalid: '',
  address: '',
};

export default Geolocation;
