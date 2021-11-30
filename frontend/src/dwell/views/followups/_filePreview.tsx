import React, { useEffect, useState, FC } from 'react';
import { isEmpty } from 'codemirror/src/util/misc';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArchive } from '@fortawesome/free-solid-svg-icons/faFileArchive';
import { faFileAudio } from '@fortawesome/free-solid-svg-icons/faFileAudio';
import { faFileVideo } from '@fortawesome/free-solid-svg-icons/faFileVideo';
import PreviewModal from './_previewModal';
import { Thumbnail, FileName } from './styles';

interface FilePreviewProps {
  file?: {
    name?: string,
    attachment?: string,
    content_type?: string,
    size?: number,
  },
}

const FilePreview: FC<FilePreviewProps> = ({ file }): JSX.Element => {
  const [selectedFile, setSelectedFile] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [attachmentType, setAttachmentType] = useState('image');
  const [isHovering, setIsHovering] = useState(false);

  const popularDocTypes = ['msword', 'vnd.ms-excel', 'vnd.ms-powerpoint',
    'vnd.openxmlformats-officedocument.wordprocessingml.document',
    'vnd.openxmlformats-officedocument.presentationml.presentation',
    'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const contentType = (attachment) => {
    const types = attachment.content_type.split('/');
    if (!isEmpty(attachment)) {
      if (types[0] === 'image') {
        setAttachmentType('image');
      } else
      if (popularDocTypes.includes(types[1])) {
        setAttachmentType('document');
      } else
      if (['zip', 'x-gzip', 'x-compressed'].includes(types[1])) {
        setAttachmentType('archive');
      } else setAttachmentType('other');
    }
  };

  useEffect(() => contentType(file), [file]);

  const convertFileSize = (size) => {
    if (size < 1024) {
      return `${size}b`;
    } else
    if (size < 1024 * 1024) {
      return `${+(size / 1024).toFixed(1)}kb`;
    }
    return `${+(size / (1024 * 1024)).toFixed(1)}mb`;
  };

  const fileTypeIcon = (type) => {
    const types = type.split('/');
    if (['zip', 'x-gzip', 'x-compressed'].includes(types[1])) {
      return <FontAwesomeIcon icon={faFileArchive} />;
    }
    if (types[0] === 'image') {
      return <i className="ri-image-line" />;
    }
    if (types[0] === 'video') {
      return <FontAwesomeIcon icon={faFileVideo} />;
    }
    if (types[0] === 'audio') {
      return <FontAwesomeIcon icon={faFileAudio} />;
    }
    return <i className="ri-file-pdf-line" />;
  };

  const handleClick = () => {
    if (attachmentType !== 'archive') {
      setSelectedFile(file);
      setShowPreview(true);
    } else {
      window.location.href = file.attachment;
    }
  };

  let imageUrl = null;
  if (file.content_type.split('/')[0] === 'image') {
    // this is for QA and local only
    imageUrl = file.attachment;
    if (window.location.href.includes('https') && !file.attachment.includes('https')) imageUrl = file.attachment.replace('http', 'https');
  }

  return (
    <React.Fragment>
      <PreviewModal file={selectedFile} show={showPreview} handleClose={() => { setSelectedFile({}); setShowPreview(false); }} attachmentType={attachmentType} />
      <Thumbnail
        onClick={() => handleClick()}
        style={file.content_type.split('/')[0] === 'image' ? {
          backgroundImage: isHovering ? `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.4)), url(${imageUrl})` : `url(${imageUrl})`, backgroundSize: 'cover',
        } : {}}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {file.content_type.split('/')[0] !== 'image' && fileTypeIcon(file.content_type)}
      </Thumbnail>
      <FileName>
        {file.name}
        <span> ({convertFileSize(file.size)})</span>
      </FileName>
    </React.Fragment>);
};

FilePreview.defaultProps = {
  file: {},
};

export default FilePreview;
