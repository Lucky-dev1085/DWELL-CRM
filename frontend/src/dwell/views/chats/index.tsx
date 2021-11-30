import React, { FC, useState, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import moment from 'moment';

import { getPropertyId } from 'src/utils';
import { build, client } from 'dwell/constants/paths';
import chatEvaluationActions from 'dwell/actions/chat_evaluation';
import { CHAT_EVALUATION_STATUSES } from 'dwell/constants/chat_evaluations';
import UncontrolledRemotePagination from 'dwell/components/remote_pagination/uncontrolled';
import { ContentHeader, ContentTitle } from 'styles/common';

import { Avatar, TableChats, MoreActionNav, BadgeSpan } from './styles';
import { ContainerFluid, NavLinkWithTooltip, formatInteger } from '../utils';

const Badge = ({ status }: { status: keyof typeof CHAT_EVALUATION_STATUSES }) => (
  <BadgeSpan status={status}>{CHAT_EVALUATION_STATUSES[status]}</BadgeSpan>
);

const Chats: FC<RouteComponentProps> = ({ history: { push } }) => {
  const { getChatReports } = chatEvaluationActions;
  const data = useSelector(state => state.chats_evaluation.chats_list);
  const isLoaded = useSelector(state => state.chats_evaluation.isLoaded);
  const pagination = useSelector(state => state.chats_evaluation.data || {});
  const [chatsList, setChatsList] = useState(data);

  useEffect(() => {
    setChatsList(data);
  }, [data]);

  const siteId = getPropertyId();

  const columns = [
    {
      dataField: 'id',
      text: '',
      style: { cursor: 'default' },
      formatter: () => <Avatar icon="question-answer-fill" />,
    },
    {
      dataField: 'session_date',
      text: 'Session',
      style: { width: '20%', cursor: 'default' },
      formatter: date => <strong>{moment(date).format('MMMM YYYY')}</strong>,
    },
    {
      dataField: 'conversations',
      text: 'Conversations',
      style: { width: '20%', cursor: 'default' },
      formatter: formatInteger,
    },
    {
      dataField: 'questions',
      text: 'Questions',
      style: { width: '20%', cursor: 'default' },
      formatter: formatInteger,
    },
    {
      dataField: 'status',
      text: 'Status',
      style: { width: '20%', cursor: 'default' },
      formatter: status => <Badge status={status} />,
    },
    {
      dataField: '',
      text: '',
      style: { width: '20%', cursor: 'default' },
      formatter: (cell, row) => (
        <MoreActionNav>
          <NavLinkWithTooltip id={`evaluate-${row.id}`} icon="shield-check-line" title="Evaluate" onClick={() => push(build(client.CHATS.EVALUATION, siteId, row.id))} />
          <NavLinkWithTooltip id={`report-${row.id}`} icon="bar-chart-box-line" title="Report" onClick={() => push(build(client.CHATS.REPORT, siteId, row.id))} />
        </MoreActionNav>
      ),
    },
  ];

  return (
    <ToolkitProvider keyField="id" data={chatsList.map(chatListItem => ({ ...chatListItem, conversations: chatListItem.conversations.total }))} columns={columns}>
      {props => (
        <ContainerFluid>
          <Helmet>
            <title>DWELL | Chats</title>
          </Helmet>
          <ContentHeader>
            <ContentTitle>Chats Overview</ContentTitle>
          </ContentHeader>
          <TableChats>
            <UncontrolledRemotePagination
              {...props.baseProps}
              setData={setChatsList}
              remoteAction={getChatReports}
              totalSize={pagination.count}
              sizePerPage={20}
              hideSizePerPage
              isLoaded={isLoaded}
            />
          </TableChats>
        </ContainerFluid>
      )}
    </ToolkitProvider>
  );
};

export default withRouter(Chats);
