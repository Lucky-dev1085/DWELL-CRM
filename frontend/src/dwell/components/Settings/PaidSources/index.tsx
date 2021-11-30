import React, { FC, useState } from 'react';
import 'react-dates/initialize';
import 'src/scss/pages/_email_template.scss';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import actions from 'dwell/actions';
import { connect } from 'react-redux';
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  ButtonDropdown,
} from 'reactstrap';
import { SettingsPrimaryButton } from 'dwell/views/Settings/styles';
import { PaidSourcesModal } from 'dwell/components/Settings/PaidSources/styles';
import { DetailResponse } from 'src/interfaces';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';

interface Source {
  id: string,
  name: string,
  spends: {date: string, price: number},
  is_paid: boolean,
}

interface PaidSourcesModalWindowProps extends RouteComponentProps{
  handleClose: () => void,
  show: boolean,
  currentSource: {id: string},
  updateSourceById: (sourceId: string, data: {is_paid: boolean}, msg?: (() => void) | boolean) => Promise<DetailResponse>,
  sources: Source[],
  sourceId: string,
  setSourceId: (sourceId: string) => void,
}

const PaidSourcesModalWindow: FC<PaidSourcesModalWindowProps> = ({
  handleClose,
  show,
  currentSource,
  updateSourceById,
  sources,
  sourceId,
  setSourceId,
}) => {
  const closeBtn = <button className="close" onClick={() => handleClose()} />;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCreate = () => {
    if (currentSource.id && currentSource.id !== sourceId) {
      updateSourceById(currentSource.id, { is_paid: false }, true);
    }
    updateSourceById(sourceId, { is_paid: true }, () => toast.success(`${currentSource.id ? 'Paid source updated' : 'New paid source added'}`, toastOptions as ToastOptions))
      .then(() => {
        handleClose();
      });
  };

  const convertedSourceChoices = sources.filter(source => !source.is_paid || source.id === currentSource.id).reduce((prev, source) => ({ ...prev, [source.id]: source.name }), {});
  return (
    <PaidSourcesModal
      isOpen={show}
      toggle={() => handleClose()}
      centered
    >
      <ModalHeader close={closeBtn}>{currentSource.id ? 'Edit Paid Source' : 'Add New Paid Source'}</ModalHeader>
      <ModalBody>
        <div className="animated fadeIn">
          {
            <ButtonDropdown className="mr-1 select-input" isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(!isDropdownOpen)}>
              <DropdownToggle caret className="bg-white h-38" style={{ padding: '2px 20px 0 12px', borderColor: '#d5dcf4', borderRadius: '4px' }}>
                {sourceId ? convertedSourceChoices[sourceId] : 'Select source'}
              </DropdownToggle>
              <DropdownMenu>
                {Object.keys(convertedSourceChoices).map((key, index) => (
                  <React.Fragment key={index}>
                    <DropdownItem onClick={() => setSourceId(key)} className={key === sourceId ? 'selected' : ''}>
                      {convertedSourceChoices[key]}
                    </DropdownItem>
                  </React.Fragment>
                ))}
              </DropdownMenu>
            </ButtonDropdown>
          }
        </div>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-secondary" onClick={() => handleClose()} >Cancel</Button>
        <SettingsPrimaryButton className="btn btn-primary" onClick={() => handleCreate()} >{currentSource.id ? 'Save changes' : 'Add Paid Source'}</SettingsPrimaryButton>
      </ModalFooter>
    </PaidSourcesModal>

  );
};
const mapStateToProps = state => ({
  sources: state.prospectSource.sources,
});

export default connect(
  mapStateToProps,
  {
    ...actions.prospectSource,
  },
)(withRouter(PaidSourcesModalWindow));
