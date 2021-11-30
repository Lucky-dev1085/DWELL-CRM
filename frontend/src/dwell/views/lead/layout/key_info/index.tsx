import React, { FC, useEffect, useRef, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Tooltip, Dropdown } from 'reactstrap';
import { clone, isEmpty } from 'lodash';
import moment from 'moment';
import TimeAgo from 'react-timeago';
import { connect } from 'react-redux';
import actions from 'dwell/actions/index';
import Skeleton from 'react-loading-skeleton';
import { LineSkeleton } from 'src/utils';
import { UserProps, Lead } from 'src/interfaces';
import { AcquisitionDropdownMenu, AcquisitionDropdownLink } from 'dwell/views/lead/overview/styles';
import {
  MediaAvatar,
  MediaBody,
  MediaLead,
  MediaInfo,
  MediaLabel,
  MediaValue,
  PMSSyncStatus,
} from './style';
import NameInput from './_nameInput';
import { getLeadId } from '../../layout/utils';
import NavLeadOptions from './_nav_lead_option';

interface PMSSyncDetailResponse {
  result: {
    data: {
      id: number,
      pms_sync_status: string,
    }
  }
}

interface KeyInfoProps extends RouteComponentProps {
  lead: Lead,
  onSave: (data: { first_name: string, last_name: string } | { move_in_date: Date } | {status?: string}) => null,
  onDelete: () => Promise<null>,
  getPMSSyncStatusById: (string) => Promise<PMSSyncDetailResponse>,
  availableOwners: UserProps[],
  pmsSyncData: {pms_sync_date: Date, pms_sync_status: string, pms_sync_condition_lack_reason: string},
  isShared: boolean,
  label: string,
}

