import React, { FC, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CardBody as ItemBody } from 'reactstrap';
import { get, cloneDeep } from 'lodash';
import axios from 'axios';
import moment from 'moment';
import TimeAgo from 'react-timeago';
import nylasAction from 'dwell/actions/nylas';
import { timeFormatter } from 'dwell/constants';
import { CustomSelect } from 'src/common';
import EmailWindow from 'dwell/components/email/composer/_window';
import { CommunicationObject } from 'src/interfaces';
import { CommunicationItem, CommunicationWrapper, ItemCard, ItemHeader, Avatar, TitleWrapper, EntireMessage, ItemFooter, ButtonWhite, BodyTitle, GreenBadge,
  ShowUnits as EmailInfo, TourTitle as EmailTitle, TimeWrapper } from './styles';
import { getIconColor } from './utils';

interface EmailDetailProps {
  communication: CommunicationObject,
  isPropertyCommunication: boolean,
  index: number,
  date: string,
  handleClickItem: (id: number) => void,
  itemClickId: number,
}

const EmailDetail: FC<EmailDetailProps> = ({ communication, isPropertyCommunication, index, date, handleClickItem, itemClickId }) => {
  const [isViewMore, setViewMore] = useState(false);
  const [isEmailOpen, setEmailOpen] = useState(false);
  const [isLongMessage, setIsLongMessage] = useState(false);
  const [fullEmailHeight, setEmailHeight] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [isRecentDate, setRecentDate] = useState(false);

  const dispatch = useDispatch();
  const lead = useSelector(state => state.lead.lead);
  const { setEmailOpenStatus } = nylasAction;

  const iFrameRef = useRef(null);
  const timer = useRef(null);
  const emailHeight = index > 3 ? 300 : 500;

  const toggleEmailWindow = (isOpen = false) => {
    dispatch(setEmailOpenStatus(isOpen));
    setEmailOpen(isOpen);
  };

  const resizeIframe = () => {
    const intervalId = setInterval(() => {
      const iFrame = iFrameRef.current as HTMLIFrameElement;
      if (iFrame && iFrame.contentWindow.document.body) {
        clearInterval(intervalId);
        const { document } = iFrame.contentWindow;
        document.body.style.margin = '0';
        document.body.style.fontSize = '14px';
        document.body.style.lineHeight = '20px';
        document.body.style.color = '#23282c';
        document.body.style.fontFamily = "'Source Sans Pro', sans-serif";
        document.body.style.overflow = 'hidden';

        const { body } = document;
        const html = document.documentElement;
        const height = Math.max(body.scrollHeight, body.offsetHeight, html.offsetHeight);
        const isLongEmail = height > emailHeight;
        setEmailHeight(height);
        setIsLongMessage(isLongEmail);
        iFrame.style.height = `${isLongEmail ? emailHeight : height}px`;
        iFrame.style.border = 'none';
      }
    }, 200);
  };

  const emailViewMore = () => {
    const iFrame = iFrameRef && iFrameRef.current;
    if (iFrame && isLongMessage) {
      iFrame.style.height = `${isViewMore ? emailHeight : fullEmailHeight}px`;
    }
    setViewMore(!isViewMore);
  };

  const downloadAttachment = () => {
    axios({
      url: attachment.attachment,
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  };

  const prepareAttachmentName = (attachments) => {
    const attachmentsList = cloneDeep(attachments);
    const countName = {};

    attachmentsList.forEach((el, i) => {
      if (!el.name) {
        attachmentsList[i].name = (attachmentsList[i].content_type || '').split('/').shift() || 'file';
      }
    });

    attachmentsList.forEach(({ name }) => countName[name] = (countName[name] || 0) + 1);
    attachmentsList.forEach((el, i) => {
      if (countName[el.name] > 1) {
        countName[el.name] -= 1;
        attachmentsList[i].name = `(${countName[el.name] + 1})${attachmentsList[i].name}`;
      }
    });

    if (!attachment) setAttachment(get(attachmentsList, '[0]', null));

    return attachmentsList;
  };

  const attachmentString = () => {
    if (!attachment) setAttachment(get(communication, 'attachments[0]', null));
    return get(communication, 'attachments[0].name') || 'file';
  };

  useEffect(() => {
    const isRecent = Math.abs(moment(date).diff(moment(), 'm')) <= 5;

    setRecentDate(isRecent);

    if (isRecent) {
      const timeDiff = 360 - moment().diff(moment(date), 'second');

      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(() => {
        timer.current = null;
        setRecentDate(false);
      }, timeDiff * 1000);
    }
  }, [communication]);

  const attachmentsLength = get(communication, 'attachments', []).length;
  const isClicked = itemClickId === communication.id;
  const dateTitle = moment(date).format('lll');

  return (
    <CommunicationItem
      className={isPropertyCommunication ? 'flex-row-reverse' : ''}
      id={`comm-${communication.id}`}
      onClick={() => handleClickItem(communication.id)}
      $first={!index}
    >
      <CommunicationWrapper reverse={isPropertyCommunication}>
        <ItemCard selected={isClicked}>
          <ItemHeader>
            <Avatar color={getIconColor(isPropertyCommunication)}><i className="ri-mail-line" /></Avatar>
            <TitleWrapper>
              <BodyTitle>
                <div>
                  {communication.formatted_sender_name &&
                  <EmailInfo className="mt-0">
                    <EmailTitle>From:</EmailTitle>
                    <EmailTitle weight> {communication.formatted_sender_name}</EmailTitle>
                  </EmailInfo>}
                  {communication.formatted_receiver_name &&
                  <EmailInfo className="mt-0">
                    <EmailTitle>To:</EmailTitle>
                    <EmailTitle weight> {communication.formatted_receiver_name}</EmailTitle>
                  </EmailInfo>}
                  {communication.subject &&
                  <EmailInfo className="mt-0">
                    <EmailTitle>Subject:</EmailTitle>
                    <EmailTitle weight> {communication.subject}</EmailTitle>
                  </EmailInfo>}
                </div>
                <div>
                  {isRecentDate ?
                    <GreenBadge title={dateTitle}>JUST NOW</GreenBadge> :
                    <TimeWrapper sms>
                      <span>{<TimeAgo date={dateTitle} title={dateTitle} formatter={timeFormatter} />}</span>
                      <span>{dateTitle}</span>
                    </TimeWrapper>}
                </div>
              </BodyTitle>
            </TitleWrapper>
          </ItemHeader>
          <ItemBody>
            <div className="iframe-container">
              <iframe
                title="message-body"
                className="message-body"
                srcDoc={communication.body}
                ref={iFrameRef}
                onLoad={resizeIframe}
                width="100%"
              />
            </div>
            {isLongMessage && <EntireMessage onClick={emailViewMore}>{isViewMore ? 'Show Less' : 'View More'}</EntireMessage>}
          </ItemBody>
          <ItemFooter>
            {!!attachmentsLength &&
              <React.Fragment>
                {attachmentsLength === 1 ?
                  attachmentString() :
                  <CustomSelect
                    optionList={prepareAttachmentName(communication.attachments)}
                    selected={attachment}
                    fieldName="name"
                    onChange={selected => setAttachment(selected)}
                  />}
                <ButtonWhite className="btn" onClick={downloadAttachment} icon><i className="ri-download-line" /></ButtonWhite>
              </React.Fragment>}
            <ButtonWhite className="btn" right onClick={() => toggleEmailWindow(true)}><i className="ri-reply-line" /> Reply</ButtonWhite>
          </ItemFooter>
        </ItemCard>
      </CommunicationWrapper>
      {isEmailOpen && <EmailWindow
        handleClose={() => toggleEmailWindow(false)}
        lead={lead}
        message={communication}
        isReply
        isCommunicationReply
      />}
    </CommunicationItem>
  );
};

export default EmailDetail;
