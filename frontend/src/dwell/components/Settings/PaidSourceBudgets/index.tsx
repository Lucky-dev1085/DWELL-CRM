import React, { FC, useEffect, useState } from 'react';
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
  FormGroup,
  Input, Label,
} from 'reactstrap';
import { SettingsPrimaryButton } from 'dwell/views/Settings/styles';
import moment from 'moment';
import { cloneDeep, isEmpty } from 'lodash';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';
import { getUTCDate } from 'dwell/views/Settings/utils';
import { paths } from 'dwell/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import NumberFormat from 'react-number-format';
import CustomDatePicker from 'dwell/components/Settings/_datePicker';
import { NoCompetitorsHeader } from 'dwell/components/Settings/styles';
import { PaidSourceBudgetsModal } from 'dwell/components/Settings/PaidSourceBudgets/styles';
import { getPropertyId } from 'src/utils';
import { ListResponse } from 'src/interfaces';

interface SourcesProps {
  id: number,
  name: string,
  is_paid: boolean,
  spends: { price: number, date: string }[]
}

interface SpendsProps {
  [id: string]: {
    date: string,
    price: number,
  }[]
}

interface PaidSourceBudgetsModalProps extends RouteComponentProps {
  handleClose: () => void,
  show: boolean,
  sources: SourcesProps[],
  updateSpends: ({ spends }: { spends: SpendsProps }, msg: () => void) => Promise<ListResponse>,
  isNew: boolean,
  curDate: string,
  setCurDate: (date: string) => void,
  disabledDates: string[],
}

const PaidSourceBudgetsModalWindow: FC<PaidSourceBudgetsModalProps> = ({
  handleClose,
  show,
  sources,
  updateSpends,
  isNew,
  curDate,
  setCurDate,
  disabledDates,
  history: { push },
}) => {
  const [paidSources, setPaidSources] = useState({});
  const [spends, setSpends] = useState({});

  const initializePaidSources = () => {
    setPaidSources(sources.filter(source => source.is_paid).reduce((prev, source) => ({ ...prev, [source.id]: source.name }), {}));
    setSpends(sources.filter(source => source.is_paid).reduce((prev, source) => ({ ...prev, [source.id]: (source.spends || []).reduce((p, spend) => ({ ...p, [spend.date]: spend.price }), {}) }), {}));
  };

  const handleCloseModal = () => {
    handleClose();
  };

  const closeBtn = <button className="close" onClick={() => handleCloseModal()} />;

  useEffect(() => {
    if (!isEmpty(sources)) {
      initializePaidSources();
    }
  }, [sources]);

  const handleCreate = () => {
    const convertedSpends = cloneDeep(spends);
    Object.keys(convertedSpends).forEach((key) => {
      convertedSpends[key] = Object.keys(convertedSpends[key]).map(k => ({ date: k, price: parseFloat(convertedSpends[key][k]) }));
    });
    updateSpends({ spends: convertedSpends }, () => toast.success(`${isNew ? 'New paid source budget added' : 'Paid source budget updated'}`, toastOptions as ToastOptions));
    handleCloseModal();
  };

  const handleAMonthChange = (date) => {
    const newDate = moment(getUTCDate(date)).format('YYYY-MM-DD');
    if (!disabledDates.includes(newDate)) {
      setCurDate(newDate);
    }
  };

  const handleAddPaidSources = () => {
    handleClose();
    push({ pathname: paths.build(paths.client.SETTINGS.PAID_SOURCES, getPropertyId()), state: { tab: 3, isNewPaidSource: false } });
  };

  return (
    <PaidSourceBudgetsModal
      isOpen={show}
      toggle={() => handleCloseModal()}
      centered
    >
      <ModalHeader close={closeBtn}>{isNew ? 'Add New Budget' : 'Edit Budget'}</ModalHeader>

      <div className="animated fadeIn">
        {isEmpty(paidSources) ?
          <React.Fragment>
            <ModalBody>
              <div className="empty-paid-sources">
                <NoCompetitorsHeader>No paid sources</NoCompetitorsHeader>
                <div>In order to set paid source budgets, you&#8216;ll need to add paid sources to your property account.</div>

              </div>
            </ModalBody>
            <ModalFooter>
              <button
                className="btn btn-primary"
                onClick={() => handleAddPaidSources()}
              >
                <FontAwesomeIcon icon={faPlusCircle} /> New paid source
              </button>
            </ModalFooter>
          </React.Fragment>
          :
          <React.Fragment>
            <ModalBody>
              <Label>Budget Month</Label>
              <FormGroup className="mb-3">
                <CustomDatePicker handleAMonthChange={handleAMonthChange} curDate={curDate} disabledDates={disabledDates} isNew={isNew} />
              </FormGroup>
              {Object.keys(paidSources).map((key, index) => (
                <FormGroup key={index} className={index !== Object.keys(paidSources).length - 1 ? 'mb-3' : ''}>
                  <Label>{paidSources[key]}</Label>
                  <NumberFormat
                    value={spends[key][curDate] || ''}
                    customInput={Input}
                    onValueChange={({ value }) => setSpends({ ...spends, [key]: { ...spends[key], [curDate]: value } })}
                    inputMode="numeric"
                    fixedDecimalScale
                    prefix="$"
                    decimalScale={2}
                  />
                </FormGroup>
              ))}
            </ModalBody>
            <ModalFooter>
              <Button className="btn-secondary mr-1" onClick={() => handleCloseModal()} >Cancel</Button>
              <SettingsPrimaryButton className="btn btn-primary" onClick={handleCreate} disabled={!curDate}>{isNew ? 'Add Budget' : 'Save changes'}</SettingsPrimaryButton>
            </ModalFooter>
          </React.Fragment>
        }
      </div>
    </PaidSourceBudgetsModal>

  );
};

export default connect(
  null,
  {
    ...actions.prospectSource,
  },
)(withRouter(PaidSourceBudgetsModalWindow));
