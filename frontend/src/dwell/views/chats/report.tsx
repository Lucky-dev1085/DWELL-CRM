/* eslint-disable jsx-a11y/label-has-for */
import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppBreadcrumb } from '@coreui/react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Row, Col } from 'reactstrap';
import moment from 'moment';

import chatEvaluationActions from 'dwell/actions/chat_evaluation';
import { chatsRoutes } from 'src/routes';
import { ChatReportStats } from 'src/interfaces';
import { ContentHeader, ContentTitle } from 'styles/common';
import { CHAT_MESSAGE_STATUSES } from 'dwell/constants/chat_evaluations';
import { exportChatsEvaluationData } from 'dwell/views/Reports/ReportBlocks/_utils';
import Loader from 'dwell/components/Loader';

import {
  ContentChatReport,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardComprop,
  BreakdownItem,
  ExportIconButton,
  ReportsFilterSelect,
} from './styles';
import { formatInteger } from '../utils';

const ChatReport: FC<RouteComponentProps<{ id: string }>> = ({ location: { pathname } }) => {
  const reportId = Number(pathname.split('/').pop());

  const dispatch = useDispatch();
  const report: ChatReportStats = useSelector(state => state.chats_evaluation.chat);
  const isLoaded = useSelector(state => state.chats_evaluation.isLoaded);
  const [filterOption, setFilterOption] = useState<string>('All');
  const { getChatReportById } = chatEvaluationActions;
  const changeFilterValue = (value) => {
    setFilterOption(value.currentTarget.value);
  };

  useEffect(() => {
    dispatch(getChatReportById(reportId, filterOption));
  }, [filterOption]);

  const exportData = () => exportChatsEvaluationData(report);

  return (
    <ContentChatReport>
      <Helmet>
        <title>DWELL | Chat Report</title>
      </Helmet>
      <ContentHeader>
        <div className="mr-auto">
          <AppBreadcrumb appRoutes={chatsRoutes} />
          <div className="d-flex align-items-center">
            <ContentTitle className="mr-5">Report</ContentTitle>
          </div>
          <p className="mg-b-0">{report.session_date && moment(report.session_date).format('MMMM YYYY [Session]')}</p>
        </div>
        { (report.conversations && report.status === 'COMPLETED') && (
          <ExportIconButton
            id="export-data"
            icon="share-forward-line"
            title="Export monthly session data"
            onClick={exportData}
          />
        )}
      </ContentHeader>
      {
        isLoaded ?
          <>
            {
              !report.conversations || report.status !== 'COMPLETED' ? (
                <Card>
                  <CardBody style={{ flexDirection: 'column' }}>
                    <i className="ri-bar-chart-2-line" />
                    <h4>No Data to Review yet</h4>
                    <p>This monthly session is currently under review. Once the evaluation process is COMPLETED, the reports will be generated here.</p>
                  </CardBody>
                </Card>
              ) : (
                <Row>
                  <Col sm={4}>
                    <CardComprop>
                      <CardHeader>
                        <CardTitle>Conversation Report</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Col>
                          <BreakdownItem>
                            <h2>{formatInteger(report.conversations.total)}</h2>
                            <label>Total Conversations</label>
                          </BreakdownItem>
                        </Col>
                        <Col>
                          <BreakdownItem>
                            <h2>{report.conversations.avg}%</h2>
                            <label>Avg Conversation Score</label>
                          </BreakdownItem>
                        </Col>
                      </CardBody>
                    </CardComprop>
                  </Col>
                  <Col>
                    <CardComprop>
                      <CardHeader>
                        <CardTitle>Responses Accuracy Report</CardTitle>
                        <div style={{ position: 'absolute', top: 20, right: 23 }}><span>Show responses for: </span>
                          <span>
                            <ReportsFilterSelect
                              style={{
                                width: `${filterOption === 'All' ? (7 * filterOption.length) + 20 : (7 * filterOption.length) + 55}px`,
                              }}
                              value={filterOption}
                              onChange={value => changeFilterValue(value)}
                            >
                              <option value="All">All</option>
                              <option value="Supported">Supported only</option>
                              <option value="Not_supported">Not supported only</option>
                            </ReportsFilterSelect>
                          </span>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <Col>
                          <BreakdownItem>
                            <h2>{formatInteger(report.responses.total)}</h2>
                            <label>Total Responses</label>
                          </BreakdownItem>
                        </Col>
                        {CHAT_MESSAGE_STATUSES.map(({ status, label, icon }) => (
                          <Col key={status}>
                            <BreakdownItem status={status}>
                              <h2>
                                <i className={`ri-${icon}`} />{' '}
                                {formatInteger(report.responses[status].count)}
                              </h2>
                              <label>{label}</label>
                            </BreakdownItem>
                          </Col>
                        ))}
                      </CardBody>
                    </CardComprop>
                  </Col>
                </Row>
              )
            }
          </>
          :
          <Loader />

      }
    </ContentChatReport>
  );
};

export default withRouter(ChatReport);
