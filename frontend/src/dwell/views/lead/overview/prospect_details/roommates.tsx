import React, { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CardWidgetBody, CardWidgetHeader, CardWidgetTitle, FormCol, FormDataWrapper, FormGroup, FormIcon, LeadDetailGroup, LeadEdit, Divider } from 'dwell/views/lead/overview/styles';
import { RoommateDetail, RoommateName } from './styles';
import RoommateModal from './roommate_modal';

interface LeadRoommatesProps extends RouteComponentProps {
  isShared: boolean,
}

const LeadRoommates: FC<LeadRoommatesProps> = ({ isShared }) => {
  const [isShowingModal, setShowingModal] = useState(false);
  const [selectedRoommate, setSelectedRoommate] = useState(null);

  const roommates = useSelector(state => state.roommate.roommates);
  const relationshipTypes = useSelector(state => state.property.property.relationship_types);

  const currentRelationshipType = (roommate) => {
    const type = relationshipTypes.find(item => item.id === roommate.relationship);
    return type && type.name;
  };

  const handleEdit = (id) => {
    setSelectedRoommate(id);
    setShowingModal(true);
  };

  const handleClose = () => {
    setSelectedRoommate(null);
    setShowingModal(false);
  };

  return (
    <React.Fragment>
      <Divider $isRoommate />
      <CardWidgetHeader className="d-flex align-items-center justify-content-between pt-3">
        <CardWidgetTitle $small>Roommates</CardWidgetTitle>
        {!isShared &&
          <LeadEdit>
            <span onClick={() => setShowingModal(true)}><i className="ri-user-add-line" />Add</span>
          </LeadEdit>}
      </CardWidgetHeader>
      <CardWidgetBody className={!roommates.length ? 'p-2' : ''}>
        <LeadDetailGroup>
          {roommates.map((item, index) => (
            <FormCol xs={12} key={index}>
              <FormGroup>
                <FormIcon>
                  <i className="ri-user-6-line" />
                </FormIcon>
                <FormDataWrapper>
                  <RoommateName onClick={() => handleEdit(item.id)} className="mb-0">{item.first_name} {item.last_name}</RoommateName>
                  <RoommateDetail>{currentRelationshipType(item)}</RoommateDetail>
                </FormDataWrapper>
              </FormGroup>
            </FormCol>
          ))}
        </LeadDetailGroup>
      </CardWidgetBody>
      {isShowingModal && <RoommateModal show={isShowingModal} handleClose={handleClose} roommateId={selectedRoommate} />}
    </React.Fragment>
  );
};

export default withRouter(LeadRoommates);
