import React, { useState, FC } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from 'dwell/actions';
import Action from 'dwell/views/Settings/_action';
import { ContentText, ContentTitleSm, Divider, FormGroupBar, FormLabel, SettingsFooter, FormActions, CustomAddButton } from 'dwell/views/Settings/styles';
import { ConfirmActionModal } from 'site/components';
import { ListResponse, SuccessResponse } from 'src/interfaces';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';
import 'src/scss/pages/_email_template.scss';
import 'src/scss/pages/_assign_lead_owners.scss';
import RentableItemForm from './_rentableItemForm';

interface Rentable {
  id?: number,
  name?: string,
  description?: string,
  deposit?: string,
  fee?: string,
  monthly_rent?: string,
}

interface RentableItem extends RouteComponentProps {
  rentableItems?: Rentable[],
  deleteRentableItem: (id: number, msg: () => void) => Promise<SuccessResponse>,
  getRentableItems: () => Promise<ListResponse>,
}

const RentableItem: FC<RentableItem> = ({ rentableItems, deleteRentableItem, getRentableItems }) => {
  const [isShowModal, setIsShow] = useState(false);
  const [currentRentableItem, setCurrentRentableItem] = useState({} as Rentable);
  const [showConfirmModal, toggleConfirmModal] = useState(false);

  const handleEdit = (competitor) => {
    setIsShow(true);
    setCurrentRentableItem(competitor);
  };

  const handleClose = () => {
    setIsShow(false);
    setCurrentRentableItem({});
  };
  const handleDelete = (item) => {
    setCurrentRentableItem(item);
    toggleConfirmModal(true);
  };

  const confirmDelete = () => {
    toggleConfirmModal(false);
    setCurrentRentableItem({});
    deleteRentableItem(currentRentableItem.id, () => toast.success('Rentable item deleted', toastOptions as ToastOptions)).then(() => {
      getRentableItems();
    });
  };

  return (
    <React.Fragment>
      <RentableItemForm
        show={isShowModal}
        handleClose={handleClose}
        currentRentableItem={currentRentableItem}
      />
      <ConfirmActionModal
        text="You are about to delete this item"
        itemName={currentRentableItem.name}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        onClose={() => toggleConfirmModal(false)}
        show={showConfirmModal}
      />
      <ContentTitleSm>Manage Rentable Items</ContentTitleSm>
      <ContentText>Manage property add-ons that are available for residens to rent.</ContentText>
      <Divider />
      {rentableItems.map((item, index) => (
        <FormGroupBar key={index} style={{ height: '49px' }}>
          <FormLabel>{item.name}</FormLabel>
          <FormActions>
            <Action handleClick={() => handleEdit(item)} actionType="edit" index={index} instanceType="rentable item" />
            <Action handleClick={() => handleDelete(item)} actionType="delete" index={index} instanceType="rentable item" />
          </FormActions>
        </FormGroupBar>))}
      <SettingsFooter>
        <CustomAddButton onClick={() => setIsShow(true)} ><i className="ri-add-circle-fill" />Add Rentable Item</CustomAddButton>
      </SettingsFooter>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  rentableItems: state.lease.rentableItems,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lease,
  },
)(withRouter(RentableItem));
