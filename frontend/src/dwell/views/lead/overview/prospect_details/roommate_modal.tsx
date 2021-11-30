import React, { FC, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, FormFeedback, Input, Label,
  ModalBody, ModalFooter, ModalHeader, Row, Col, Button } from 'reactstrap';
import { set, get, isEmpty } from 'lodash';
import { ConfirmActionModal } from 'site/components';
import { rules } from 'site/common/validations';
import roommateAction from 'dwell/actions/roommate';
import { RoommateProps } from 'src/interfaces';
import { Modal, RoommateItem, SectionTitle, RemoveItem, PrimaryButton } from './styles';

interface FormErrors {
  first_name?: boolean,
  last_name?: boolean,
  relationship?: boolean,
  email?: boolean,
}

interface RoommateModalProps extends RouteComponentProps {
  handleClose: () => void,
  show: boolean,
  roommateId?: number,
}

const defaultRoommate = { id: null, first_name: '', last_name: '', email: '', phone_number: '', relationship: null } as RoommateProps;

const RoommateModal: FC<RoommateModalProps> = ({ handleClose, show, roommateId }) => {
  const dispatch = useDispatch();
  const roommates = useSelector(state => state.roommate.roommates);
  const relationshipTypes = useSelector(state => state.property.property.relationship_types);
  const lead = useSelector(state => state.lead.lead);
  const { deleteRoommateById, saveRoommates } = roommateAction;

  const [formValues, setRoommateList] = useState<{ roommates: RoommateProps[]}>({ roommates: [{ ...defaultRoommate }] });
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentRoommate, setCurrentRoommate] = useState(defaultRoommate);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (roommateId) {
      const selectedRoommate = roommates.find(item => item.id === roommateId);
      setRoommateList({ roommates: [selectedRoommate] });
    }
  }, [roommateId]);

  const validate = () => {
    const formErrors = {};

    formValues.roommates.forEach((roommate, index) => {
      const error = {} as FormErrors;
      const { first_name, last_name, relationship, email } = roommate;
      const currentRelationshipType = relationshipTypes.find(item => item.id === relationship) || {};

      if (rules.isEmpty(first_name)) {
        error.first_name = true;
      }

      if (rules.isEmpty(last_name)) {
        error.last_name = true;
      }

      if (rules.isEmpty(relationship)) {
        error.relationship = true;
      }

      if (!rules.isValidEmail(email) && currentRelationshipType.name !== 'Child') {
        error.email = true;
      }

      if (!isEmpty(error)) formErrors[index] = error;
    });

    setErrors(formErrors);
    return formErrors;
  };

  const handleSave = () => {
    if (isEmpty(validate())) {
      if (formValues.roommates.length) {
        dispatch(saveRoommates(formValues.roommates, lead.id)).then(() => handleClose());
      } else {
        handleClose();
      }
    }
  };

  const handleOnChange = ({ target: { value, id } }) => {
    set(formValues, id, value);
    setRoommateList({ ...formValues });
  };

  const handleDropdownChange = (id, value) => {
    set(formValues, id, value);
    setRoommateList({ ...formValues });
  };

  const handleAddRoommate = () => {
    const data = get(formValues, 'roommates', []);
    data.push({ ...defaultRoommate });
    set(formValues, 'roommates', data);
    setRoommateList({ ...formValues });
  };

  const removeRoommateByIndex = (index) => {
    const data = get(formValues, 'roommates').filter((el, i) => index !== i);
    set(formValues, 'roommates', data);
    setRoommateList({ ...formValues });
  };

  const handleRemoveRoommate = (roommate, index) => {
    if (roommate.id) {
      setCurrentRoommate(roommate);
      setShowConfirmModal(true);
    } else {
      removeRoommateByIndex(index);
    }
  };

  const confirmRemoveRoommate = () => {
    dispatch(deleteRoommateById(currentRoommate.id, lead.id)).then(() => {
      const index = formValues.roommates.findIndex(el => el.id === currentRoommate.id);
      removeRoommateByIndex(index);
    });
    setShowConfirmModal(false);
    handleClose();
  };

  useEffect(() => {
    if (!isEmpty(errors)) validate();
  }, [formValues]);

  useEffect(() => {
    if (!formValues.roommates.length) handleAddRoommate();
  }, [formValues.roommates]);

  const closeBtn = <button className="close" onClick={() => handleClose()}><i className="ri-close-line" /></button>;

  return (
    <React.Fragment>
      <Modal
        isOpen={show}
        toggle={() => handleClose()}
        centered
        aria-labelledby="example-custom-modal-styling-title"
      >
        <ModalHeader close={closeBtn}>{roommateId ? 'Edit Roommate' : 'Add Roommates'}</ModalHeader>
        <ModalBody>
          {formValues.roommates.map((roommate, index) => {
            const isOpen = get(isDropdownOpen, `${index}`);
            const currentRelationshipType = relationshipTypes.find(item => item.id === roommate.relationship);
            const isRemoveDisable = !roommate.id && !index && formValues.roommates.length === 1;

            return (
              <RoommateItem key={index}>
                {!roommateId &&
                <SectionTitle>
                  <span>Roommate {index + 1}</span>
                  <RemoveItem onClick={() => handleRemoveRoommate(roommate, index)} hidden={isRemoveDisable}>
                    <i className="ri-delete-bin-line" />
                    Remove
                  </RemoveItem>
                </SectionTitle>
                }
                <Row>
                  <Col xs={6} className="col">
                    <Label htmlFor={`[${index}].first_name`}>Firstname</Label>
                    <Input
                      type="text"
                      id={`roommates[${index}].first_name`}
                      placeholder="Enter firstname"
                      invalid={get(errors, `[${index}].first_name`)}
                      required
                      value={get(roommate, 'first_name', '')}
                      onChange={handleOnChange}
                    />
                    <FormFeedback>First name is required.</FormFeedback>
                  </Col>
                  <Col xs={6} className="col">
                    <Label htmlFor={`[${index}].last_name`}>Lastname</Label>
                    <Input
                      type="text"
                      id={`roommates[${index}].last_name`}
                      placeholder="Enter lastname"
                      invalid={get(errors, `[${index}].last_name`)}
                      required
                      value={get(roommate, 'last_name', '')}
                      onChange={handleOnChange}
                    />
                    <FormFeedback>Last name is required.</FormFeedback>
                  </Col>
                  <Col xs={5} className="col mt-20">
                    <Label htmlFor={`[${index}].email`}>Email address</Label>
                    <Input
                      type="text"
                      id={`roommates[${index}].email`}
                      placeholder="Enter email address"
                      invalid={get(errors, `[${index}].email`)}
                      value={get(roommate, 'email', '')}
                      onChange={handleOnChange}
                    />
                    <FormFeedback>{get(roommate, 'email') ? 'Email address is invalid' : 'Email is required.'}</FormFeedback>
                  </Col>
                  <Col className="col mt-20">
                    <Label htmlFor={`[${index}].phone_number`}>Phone number</Label>
                    <Input
                      type="text"
                      id={`roommates[${index}].phone_number`}
                      placeholder="Enter phone number"
                      value={get(roommate, 'phone_number', '')}
                      onChange={handleOnChange}
                    />
                  </Col>
                  <Col className="col mt-20">
                    <Label>Relationship to lead</Label>
                    <Input invalid={get(errors, `[${index}].relationship`)} hidden />
                    <ButtonDropdown className="mr-1 select-input" isOpen={isOpen} toggle={() => setIsDropdownOpen({ ...isDropdownOpen, [index]: !isOpen })}>
                      <DropdownToggle caret className="bg-white">
                        {currentRelationshipType ? currentRelationshipType.name : 'Choose relationship'}
                      </DropdownToggle>
                      <DropdownMenu>
                        {relationshipTypes.map(type => (
                          <React.Fragment key={type.id}>
                            <DropdownItem
                              onClick={() => handleDropdownChange(`roommates[${index}].relationship`, type.id)}
                              className={type.value === get(currentRelationshipType, 'value') ? 'selected' : ''}
                            >
                              {type.name}
                            </DropdownItem>
                          </React.Fragment>
                        ))}
                      </DropdownMenu>
                    </ButtonDropdown>
                    <FormFeedback>Relationship is required.</FormFeedback>
                  </Col>
                </Row>
              </RoommateItem>
            );
          })}
        </ModalBody>
        <ModalFooter>
          {roommateId ?
            <Button className="mr-auto" color="danger" onClick={() => handleRemoveRoommate(roommates.find(item => item.id === roommateId), 0)}>Delete Roommate</Button> :
            <PrimaryButton color="primary" inverse className="mr-auto" onClick={handleAddRoommate} hidden={get(formValues, 'roommates.length') === 5}>
              <i className="ri-add-circle-line mr-1" /> Add Roommate
            </PrimaryButton>
          }
          <Button color="white" onClick={() => handleClose()}>Cancel</Button>
          <PrimaryButton color="primary" className="ml-2" onClick={handleSave} disabled={!isEmpty(errors)}>
            {roommateId ? 'Save' : 'Add'} Roommate
          </PrimaryButton>
        </ModalFooter>
      </Modal>
      <ConfirmActionModal
        text="Do you wish to delete roommate"
        itemName={`${currentRoommate.first_name} ${currentRoommate.last_name}`}
        onConfirm={confirmRemoveRoommate}
        onClose={() => setShowConfirmModal(false)}
        show={showConfirmModal}
        title="Delete Roommate"
      />
    </React.Fragment>
  );
};

export default withRouter(RoommateModal);
