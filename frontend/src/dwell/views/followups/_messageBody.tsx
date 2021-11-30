import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import 'src/scss/pages/_email_message.scss';
import 'src/scss/pages/_email_compose.scss';
import { ContentLabel } from 'dwell/views/Settings/styles';
import { AttachGroup } from './styles';
import FilePreview from './_filePreview';

const MessageBody = ({ isCollapsed, messageBody, attachments }) => {
  const iFrameRef = useRef();

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

        if (!document.getElementById('font-styles')) {
          const link = document.createElement('link');
          link.id = 'font-styles';
          link.rel = 'stylesheet';
          link.href = 'https://fonts.googleapis.com/css?family=Source+Sans+Pro';
          document.head.appendChild(link);
        }
        if (!document.head.getElementsByTagName('base')[0]) {
          const base = document.createElement('base');
          base.target = '_blank';
          document.head.appendChild(base);
        }
        const { body } = document;
        const html = document.documentElement;
        const height = Math.max(body.scrollHeight, body.offsetHeight, html.offsetHeight) + 30;
        iFrame.style.height = `${height}px`;
      }
    }, 200);
  };

  useEffect(() => {
    resizeIframe();
  }, [isCollapsed]);

  return (
    <React.Fragment>
      <div className="iframe-container mb-2">
        <iframe
          title="message-body"
          className="message-body"
          srcDoc={messageBody.replace(/<\/head>/g, '<base target="_blank"/></head>')}
          ref={iFrameRef}
          onLoad={resizeIframe}
          width="100%"
        />
      </div>
      {!isEmpty(attachments) &&
      <React.Fragment>
        <hr />
        <ContentLabel className="mt-5">Attachments:</ContentLabel>
        <AttachGroup>
          {attachments.map((file, index) => (
            <li key={index}>
              <FilePreview file={file} />
            </li>))}
        </AttachGroup>
      </React.Fragment>}
    </React.Fragment>
  );
};

export default connect(
  null,
  {},
)(MessageBody);
