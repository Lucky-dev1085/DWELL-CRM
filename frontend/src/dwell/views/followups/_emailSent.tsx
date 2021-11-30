import React, { FC, useState } from 'react';
import moment from 'moment';
import { Collapse } from 'reactstrap';
import MessageBody from 'dwell/views/followups/_messageBody';
import 'font-awesome/css/font-awesome.min.css';
import 'src/scss/pages/_email_compose.scss';
import { EmailPanelItem, EmailHeader, MediaMailForm, MediaAvatar, MediaBody, EmailBody, EmailBodySubject, EmailBodyText } from 'dwell/views/followups/styles';
import { EmailMessageProps } from 'src/interfaces';
import { getInitials, getColor } from 'dwell/views/followups/utils';

interface Props {
  email: EmailMessageProps,
}

const EmailSent: FC<Props> = ({ email: { body, subject, date, sender_name: senderName, sender_email: senderEmail, receiver_name: receiverName,
  receiver_email: receiverEmail, attachments } }) => {
  const [isCollapsed, setMessageState] = useState(true);
  return (
    <EmailPanelItem onClick={() => setMessageState(!isCollapsed)} showCursor>
      <EmailHeader>
        <MediaMailForm>
          <MediaAvatar className={getColor(senderEmail)}>{getInitials(senderName)}</MediaAvatar>
          <MediaBody>
            <p>From: <strong>{senderName} </strong> ({senderEmail})</p>
            <p>To: <strong>{receiverName}</strong> ({receiverEmail})</p>
            <p>{moment(date).format('LLL')}</p>
          </MediaBody>
        </MediaMailForm>
      </EmailHeader>
      <Collapse isOpen={!isCollapsed}>
        <EmailBody>
          <EmailBodySubject>{subject}</EmailBodySubject>
          <EmailBodyText><MessageBody messageBody={body} isCollapsed={isCollapsed} attachments={attachments} /></EmailBodyText>
        </EmailBody>
      </Collapse>
    </EmailPanelItem>
  );
};

export default EmailSent;
