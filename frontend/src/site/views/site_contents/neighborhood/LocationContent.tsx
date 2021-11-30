import React, { useState, useEffect, FC } from 'react';
import { CardBody, CardHeader } from 'reactstrap';
import clone from 'lodash/clone';
import { CardSiteLogo, SiteTable, CardTitle, ActionCardText } from 'site/components/common';
import { ButtonControls, LinkToWebstite } from 'site/views/site_contents/neighborhood/styles';
import { Image } from 'site/components';
import { NeighborHoodPageData, DetailResponse, Location } from 'src/interfaces';
import DeleteModal from './DeleteModal';
import EditModal from './EditModal';
import LocationModal from './LocationModal';

interface LocationContentProps {
  formValues: NeighborHoodPageData,
  handlePageDataUpdate: (data: NeighborHoodPageData, message: string) => Promise<DetailResponse>,
  handleImageUpload: (image: string) => Promise<string>,
}

const locationContentPropChange = (prev, next) => prev.formValues.locations === next.formValues.locations;

const LocationContent: FC<LocationContentProps> = React.memo(({ formValues, handlePageDataUpdate, handleImageUpload }) => {
  const [isLocationModalOpen, toggleLocationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsSubmitting(false);
  }, [formValues]);

  const geocodeAddress = (address) => {
    const { google } = window;
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          return resolve({ lat, lng });
        }
        return resolve(null);
      });
    });
  };

  const handlePropertyLocationChange = (locations) => {
    locations.forEach((loc) => {
      loc.isPropertyLocation = false; // eslint-disable-line no-param-reassign
    });
  };

  const handleLocationAdd = (data) => {
    const clonedPageData = clone(formValues);
    setIsSubmitting(true);
    return handleImageUpload(data.image).then((imageUrl) => {
      const newLocation = { ...data, image: imageUrl } as Location;
      if (data.isPropertyLocation) {
        handlePropertyLocationChange(clonedPageData.locations);
      }
      return geocodeAddress(data.address).then((position) => {
        newLocation.addressGeoPosition = position;
        clonedPageData.locations.push(newLocation);
        return handlePageDataUpdate(clonedPageData, 'Location added');
      });
    });
  };

  const handleLocationEdit = (data, index) => {
    const clonedPageData = clone(formValues);
    let currentLocation = { ...clonedPageData.locations[index], ...data };
    setIsSubmitting(true);
    if (data.isPropertyLocation) {
      handlePropertyLocationChange(clonedPageData.locations);
    }

    return geocodeAddress(data.address).then(async (position) => {
      let imageUrl = '';
      if (data.image.name) imageUrl = await handleImageUpload(data.image);
      currentLocation = { ...currentLocation, addressGeoPosition: position, image: imageUrl || data.image };
      clonedPageData.locations[index] = currentLocation;

      return handlePageDataUpdate(clonedPageData, 'Updated location');
    });
  };

  const handleLocationDelete = (index) => {
    const clonedPageData = clone(formValues);
    clonedPageData.locations.splice(index, 1);
    return handlePageDataUpdate(clonedPageData, 'Deleted location');
  };

  const { categories, locations } = formValues;

  return (
    <CardSiteLogo>
      <CardHeader>
        <CardTitle>Locations</CardTitle>
        <ActionCardText onClick={() => toggleLocationModal(!isLocationModalOpen)}>
          <i className="ri-map-pin-line" />
          Add Location
        </ActionCardText>
        {
          isLocationModalOpen && (
            <LocationModal
              isModalOpen={isLocationModalOpen}
              onModalToggle={() => toggleLocationModal(!isLocationModalOpen)}
              submitting={isSubmitting}
              onSubmit={handleLocationAdd}
              categories={categories}
            />
          )
        }
      </CardHeader>
      <CardBody className="p-0 px-4">
        <SiteTable>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Name</th>
              <th style={{ width: '10%' }}>Image</th>
              <th style={{ width: '20%' }}>Phone Number</th>
              <th style={{ width: '20%' }}>Address</th>
              <th style={{ width: '15%' }} className="text-center">Website</th>
              <th style={{ width: '15%' }} />
            </tr>
          </thead>
          <tbody style={{ fontSize: '13px' }}>
            {locations.map((c, i) => (
              <tr key={i}>
                <td><h6 className="mb-0">{c.name}</h6></td>
                <td>
                  <Image
                    src={c.image}
                    alt="Location"
                    child={{ width: 40, height: 40 }}
                  />
                </td>
                <td>{c.phone}</td>
                <td>{c.address}</td>
                <td>
                  <LinkToWebstite href={c.website} className="" target="_blank">
                    <i className="ri-external-link-line" />
                  </LinkToWebstite>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <ButtonControls>
                    <EditModal
                      data={c}
                      onEdit={v => handleLocationEdit(v, i)}
                      submitting={isSubmitting}
                      modalComp={LocationModal}
                      categories={categories}
                      index={i}
                    />{' '}
                    <DeleteModal
                      name={c.name}
                      onDelete={() => handleLocationDelete(i)}
                      index={i}
                      type="Location"
                    />
                  </ButtonControls>
                </td>
              </tr>
            ))}
          </tbody>
        </SiteTable>
      </CardBody>
    </CardSiteLogo>
  );
}, locationContentPropChange);

export default LocationContent;
