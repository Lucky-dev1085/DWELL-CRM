import React, { FC, useEffect, useState, useRef } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import CKEditor from 'ckeditor4-react';
import TimeAgo from 'react-timeago';
import { debounce, get } from 'lodash';
import leadAction from 'dwell/actions/lead';
import { CustomSelect } from 'src/common';
import { LineSkeleton } from 'src/utils';
import { ActiveNote as ActiveTab } from 'src/interfaces';
import { communicationTypes, communicationIcons, timeFormatter } from 'dwell/constants';
import { LeadPanelBody, LeadPanelSideBar, SideBarHeader, SearchIcon, FormSearch, SideBarContent, CommItem, Avatar, CommItemBody, BodyHeader,
  CommMessage, ShowMore, SearchWrapper, EmptySearch, GreenBadge, ClearInput, PreloadEditor, TimeWrapper } from './styles';
import { isElementInViewport, noActivityIcon } from './utils';
import LeadCommunicationContent from './_lead_communication_content';

CKEditor.editorUrl = `${window.location.origin}/static/ckeditor/ckeditor.js`;

interface LeadCommunicationProps extends RouteComponentProps {
  isShared: boolean,
  location: {pathname: string, state: { alreadyLoaded: boolean }, hash: string, search: string },
  isLeaseStart: boolean,
}

const communicationOptions = [
  { label: 'All Activity', name: '' }, { label: 'divider' }, { label: 'Notes', name: 'note' },
  { label: 'Updates', name: 'update' }, { label: 'Calls', name: 'call' },
  { label: 'Emails', name: 'email' }, { label: 'SMS', name: 'sms' },
  { label: 'Chats', name: 'chat' },
];

const MESSAGE_CONTENT = {
  ACTIVITY: 'transformed_content',
  EMAIL: 'subject',
  CALL: 'source',
  SMS: 'message',
  CHATS: 'message',
  NOTE: 'text',
};

