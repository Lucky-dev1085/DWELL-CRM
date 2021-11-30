import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col, CardFooter, Row, Input, Label } from 'reactstrap';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cloneDeep, isEmpty } from 'lodash';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import NumberFormat from 'react-number-format';
import DatePicker from 'react-datepicker';
import actions from 'dwell/actions';
import { getUTCDate } from 'dwell/views/Settings/utils';
import { getPropertyId } from 'src/utils';
import { paths } from 'dwell/constants';
import { ListResponse } from 'src/interfaces';
import 'src/scss/pages/_paid_sources.scss';
import 'react-datepicker/dist/react-datepicker.css';

interface SpendsProps {
  [id: string]: {
    date: string,
    price: number,
  }[]
}

interface PaidSourceBudgetFormProps extends RouteComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources: any,
  updateSpends: ({ spends }: { spends: SpendsProps }) => Promise<ListResponse>,
  getSources: () => void,
}

const PaidSourceBudgetForm: FC<PaidSourceBudgetFormProps> = ({ getSources, location: { pathname, search }, sources, updateSpends, history: { push } }) => {
  const [curDate, setCurDate] = useState(moment(new Date()).startOf('month').format('YYYY-MM-DD'));
  const [paidSources, setPaidSources] = useState({});
  const [spends, setSpends] = useState({});
  const [disabledDates, setDisabledDates] = useState([]);
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    if (pathname.split('/').pop() !== 'new') {
      setCurDate(search.split('=').pop());
      setIsNew(false);
    }
    getSources();
  }, []);

  useEffect(() => {
    if (pathname.split('/').pop() === 'new') {
      const sourcesWithSpends = sources.filter(source => source.is_paid && source.spends.length);
      let budgetDates = [];
      sourcesWithSpends.forEach((source) => {
        budgetDates = budgetDates.concat(source.spends.filter(spend => spend.price)
          .map(spend => spend.date));
      });
      if (!isEmpty(budgetDates)) {
        const lastDate = getUTCDate(budgetDates[budgetDates.length - 1]);
        setCurDate(moment(lastDate.setMonth(lastDate.getMonth() + 1, 1))
          .format('YYYY-MM-DD'));
        setDisabledDates(budgetDates);
      }
    }
  }, [sources && sources.spends]);

  const initializePaidSources = () => {
    setPaidSources(sources.filter(source => source.is_paid).reduce((prev, source) => ({ ...prev, [source.id]: source.name }), {}));
    setSpends(sources.filter(source => source.is_paid).reduce((prev, source) => ({ ...prev, [source.id]: (source.spends || []).reduce((p, spend) => ({ ...p, [spend.date]: spend.price }), {}) }), {}));
  };

  useEffect(() => {
    if (!isEmpty(sources)) {
      initializePaidSources();
    }
  }, [sources, curDate, sources && sources.spends]);

  const handleCreate = () => {
    const convertedSpends = cloneDeep(spends);
    Object.keys(convertedSpends).forEach((key) => {
      convertedSpends[key] = Object.keys(convertedSpends[key]).map(k => ({ date: k, price: parseFloat(convertedSpends[key][k]) }));
    });
    updateSpends({ spends: convertedSpends }).then(() => push({ pathname: paths.build(paths.client.SETTINGS.LIST_PAID_SOURCE_BUDGET, getPropertyId()), state: { tab: 7 } }));
  };

  const handleCancel = () => {
    const siteId = getPropertyId();
    push(paths.build(paths.client.SETTINGS.LIST_PAID_SOURCE_BUDGET, siteId));
  };

  const handleAMonthChange = (date) => {
    const newDate = moment(getUTCDate(date)).format('YYYY-MM-DD');
    if (!disabledDates.includes(newDate)) {
      setCurDate(newDate);
    }
  };

  return (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12">
          <Card className="create-paid-source">
            <CardHeader>
              {isNew ? 'Create paid source budget' : 'Edit paid source budget'}
            </CardHeader>
            <CardBody>
              {isEmpty(paidSources) ?
                <Card className="empty-paid-sources-card">
                  <CardBody>
                    <div className="empty-paid-sources">
                      <h4>No paid sources</h4>
                      <div>In order to set paid source budgets, you&#8216;ll need to add paid sources to your property account.</div>
                      <button
                        className="btn btn-primary"
                        onClick={() => push({ pathname: paths.build(paths.client.SETTINGS.PAID_SOURCES, getPropertyId()), state: { tab: 3, isNewPaidSource: true } })}
                      >
                        <FontAwesomeIcon icon={faPlusCircle} /> New paid source
                      </button>
                    </div>
                  </CardBody>
                </Card> :
                <Card>
                  <CardBody>
                    <Label>Budget month</Label>
                    <div>
                      <DatePicker
                        selected={getUTCDate(curDate)}
                        onChange={date => handleAMonthChange(date)}
                        dateFormat="MMMM yyyy"
                        minDate={getUTCDate('2019-01-01')}
                        excludeDates={disabledDates.map(date => getUTCDate(date))}
                        showMonthYearPicker
                        disabled={!isNew}
                      />
                    </div>
                    <div className="mt-4">
                      <Row>
                        {Object.keys(paidSources).map((key, index) => (
                          <React.Fragment key={index}>
                            <Col xs={3}>
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
                            </Col>
                          </React.Fragment>
                        ))}
                      </Row>
                    </div>
                  </CardBody>
                  <CardFooter className="bg-white">
                    <button className="mr-1 btn btn-primary float-right" onClick={handleCreate} disabled={!curDate}>Save budget</button>
                    <button className="mr-1 btn btn-secondary float-right" onClick={handleCancel}>Cancel</button>
                  </CardFooter>
                </Card>}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
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
)(withRouter(PaidSourceBudgetForm));

