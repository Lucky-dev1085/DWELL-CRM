import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, CardBody, Col, InputGroup, InputGroupAddon, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import actions from 'dwell/actions';
import { getPropertyId } from 'src/utils';
import {
  CancelBtn,
  PropertyList,
  PropertyListAction,
  PropertyListCard,
  PropertyListCardHeader,
  PropertyListCardTitle,
  PropertyListCloseIcon, PropertyListFormSearch,
  PropertyListFormSearchInput, PropertyListItem,
  PropertyListLabel,
  SaveBtn,
} from 'dwell/components/Leads/LeadShareModal/styles';
import { SuccessResponse } from 'src/interfaces';
import ConfirmModal from './_confirmModal';

const compare = (a, b) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
};

interface LeadShareModalProps extends RouteComponentProps {
  show: boolean,
  handleClose: () => void,
  lead: { id: number, first_name: string, last_name: string },
  properties: { id: number, name: string }[],
  currentProperty: { id: number, name: string },
  shareLead: (data: {
    lead: number,
    properties: number[],
  }) => Promise<SuccessResponse>,
  transferLead: (data: {
    lead: number,
    properties: number[],
  }) => Promise<SuccessResponse>,
}

const LeadShareModal: FC<LeadShareModalProps> = ({ history: { push }, handleClose, show, lead, properties, currentProperty, shareLead, transferLead }) => {
  const closeBtn = <button className="close" onClick={() => handleClose()}><i className="ri-close-line" /></button>;
  const [keywordProperty, setKeywordProperty] = useState('');
  const [keywordSelectedProperty, setKeywordSelectedProperty] = useState('');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);

  const handleSave = () => {
    if (selectedProperties.map(p => p.id).includes(currentProperty.id)) {
      shareLead({
        lead: lead.id,
        properties: selectedProperties.map(p => p.id),
      }).then(() => {
        handleClose();
      });
    } else {
      transferLead({
        lead: lead.id,
        properties: selectedProperties.map(p => p.id),
      }).then(() => {
        handleClose();
        push(`/${getPropertyId()}/leads`);
      });
    }
  };

  useEffect(() => {
    setAllProperties(properties.filter(p => p.id === currentProperty.id)
      .concat(properties.filter(p => p.id !== currentProperty.id).sort(compare)));
    setSelectedProperties(properties.filter(p => p.id === currentProperty.id));
  }, [properties]);

  const changeSelectedProperties = (event) => {
    const { target: { id, checked } } = event;
    if (!checked && Number(id) === currentProperty.id && !isOpenConfirmModal) {
      setIsOpenConfirmModal(true);
      return;
    }
    if (checked) {
      setSelectedProperties(selectedProperties.concat(allProperties.filter(p => p.id === Number(id))));
    } else {
      setSelectedProperties(selectedProperties.filter(p => p.id !== Number(id)));
    }
  };

  const onConfirm = () => {
    changeSelectedProperties({ target: { id: currentProperty.id, checked: false } });
    setIsOpenConfirmModal(false);
  };

  useEffect(() => {
    if (allProperties.length) {
      setAllProperties(allProperties.filter(p => p.id === currentProperty.id)
        .concat(allProperties.filter(p => p.id !== currentProperty.id && selectedProperties.includes(p)))
        .concat(allProperties.filter(p => p.id !== currentProperty.id && !selectedProperties.includes(p)).sort(compare)));
    }
  }, [selectedProperties]);

  const selectAllProperties = () => {
    setSelectedProperties(allProperties);
  };

  const selectNoneProperties = () => {
    setSelectedProperties(allProperties.filter(p => p.id === currentProperty.id));
    setIsOpenConfirmModal(true);
  };

  return (
    <Modal
      isOpen={show}
      toggle={() => handleClose()}
      centered
      aria-labelledby="example-custom-modal-styling-title"
      className="lead-share-modal"
      size="lg"
    >
      <ModalHeader close={closeBtn}>
        Share Lead - {lead.first_name} {lead.last_name}
      </ModalHeader>
      <ModalBody>
        <p>Select the properties to share the lead with:</p>
        <Row>
          <Col xs={6}>
            <PropertyListCard>
              <PropertyListCardHeader>
                <InputGroup className="search-group">
                  <PropertyListFormSearch>
                    <i className="ri-search-line" />
                    <PropertyListFormSearchInput
                      name="properties-search"
                      value={keywordProperty}
                      onChange={({ target: { value } }) => setKeywordProperty(value)}
                      placeholder="Search..."
                    />
                  </PropertyListFormSearch>
                  {keywordProperty &&
                  <InputGroupAddon addonType="append">
                    <Button color="white" className="clear-btn" onClick={() => setKeywordProperty('')}>&times;</Button>
                  </InputGroupAddon>}
                </InputGroup>
              </PropertyListCardHeader>
              <CardBody>
                <PropertyListCardTitle className="d-flex align-items-center justify-content-end">
                  <PropertyListAction onClick={() => selectNoneProperties()} >Select None</PropertyListAction>
                  <PropertyListAction onClick={() => selectAllProperties()} >Select All</PropertyListAction>
                </PropertyListCardTitle>
                <PropertyList>
                  {allProperties.filter(property => property.name.toLowerCase().includes(keywordProperty.toLowerCase())).map((property, index) =>
                    (
                      <PropertyListItem className="d-flex align-items-center" key={index}>
                        <div className="custom-control custom-checkbox mr-sm-2">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={property.id}
                            name={property.id}
                            checked={selectedProperties && selectedProperties.includes(property)}
                            onChange={e => changeSelectedProperties(e)}
                          />
                          {/* eslint-disable-next-line jsx-a11y/label-has-for */}
                          <PropertyListLabel
                            htmlFor={property.id}
                            className="ml-1 custom-control-label"
                          >{property.id === currentProperty.id ? `${property.name} (owner)` : property.name}
                          </PropertyListLabel>
                        </div>
                      </PropertyListItem>
                    ))}
                </PropertyList>
              </CardBody>
            </PropertyListCard>
          </Col>
          <Col xs={6}>
            <PropertyListCard>
              <PropertyListCardHeader>
                <InputGroup className="search-group">
                  <PropertyListFormSearch>
                    <i className="ri-search-line" />
                    <PropertyListFormSearchInput
                      name="selected-properties-search"
                      value={keywordSelectedProperty}
                      onChange={({ target: { value } }) => setKeywordSelectedProperty(value)}
                      placeholder="Search..."
                    />
                  </PropertyListFormSearch>
                  {keywordSelectedProperty &&
                  <InputGroupAddon addonType="append">
                    <Button color="white" className="clear-btn" onClick={() => setKeywordSelectedProperty('')}>&times;</Button>
                  </InputGroupAddon>}
                </InputGroup>
              </PropertyListCardHeader>
              <CardBody>
                <PropertyListCardTitle className="d-flex align-items-center justify-content-between">
                  <div>{selectedProperties.length} selected</div>
                  <PropertyListAction onClick={() => selectNoneProperties()} >Clear All</PropertyListAction>
                </PropertyListCardTitle>
                <PropertyList>
                  {selectedProperties.filter(property => property.name.toLowerCase().includes(keywordSelectedProperty.toLowerCase())).map(property => (
                    <PropertyListItem isSelected key={`selected-${property.id}`} className="d-flex align-items-center justify-content-between">
                      <PropertyListLabel key={property.id} id={property.id}>{property.name} {property.id === currentProperty.id && '(owner)'}</PropertyListLabel>
                      <button style={{ opacity: 1 }} className="close" onClick={() => changeSelectedProperties({ target: { id: property.id, checked: false } })}><PropertyListCloseIcon className="ri-close-line" /></button>
                    </PropertyListItem>))}
                </PropertyList>
              </CardBody>
            </PropertyListCard>
          </Col>
        </Row>
        <ConfirmModal lead={lead} property={currentProperty} onCancel={() => setIsOpenConfirmModal(false)} onConfirm={onConfirm} show={isOpenConfirmModal} />
      </ModalBody>
      <ModalFooter>
        <CancelBtn className="btn" color="secondary" onClick={() => handleClose()} >Cancel</CancelBtn>
        <SaveBtn className="btn" color="primary" onClick={handleSave} disabled={!selectedProperties.some(p => p.id !== currentProperty.id)} >Save Changes</SaveBtn>
      </ModalFooter>
    </Modal>
  );
};

const mapStateToProps = state => ({
  properties: state.property.property.customer_properties,
  currentProperty: state.property.property,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
  },
)(withRouter(LeadShareModal));
