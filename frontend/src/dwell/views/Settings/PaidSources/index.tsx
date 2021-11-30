import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from 'dwell/actions/index';
import { toast, ToastOptions } from 'react-toastify';
import {
  ContentText,
  ContentTitleSm,
  Divider,
  FormGroupBar,
  FormLabel,
  SettingsFooter,
  FormActions, CustomAddButton,
} from 'dwell/views/Settings/styles';
import Action from 'dwell/views/Settings/_action';
import { DetailResponse, ListResponse, SourceProps } from 'src/interfaces';
import { PaidSourcesModalWindow } from 'dwell/components';
import { ConfirmActionModal } from 'site/components';
import { toastOptions } from 'site/constants';
import SourceSpendsForm from './SourceSpendsForm/index';

interface PaidSources extends RouteComponentProps {
  getSources: () => Promise<ListResponse>,
  settingsActiveTab: string,
  tab: string,
  sources: SourceProps[],
  isShow: boolean,
  setIsShow: (show: boolean) => void,
  updateSourceById: (sourceId: string, data: {is_paid: boolean}, msg: () => void) => Promise<DetailResponse>,
}

const PaidSources: FC<PaidSources> = ({ getSources, settingsActiveTab, tab, setIsShow, sources, isShow, updateSourceById }) => {
  const [currentSource, setCurrentSource] = useState<SourceProps>({});
  const [isShowModalWindow, setShowModalWindow] = useState(false);
  const [sourceId, setSourceId] = useState(null);
  const [showConfirmModal, toggleConfirmModal] = useState(false);

  const handleCloseModalWindow = () => {
    setShowModalWindow(false);
  };

  const handleOpenModalWindow = () => {
    setShowModalWindow(true);
  };

  useEffect(() => {
    getSources();
  }, []);

  useEffect(() => {
    if (settingsActiveTab !== tab) {
      setIsShow(false);
    }
  }, [settingsActiveTab, tab]);

  const handleCreate = () => {
    setCurrentSource({});
    setSourceId(null);
    handleOpenModalWindow();
  };

  const handleEdit = (source) => {
    setCurrentSource(source);
    setSourceId(source.id);
    handleOpenModalWindow();
  };

  const handleClose = () => {
    setIsShow(false);
    setCurrentSource({});
  };

  const handleDelete = (source) => {
    setCurrentSource(source);
    setSourceId(source.id);
    toggleConfirmModal(true);
  };

  const confirmDelete = () => {
    toggleConfirmModal(false);
    updateSourceById(sourceId, { is_paid: false }, () => toast.success('Paid source deleted', toastOptions as ToastOptions));
  };

  const content = (
    <React.Fragment>
      <PaidSourcesModalWindow
        show={isShowModalWindow}
        handleClose={handleCloseModalWindow}
        currentSource={currentSource}
        sourceId={sourceId}
        setSourceId={setSourceId}
      />
      <ConfirmActionModal
        text="Are you sure you wish to delete paid source"
        itemName={currentSource.name}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        onClose={() => toggleConfirmModal(false)}
        show={showConfirmModal}
      />
      <ContentTitleSm>Paid Sources</ContentTitleSm>
      <ContentText>Configure paid sources to track spend performance.</ContentText>
      <Divider />
      {sources.filter(source => source.is_paid).map((source, index) => (
        <FormGroupBar key={index} style={{ height: '49px' }}>
          <FormLabel>{source.name}</FormLabel>
          <FormActions>
            <Action handleClick={() => handleEdit(source)} actionType="edit" index={index} instanceType="paid source" />
            <Action handleClick={() => handleDelete(source)} actionType="delete" index={index} instanceType="paid source" />
          </FormActions>
        </FormGroupBar>))}
      <SettingsFooter>
        <CustomAddButton onClick={() => handleCreate()} ><i className="ri-add-circle-fill" />Add Paid Source</CustomAddButton>
      </SettingsFooter>
    </React.Fragment>
  );
  return (
    <React.Fragment>
      {isShow ? <SourceSpendsForm currentSource={currentSource} onClose={handleClose} /> : content}
    </React.Fragment>
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
)(withRouter(PaidSources));
