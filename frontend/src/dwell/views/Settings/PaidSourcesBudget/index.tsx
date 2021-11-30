import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import actions from 'dwell/actions/index';
import moment from 'moment';
import { getUTCDate } from 'dwell/views/Settings/utils';
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
import { ListResponse } from 'src/interfaces';
import { PaidSourceBudgetsModalWindow } from 'dwell/components';
import { cloneDeep, isEmpty } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';
import { ConfirmActionModal } from 'site/components';

interface SourcesProps {
  id: number,
  is_paid: boolean,
  spends: { price: number, date: string }[]
}

interface SpendsProps {
  [id: string]: {
    date: string,
    price: number,
  }[]
}

interface PaidSourcesBudgetProps {
  sources: SourcesProps[],
  getSources: () => Promise<ListResponse>,
  updateSpends: ({ spends } : {spends: SpendsProps}, msg: () => void) => Promise<ListResponse>,
}

const PaidSourcesBudget: FC<PaidSourcesBudgetProps> = ({ sources, getSources, updateSpends }) => {
  const [budgetDates, setBudgetDates] = useState([]);
  const [isShowModalWindow, setShowModalWindow] = useState(false);
  const [curDate, setCurDate] = useState(moment(new Date()).startOf('month').format('YYYY-MM-DD'));
  const [isNew, setIsNew] = useState(true);
  const [disabledDates, setDisabledDates] = useState([]);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [removeItemId, setRemoveItemId] = useState(null);

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
    const sourcesWithSpends = sources.filter(source => source.is_paid && source.spends.length);
    let dates = [];
    sourcesWithSpends.forEach((source) => {
      dates = dates.concat(source.spends.filter(spend => spend.price).map(spend => spend.date));
    });
    setBudgetDates([...new Set(dates)].sort());
  }, [sources]);

  const handleCreate = () => {
    setIsNew(true);
    setCurDate(moment(new Date()).startOf('month').format('YYYY-MM-DD'));
    handleOpenModalWindow();
  };

  useEffect(() => {
    if (isNew) {
      const sourcesWithSpends = sources.filter(source => source.is_paid && source.spends.length);
      let currentBudgetDates = [];
      sourcesWithSpends.forEach((source) => {
        currentBudgetDates = budgetDates.concat(source.spends.filter(spend => spend.price)
          .map(spend => spend.date));
      });
      if (!isEmpty(currentBudgetDates)) {
        const lastDate = getUTCDate(currentBudgetDates[budgetDates.length - 1]);
        setCurDate(moment(lastDate.setMonth(lastDate.getMonth() + 1, 1))
          .format('YYYY-MM-DD'));
        setDisabledDates(budgetDates);
      }
    }
  }, [isShowModalWindow]);

  const handleEdit = (date) => {
    setIsNew(false);
    setCurDate(date);
    handleOpenModalWindow();
  };

  const handleDelete = (date) => {
    const spends: SpendsProps = sources.filter(source => source.is_paid).reduce((prev, source) => ({ ...prev, [source.id]: (source.spends || []).reduce((p, spend) => ({ ...p, [spend.date]: spend.price }), {}) }), {});
    const convertedSpends: SpendsProps = cloneDeep(spends);
    Object.keys(convertedSpends).forEach((key) => {
      convertedSpends[key] = Object.keys(convertedSpends[key]).filter(k => k !== date).map(k => ({ date: k, price: parseFloat(convertedSpends[key][k]) }));
    });
    setCurDate(date);
    setRemoveItemId(convertedSpends);
    toggleConfirmModal(true);
  };

  const confirmDelete = () => {
    toggleConfirmModal(false);
    updateSpends({ spends: removeItemId }, () => toast.success('Paid source budget deleted', toastOptions as ToastOptions));
  };

  return (
    <React.Fragment>
      <PaidSourceBudgetsModalWindow
        show={isShowModalWindow}
        handleClose={handleCloseModalWindow}
        isNew={isNew}
        curDate={curDate}
        setCurDate={setCurDate}
        sources={sources}
        disabledDates={disabledDates}
      />
      <ConfirmActionModal
        text="Are you sure you wish to delete paid source budget for"
        onConfirm={confirmDelete}
        title="Confirm Delete"
        onClose={() => toggleConfirmModal(false)}
        show={showConfirmModal}
        itemName={moment(getUTCDate(curDate)).format('MMMM YYYY')}
      />
      <ContentTitleSm>Paid Source Budgets</ContentTitleSm>
      <ContentText>Record paid source budgets to track spend and understand source performance across key business outcomes.</ContentText>
      <Divider />
      {budgetDates.map((date, index) => (
        <FormGroupBar key={index} style={{ height: '49px' }}>
          <FormLabel>{moment(getUTCDate(date)).format('MMMM YYYY')}</FormLabel>
          <FormActions>
            <Action handleClick={() => handleEdit(date)} actionType="edit" index={index} instanceType="paid source budget" />
            <Action handleClick={() => handleDelete(date)} actionType="delete" index={index} instanceType="paid source budget" />
          </FormActions>
        </FormGroupBar>))}
      <SettingsFooter>
        <CustomAddButton onClick={() => handleCreate()} ><i className="ri-add-circle-fill" />Add Budget</CustomAddButton>
      </SettingsFooter>
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
)(PaidSourcesBudget);
