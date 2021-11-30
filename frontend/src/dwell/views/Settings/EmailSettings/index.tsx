import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { toast, ToastOptions } from 'react-toastify';
import { toastOptions } from 'site/constants';
import { connect } from 'react-redux';
import { Button, Card, CardBody, CustomInput, Spinner } from 'reactstrap';
import { faCheckCircle as faSolidCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import { faSync } from '@fortawesome/free-solid-svg-icons/faSync';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons/faCheckCircle';
import { isEmpty } from 'lodash';
import actions from 'dwell/actions';
import Loader from 'dwell/components/Loader';
import 'src/scss/pages/_email_template.scss';
import 'src/scss/pages/_assign_lead_owners.scss';
import 'src/scss/pages/_email_sync.scss';
import 'spinkit/css/spinkit.css';
import { SuccessResponse } from 'src/interfaces';
import {
  ContentText,
  ContentTitleSm,
} from 'dwell/views/Settings/styles';
import {
  EmailMedia,
  EmailMediaIcon,
  EmailSyncHeader,
  EmailMediaBody,
  TextMuted,
  CardSync, SyncTitle,
} from 'dwell/views/Settings/EmailSettings/styles';

interface getPropertyResponseProps {
  result: {
    data: {
      id: number
      nylas_status: string,
    }
  }
}

interface PropertyProps {
  nylas_status?: string,
  nylas_selected_labels?: string,
  nylas_sync_option?: string,
  shared_email?: string,
  calendar_sync_option?: string,
  nylas_calendar?: string,
  nylas_label?: string,
  selected_calendar?: string,
  selected?: string,
  nylas_selected_calendars?: string,
}

interface CustomProps {
  id: string,
  name: string,
}

interface EmailSettingsProps extends RouteComponentProps {
  getLabels: () => void,
  property: PropertyProps,
  location: {pathname: string, state: { isTokenObtained?: boolean }, hash: string, search: string }
  getCurrentProperty: () => Promise<getPropertyResponseProps>,
  updatePropertyNylasSettings: (data: PropertyProps, msg: () => void) => Promise<SuccessResponse>,
  authorize: () => Promise<SuccessResponse>,
  authUrl: Location,
  labels: CustomProps[],
  isUpdatingStatus: boolean,
  isGettingLabels: boolean,
  calendars: CustomProps[],
  isGettingCalendars: boolean,
  getCalendars: () => void,
}

const EmailSettings: FC<EmailSettingsProps> = ({ getLabels, property, location: { state }, getCurrentProperty, updatePropertyNylasSettings,
  authorize, authUrl, labels, isUpdatingStatus, isGettingLabels, calendars, isGettingCalendars, getCalendars }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const pollNylasStatus = () => {
    const intervalId = setInterval(() => {
      getCurrentProperty().then(({ result: { data: { nylas_status: nylasStatus } } }) => {
        if (nylasStatus !== 'SYNCING') {
          clearInterval(intervalId);
          setIsPolling(false);
          toast.success('The Emails are successfully synced!', toastOptions as ToastOptions);
        }
      });
    }, 5000);
  };

  useEffect(() => {
    if (state && state.isTokenObtained) {
      getCurrentProperty();
    }
    getLabels();
    getCalendars();
  }, []);

  useEffect(() => {
    if (property.nylas_status === 'SYNCING' && !isPolling) {
      setIsPolling(true);
      pollNylasStatus();
    }
    if (!isEmpty(property) && property.nylas_status && property.nylas_status !== 'SYNCING') {
      getLabels();
      getCalendars();
    }
  }, [property]);

  const changeSyncSettings = ({ target: { id, checked, type } }, scope) => {
    let payload = null;
    if (type === 'radio') {
      if (scope === 'email') {
        payload = { nylas_sync_option: id.toUpperCase(), nylas_status: 'SYNCING' };
      } else {
        payload = { calendar_sync_option: id.substring(0, id.lastIndexOf('_')).toUpperCase() };
      }
    }
    if (type === 'checkbox') {
      if (scope === 'email') {
        payload = { nylas_label: id, selected: checked, nylas_status: 'SYNCING' };
      } else {
        payload = { nylas_calendar: id, selected_calendar: checked };
      }
    }
    if (payload) {
      updatePropertyNylasSettings({ ...payload }, () => toast.success('Settings updated', toastOptions as ToastOptions));
    }
  };

  const changeNylasStatus = (status) => {
    updatePropertyNylasSettings({ nylas_status: status }, () => toast.success('Settings updated', toastOptions as ToastOptions));
  };

  const redirectToNylasAuth = () => {
    authorize().then(() => {
      setIsAuthorized(true);
    });
  };

  useEffect(() => {
    if (isAuthorized && authUrl) {
      window.location = authUrl;
      setIsAuthorized(false);
    }
  }, [isAuthorized]);

  const getEmailMedia = (nylasStatus, sharedEmail, isCalendar = false) => (
    <EmailMedia>
      <EmailMediaIcon> <i className={isCalendar ? 'ri-calendar-line' : 'ri-mail-line'} /> </EmailMediaIcon>
      <EmailMediaBody>
        <React.Fragment>
          <TextMuted>{isCalendar ? 'Calendar' : 'Email address'}</TextMuted>
          <h5 className="mb-1">{sharedEmail}</h5>
          <div className="account-info">
            {nylasStatus === 'READY_TO_CONNECT' && <span className="description"><FontAwesomeIcon icon={faCheckCircle} /> Ready to connect</span>}
            {nylasStatus === 'SYNCING' && <span className="description syncing"><FontAwesomeIcon icon={faSync} /> SYNCING</span>}
            {nylasStatus === 'CONNECTED' && <span className="description connected"><FontAwesomeIcon icon={faSolidCheckCircle} /> Connected</span>}
            {nylasStatus === 'DISCONNECTED' && <span className="description disconnected"><FontAwesomeIcon icon={faExclamationTriangle} /> Disconnected</span>}
            {nylasStatus === 'AUTH_REQUIRED' && <span className="description auth_required"><FontAwesomeIcon icon={faExclamationTriangle} /> You need to authorize account</span>}
          </div>
        </React.Fragment>
      </EmailMediaBody>
    </EmailMedia>
  );

  const { nylas_status: nylasStatus, nylas_selected_labels: nylasSelectedLabels, nylas_sync_option: selectedSyncOption, shared_email: sharedEmail,
    calendar_sync_option: calendarSyncOption, nylas_selected_calendars: nylasSelectedCalendars,
  } = property;
  const isUpdating = nylasStatus === 'SYNCING' || isUpdatingStatus;
  return (
    <React.Fragment>
      <EmailSyncHeader>
        <div >
          <ContentTitleSm>Email & Calendar Sync</ContentTitleSm>
          <ContentText>Connect and sync a shared email address and shared calendar to manage lead communication and tours directly from Dwell.</ContentText>
        </div>
        <div className="connect-action">
          {isUpdating && <Spinner size="sm" className="mr-2" /> }
          {nylasStatus === 'READY_TO_CONNECT' && <Button color="btn btn-outline-primary" onClick={() => changeNylasStatus('SYNCING')} disabled={isUpdating}><i className="ri-lock-line" />Connect</Button>}
          {nylasStatus === 'CONNECTED' && <Button color="btn btn-outline-primary" onClick={() => changeNylasStatus('DISCONNECTED')} disabled={isUpdating}><i className="ri-lock-unlock-fill" /> Disconnect</Button>}
          {nylasStatus === 'DISCONNECTED' && <Button color="btn btn-outline-primary" onClick={() => changeNylasStatus('SYNCING')} disabled={isUpdating}><i className="ri-lock-line" />Reconnect</Button>}
          {nylasStatus === 'AUTH_REQUIRED' && <Button color="btn btn-outline-primary" onClick={redirectToNylasAuth} disabled={isUpdating}>Authorize</Button>}
        </div>
      </EmailSyncHeader>
      <hr className="op-0" />
      {nylasStatus ?
        <React.Fragment>
          {getEmailMedia(nylasStatus, sharedEmail)}
          {nylasStatus !== 'AUTH_REQUIRED' && (
            <CardSync>
              <div className="sync-title">
                <SyncTitle >Sync settings</SyncTitle>
              </div>
              <CustomInput
                className="mb-2"
                type="radio"
                id="sync_all"
                name="customRadio"
                label="All emails will be synced with Dwell"
                checked={selectedSyncOption === 'SYNC_ALL'}
                onChange={e => changeSyncSettings(e, 'email')}
              />
              <CustomInput
                className="mb-2"
                type="radio"
                id="sync_labeled"
                name="customRadio"
                label="Only emails with certain labels will be synced with Dwell"
                checked={selectedSyncOption === 'SYNC_LABELED'}
                onChange={e => changeSyncSettings(e, 'email')}
              />
              {selectedSyncOption === 'SYNC_LABELED' ?
                <Card className="labels ml-4">
                  <CardBody>
                    {isGettingLabels ? <Loader /> :
                      <React.Fragment>
                        {labels.map(label =>
                          (<CustomInput
                            key={label.id}
                            type="checkbox"
                            id={label.id}
                            className="mb-2"
                            label={label.name}
                            onChange={e => changeSyncSettings(e, 'email')}
                            checked={nylasSelectedLabels && nylasSelectedLabels.includes(label.id)}
                          />))}
                      </React.Fragment>}
                  </CardBody>
                </Card>
                : null}
            </CardSync>
          )}
          <hr className="mg-y-30" />
          {getEmailMedia(nylasStatus, sharedEmail, true)}

          {nylasStatus !== 'AUTH_REQUIRED' && (
            <CardSync>
              <div className="sync-title">
                <SyncTitle>Sync settings</SyncTitle>
              </div>
              <CustomInput
                className="mb-2"
                type="radio"
                id="sync_all_events"
                name="customRadioEvents"
                label="All calendar events will be synced with Dwell"
                checked={calendarSyncOption === 'SYNC_ALL'}
                onChange={e => changeSyncSettings(e, 'calendar')}
              />
              <CustomInput
                className="mb-2"
                type="radio"
                id="sync_labeled_events"
                name="customRadioEvents"
                label="Only calendar events with certain labels will be synced with Dwell"
                checked={calendarSyncOption === 'SYNC_LABELED'}
                onChange={e => changeSyncSettings(e, 'calendar')}
              />
              {calendarSyncOption === 'SYNC_LABELED' ?
                <Card className="labels ml-4">
                  <CardBody>
                    {isGettingCalendars ? <Loader /> :
                      <React.Fragment>
                        {calendars.map(calendar =>
                          (<CustomInput
                            key={calendar.id}
                            type="checkbox"
                            id={calendar.id}
                            className="mb-2"
                            label={calendar.name}
                            onChange={e => changeSyncSettings(e, 'calendar')}
                            checked={nylasSelectedCalendars && nylasSelectedCalendars.includes(calendar.id)}
                          />))}
                      </React.Fragment>}
                  </CardBody>
                </Card>
                : null}
            </CardSync>
          )}
        </React.Fragment>
        : <button className="mr-1 btn btn-primary float-left" onClick={redirectToNylasAuth}><FontAwesomeIcon icon={faPlusCircle} /> Connect email & calendar</button>}
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  authUrl: state.nylas.authUrl,
  isUpdatingStatus: state.property.isUpdatingStatus,
  property: state.property.property,
  labels: state.emailLabel.labels,
  isGettingLabels: state.emailLabel.isGettingLabels,
  calendars: state.calendar.calendars,
  isGettingCalendars: state.calendar.isGettingCalendars,
});

export default connect(
  mapStateToProps,
  {
    ...actions.nylas,
    ...actions.property,
    ...actions.emailLabel,
    ...actions.calendar,
  },
)(withRouter(EmailSettings));