const KeyInfo: FC<KeyInfoProps> = ({
  lead: oldLead,
  onSave,
  getPMSSyncStatusById,
  location: { pathname },
  pmsSyncData = {
    pms_sync_date: '', pms_sync_status: '', pms_sync_condition_lack_reason: '',
  },
  isShared,
  label,
  availableOwners,
}) => {
  const [lead, setLead] = useState({} as Lead);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isExpandingHistory, setIsExpandingHistory] = useState(false);
  const timer = useRef({});

  const stopPolling = () => {
    clearInterval(timer.current as NodeJS.Timeout);
    setIsPolling(false);
  };

  useEffect(() => {
    if (isPolling) {
      stopPolling();
    }
  }, [pathname]);

  useEffect(() => () => stopPolling(), []);

  const pollSyncStatus = () => {
    timer.current = setInterval(() => {
      getPMSSyncStatusById(getLeadId(pathname)).then((response) => {
        if (response) {
          const { result: { data: { pms_sync_status: pmsSyncStatus } } } = response;
          if (pmsSyncStatus !== 'SYNCING') {
            clearInterval(timer.current as NodeJS.Timeout);
            setIsPolling(false);
          }
        }
      });
    }, 5000);
  };

  useEffect(() => {
    setLead(clone(oldLead));
  }, [oldLead]);

  useEffect(() => {
    if (pmsSyncData.pms_sync_status === 'SYNCING' && !isPolling) {
      setIsPolling(true);
      pollSyncStatus();
    }
  }, [pmsSyncData]);

  // const testResman = () => {
  //   testResman(pathname.split('/').pop());
  // };

  const { first_name: firstName,
    last_name: lastName,
    last_followup_date: lastFollowupDate,
    last_activity_date: lastActivityDate,
    acquisition_date: acquisitionDate,
    acquisition_history: acquisitionHistory,
  } = lead;

  const { pms_sync_date: pmsSyncDate, pms_sync_status: pmsSyncStatus, pms_sync_condition_lack_reason: notSyncReason } = pmsSyncData;

  let syncStatusIcon = 'ri-indeterminate-circle-line';
  if (pmsSyncStatus === 'SUCCESS') syncStatusIcon = 'ri-checkbox-circle-line';
  if (pmsSyncStatus === 'SYNCING') syncStatusIcon = 'ri-refresh-line';
  if (pmsSyncStatus === 'FAILURE') syncStatusIcon = 'ri-information-line';
  const isLeadLoad = !isEmpty(lead);

  const getSyncStatus = () => (
    <PMSSyncStatus status={pmsSyncStatus}>
      <span id="pms_sync">
        <i className={syncStatusIcon} />
        {pmsSyncStatus === 'NOT_STARTED' && notSyncReason}
        {pmsSyncStatus === 'SYNCING' && 'Syncing ...'}
        {['SUCCESS', 'FAILURE'].includes(pmsSyncStatus) && (
          <React.Fragment>
            {pmsSyncStatus === 'SUCCESS' ? 'Synced' : 'Not synced'} (<TimeAgo title={moment(pmsSyncDate).format('YYYY-MM-DD HH:mm')} date={pmsSyncDate} live={false} />)
            <Tooltip placement="top" isOpen={tooltipOpen} target="pms_sync" toggle={() => setTooltipOpen(!tooltipOpen)}>
              {moment(pmsSyncDate).format('lll')}
            </Tooltip>
          </React.Fragment>
        )}
      </span>
    </PMSSyncStatus>
  );

  const getNumberWithOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const acquisitionHistoryLength = (acquisitionHistory || []).length;
  const acquisitionHistoryContainer = (
    <Dropdown isOpen={isExpandingHistory} toggle={() => setIsExpandingHistory(!isExpandingHistory)}>
      <AcquisitionDropdownLink onClick={() => setIsExpandingHistory(!isExpandingHistory)} tag="a">
        <span className="text-dark mg-r-5">Acquired {acquisitionHistoryLength} time{acquisitionHistoryLength && 's'}</span> View
      </AcquisitionDropdownLink>
      <AcquisitionDropdownMenu positionFixed>
        <table className="table table-sm table-bordered mg-b-0">
          <tbody>
            {(acquisitionHistory || []).map((item, index) => (
              <tr>
                <th className="wd-15p">{getNumberWithOrdinal(index + 1)}</th>
                <td className="wd-35p text-nowrap">{moment(item.date).format('lll')}</td>
                <td className="wd-50p text-nowrap">{item.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AcquisitionDropdownMenu>
    </Dropdown>
  );

  return (
    <React.Fragment>
      <MediaLead>
        {isLeadLoad ? <MediaAvatar><span>{firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : ''}</span></MediaAvatar> :
          <Skeleton circle height={38} width={38} />}
        <MediaBody>
          <NameInput firstName={firstName} lastName={lastName} onSave={onSave} isShared={isShared} label={label} getSyncStatus={getSyncStatus} />
        </MediaBody>
        <MediaInfo>
          <MediaLabel>{isLeadLoad ? 'Last Followup Date' : <LineSkeleton height={8} width={150} />}</MediaLabel>
          <MediaValue>
            {isLeadLoad ? <>{lastFollowupDate ? <TimeAgo title={moment(lastFollowupDate).format('YYYY-MM-DD HH:mm')} date={lastFollowupDate} live={false} /> : <>&nbsp;</>}</> :
              <LineSkeleton height={9} width={100} />}
          </MediaValue>
        </MediaInfo>
        <MediaInfo>
          <MediaLabel>{isLeadLoad ? 'Last Activity Date' : <LineSkeleton height={8} width={150} />}</MediaLabel>
          <MediaValue>
            {isLeadLoad ? <>{lastActivityDate ? <TimeAgo title={moment(lastActivityDate).format('YYYY-MM-DD HH:mm')} date={lastActivityDate} live={false} /> : <>&nbsp;</>}</> :
              <LineSkeleton height={9} width={100} />}
          </MediaValue>
        </MediaInfo>
        <MediaInfo>
          <MediaLabel>{isLeadLoad ? 'Acquisition Date' : <LineSkeleton height={8} width={150} />}</MediaLabel>
          <MediaValue>
            {isLeadLoad ?
            // eslint-disable-next-line no-nested-ternary
              <>{acquisitionHistory ?
                acquisitionHistoryContainer :
                (acquisitionDate ? moment(acquisitionDate).format('lll') : <>&nbsp;</>)}
              </> :
              <LineSkeleton height={9} width={100} />}
          </MediaValue>
        </MediaInfo>
      </MediaLead>
      <NavLeadOptions
        lead={lead}
        handleSave={onSave}
        isShared={isShared}
        availableOwners={availableOwners}
      />
      {/* for test only */}
      {/* <Button className="ml-2" onClick={this.testResman}>Submit Application</Button> */}
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  pmsSyncData: state.lead.pmsSyncData,
  lead: state.lead.lead,
});

export default connect(
  mapStateToProps,
  {
    ...actions.lead,
  },
)(withRouter(KeyInfo));