const LeadCommunication: FC<LeadCommunicationProps> = ({ location, isShared, isLeaseStart }) => {
  const { pathname } = location;
  const { alreadyLoaded } = location.state || {};
  const [activeTab, setActiveTab] = useState({ id: -1, isClick: false } as ActiveTab);
  const [limitMore, setLimitMore] = useState(null);
  const [isViewMore, setIsViewMore] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [audioPlayId, setPlayId] = useState({ id: null, isPlay: null });

  const dispatch = useDispatch();
  const isCommunicationLoaded = useSelector(state => state.lead.isCommunicationLoaded);
  const communications = useSelector(state => state.lead.communications);
  const isCommunicationUpdate = useSelector(state => state.lead.isCommunicationUpdate);
  const isChatPusher = useSelector(state => state.lead.isChatPusher);
  const keyword = useSelector(state => state.lead.communicationSearchKeyword);
  const filterType = useSelector(state => state.lead.communicationFilterType);

  const { getCommunicationsById, setCommunicationSearchKeyword: setKeyword, setCommunicationFilterType: setFilterType } = leadAction;

  const timer = useRef(null);
  const cancelToken = useRef(null);

  const leadId = Number(pathname.split('/').pop());

  useEffect(() => {
    if (leadId && (!alreadyLoaded || !isCommunicationLoaded)) {
      dispatch(getCommunicationsById(leadId, { type: filterType, keyword })).then(() => {
        setIsLoaded(true);
      });
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (leadId && isLoaded) {
      dispatch(getCommunicationsById(leadId, { type: filterType, keyword }));
    }
  }, [filterType, leadId, isChatPusher]);

  useEffect(() => {
    setPlayId({ id: null, isPlay: null });
  }, [filterType, keyword]);

  useEffect(() => {
    if (isLoaded) {
      const timeout = ['TOUR_CREATED', 'TASK_CREATED'].includes(get(communications, '[0].object.type', '')) ? 1200 : 0;
      setTimeout(() => setActiveTab({ id: get(communications, '[0].object.id'), isClick: true, isLast: true }), timeout);
    }
  }, [isCommunicationUpdate]);

  const scrollToBottom = () => {
    const element = document.getElementById('lead-sidebar-content');
    if (element) element.scrollTo({ left: 0, top: element.scrollHeight, behavior: 'smooth' });
    setIsViewMore(false);
  };

  const reloadWithRequestCancel = () => {
    if (cancelToken.current) {
      cancelToken.current.cancel('Operation canceled due to new request.');
    }

    cancelToken.current = axios.CancelToken.source();
    if (isLoaded) {
      dispatch(getCommunicationsById(leadId, { type: filterType, keyword }, cancelToken.current.token));
    }
  };

  useEffect(() => {
    if (keyword === null) return;
    if (!keyword) {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      reloadWithRequestCancel();
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      timer.current = null;
      reloadWithRequestCancel();
    }, 500);
  }, [keyword]);

  const filteredCommunications = isCommunicationLoaded ? communications : Array(8).fill('');
  const isEmptySearch = isCommunicationLoaded && !filteredCommunications.length;
  const isEmptyCommunication = isCommunicationLoaded && communications.length === 0 && !keyword;

  const onScrollSidebar = () => {
    if (isViewMore && isCommunicationLoaded) {
      const windowHeight = document.documentElement.clientHeight;
      let countViewMore = 0;

      filteredCommunications.forEach(({ object: comm, type }) => {
        const isChat = type === 'CHATS';
        const element = document.getElementById(`side-${isChat ? get(comm, '[0].id') : comm.id}`);
        const elementOffset = element.getBoundingClientRect().bottom;

        if (elementOffset >= windowHeight) {
          countViewMore += 1;
        }
      });

      if (!countViewMore) setIsViewMore(false);
      setLimitMore(countViewMore);
    }
  };

  useEffect(() => {
    onScrollSidebar();
  }, [isViewMore]);

  useEffect(() => {
    if (communications && communications.length) {
      setActiveTab({ id: communications[0].object.id, isClick: false });
      setIsViewMore(true);
      onScrollSidebar();
    }
  }, [communications]);

  useEffect(() => {
    const element = document.getElementById(`side-${activeTab.id}`);

    if (element && !isElementInViewport(element, isLeaseStart)) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab]);

  const emptySearch = isEmptyCom => (
    <EmptySearch>
      <i className={isEmptyCom ? noActivityIcon(filterType) : 'ri-search-line'} />
      <h5>{isEmptyCom ? `No ${filterType} activity yet` : 'No results found'}</h5>
      <p>{isEmptyCom ? '' : 'Try adjusting your search or filter to find what you\'re looking for.'}</p>
    </EmptySearch>
  );

  const headerByType = (type, el, isPropertyCommunication) => {
    let header;
    switch (type) {
      case 'ACTIVITY':
        header = el.type === 'TOUR_CREATED' ? el.transformed_content : communicationTypes[el.type];
        break;
      case 'EMAIL':
        header = el.formatted_sender_name && `Sender: ${el.formatted_sender_name}`;
        break;
      case 'CALL':
        header = `${el.call_result === 'no-answer' ? 'Missed' : 'Answered'} - ${moment.utc(el.duration * 1000).format('m:ss')}`;
        break;
      case 'SMS':
        header = `SMS from: ${isPropertyCommunication ? el.agent_name : el.lead_name}`;
        break;
      case 'CHATS': {
        const countMessages = el.filter(c => !['AGENT_REQUEST', 'JOINED'].includes(c.type)).length;
        header = `${countMessages} Chat ${countMessages === 1 ? 'Message' : 'Messages'}`;
        return header;
      }
      case 'NOTE':
        header = 'Internal Note';
        break;
      default:
        header = '';
    }

    return <h6>{header}</h6>;
  };

  const getIconColor = (isPropertyCommunication, type) => {
    if (isPropertyCommunication === true) {
      return '#15274d';
    }
    if (type === 'NOTE') {
      return '#c1c8de';
    }
    if (isPropertyCommunication === false) {
      return '#6c4cd6';
    }
    if (type === 'ACTIVITY') {
      return '#c1c8de';
    }
    return false;
  };

  const communicationOption = communicationOptions.find(option => option.name === filterType) || communicationOptions[0];

  return (
    <LeadPanelBody>
      <LeadPanelSideBar>
        <SideBarHeader>
          {communications ?
            <React.Fragment>
              <CustomSelect
                optionList={communicationOptions}
                selected={communicationOption}
                onChange={selected => dispatch(setFilterType(selected.name))}
                fieldName="label"
                noScroll
              />
              <SearchWrapper>
                <SearchIcon />
                <FormSearch
                  name="search"
                  value={keyword}
                  onChange={({ target: { value } }) => dispatch(setKeyword(value))}
                  placeholder={`Search ${communicationOption.label.toLowerCase()}`}
                />
                {keyword && <ClearInput><i className="ri-close-line" onClick={() => dispatch(setKeyword(''))} /></ClearInput>}
              </SearchWrapper>
            </React.Fragment> :
            <React.Fragment>
              <LineSkeleton height={38} />
              <LineSkeleton height={38} style={{ marginTop: '12px' }} />
            </React.Fragment>
          }
        </SideBarHeader>
        <SideBarContent id="lead-sidebar-content" onScroll={debounce(onScrollSidebar, 100)}>
          {isEmptySearch ? emptySearch(isEmptyCommunication) :
            filteredCommunications.map(({ object: el, type, date, is_property_communication }, index) => {
              const isChat = type === 'CHATS';
              const isEmail = type === 'EMAIL';
              const isNote = type === 'NOTE';
              // const dotsColor = isEmail && (moment() < moment(el.date).endOf('day') ? '#ffc107' : '#f3505c');
              const isPlaying = el && (audioPlayId.id === el.id && audioPlayId.isPlay);
              const iconColor = isPlaying ? '#f86c6b' : getIconColor(is_property_communication, type);
              const idChatMessage = isChat && el.findIndex(chat => chat.message && !chat.message.startsWith('<'));
              const chatSideMessage = isChat && (idChatMessage !== -1 ? el[idChatMessage][MESSAGE_CONTENT[type]] : '');
              let message = el && (isChat ? chatSideMessage : el[MESSAGE_CONTENT[type]]);
              message = el && (el.type === 'TOUR_CREATED' ? `${get(el, 'tour.owner', '') ? `Assigned to: ${get(el, 'tour.owner', '')}` : ''}` : message);
              const preparedMessage = message && `${message.substring(0, 72)}${message.length > 75 ? '...' : ''}`;
              const isRecentDate = Math.abs(moment(date).diff(moment(), 'm')) <= 5;
              const isSelected = el && (isChat ? activeTab.id === el[0].id : activeTab.id === el.id);
              const dateTitle = moment(date).format('lll');

              return (
                !el ?
                  <CommItem key={index}>
                    <LineSkeleton height={38} width={38} circle />
                    <CommItemBody>
                      <BodyHeader>
                        <LineSkeleton height={12} width={120} />
                        <LineSkeleton height={8} width={80} />
                      </BodyHeader>
                      <LineSkeleton height={9} />
                      <LineSkeleton height={9} width={150} />
                    </CommItemBody>
                  </CommItem> :
                  <CommItem
                    key={index}
                    selected={isSelected}
                    onClick={() => setActiveTab({ id: isChat ? el[0].id : el.id, isClick: true })}
                    lightGray={isEmail && el.is_unread}
                    isNote={isNote}
                    id={`side-${isChat ? el[0].id : el.id}`}
                  >
                    <Avatar color={iconColor}><i className={isPlaying ? 'ri-volume-up-line' : communicationIcons[el.type || type]} /></Avatar>
                    <CommItemBody>
                      <BodyHeader>
                        {headerByType(type, el, is_property_communication)}
                        {/* {dotsColor && <CommDot color={dotsColor} />}  TODO phase 2 */}
                        {isRecentDate ?
                          <GreenBadge title={dateTitle}>JUST NOW</GreenBadge> :
                          <TimeWrapper>
                            <span>{<TimeAgo date={dateTitle} formatter={timeFormatter} />}</span>
                            <span>{moment(date).format('ll')}</span>
                          </TimeWrapper>}
                      </BodyHeader>
                      <CommMessage dangerouslySetInnerHTML={{ __html: isNote ? preparedMessage.replace(/<[^>]*>/g, ' ') : preparedMessage }} selected={isSelected} />
                    </CommItemBody>
                  </CommItem>
              );
            })
          }
        </SideBarContent>
        {!!limitMore && !isEmptySearch && isCommunicationLoaded && isViewMore &&
          <ShowMore onClick={scrollToBottom}>
            <i className="ri-arrow-down-line" />  {limitMore} more
          </ShowMore>}
      </LeadPanelSideBar>
      {isCommunicationLoaded &&
        <LeadCommunicationContent
          communications={filteredCommunications}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isShared={isShared}
          audioPlayId={audioPlayId}
          handlePlay={setPlayId}
        />}
      <PreloadEditor>
        <CKEditor
          id="preload-editor"
          editorName="editor"
          className="editor"
          config={{ removePlugins: 'placeholder_select' }}
        />
      </PreloadEditor>
    </LeadPanelBody>
  );
};

export default withRouter(LeadCommunication);
