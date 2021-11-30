import React, { useState, useEffect, FC } from 'react';
import { ModalBody, ModalHeader, ModalFooter, Button, FormGroup, Input, Label } from 'reactstrap';
import ReactPlayer from 'react-player';
import axios from 'axios';
import { ImageSelect } from 'site/components';
import { rules } from 'site/common/validations';
import { ModalWindow } from 'site/components/common';

const getThumbnail = (url = '') => new Promise((resolve, reject) => {
  const youtubeVideoId = rules.hasYoutubeVideoId(url);
  if (youtubeVideoId) {
    return resolve(`https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`);
  }
  return axios.get(`https://vimeo.com/api/oembed.json?url=${url}`)
    .then(({ data }) => resolve(data.thumbnail_url))
    .catch(() => reject(new Error('Video thumbnail not found')));
});

interface Video {
  videoUrl?: string,
  videoDescription?: string,
  src?: string,
  hasHostVideoThumbnail?: boolean
}

interface VideoModalProps {
  isModalOpen?: boolean,
  onModalToggle: () => void,
  onSubmit: (data: Video) => void,
  submitting?: boolean,
  data?: Video
}

const VideoModal: FC<VideoModalProps> = ({ isModalOpen, onModalToggle, onSubmit, submitting, data }) => {
  const [videoModalState, updateVideoModalState] = useState({
    src: data.src,
    videoUrl: data.videoUrl,
    videoDescription: data.videoDescription,
  });
  const [showThumbnailUpload, toggleShowThumbain] = useState(false);

  useEffect(() => {
    updateVideoModalState({
      ...videoModalState,
      src: data.src,
      videoUrl: data.videoUrl,
      videoDescription: data.videoDescription,
    });
  }, [data]);

  const handleChange = (key, value) => {
    updateVideoModalState({ ...videoModalState, [key]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toggleShowThumbain(false);
    const { videoUrl, videoDescription } = videoModalState;
    let { src } = videoModalState;
    if (!ReactPlayer.canPlay(videoUrl)) {
      window.alert('Please enter valid video link'); // eslint-disable-line no-alert
    } else {
      getThumbnail(videoUrl)
        .then(((thumbnail: string) => {
          src = thumbnail;
          onSubmit({ src, videoUrl, videoDescription, hasHostVideoThumbnail: true });
          updateVideoModalState({ ...videoModalState, src: '', videoUrl: '', videoDescription: '' });
        }))
        .catch(() => {
          if (typeof src === 'object') {
            onSubmit({ src, videoUrl, videoDescription, hasHostVideoThumbnail: false });
            updateVideoModalState({ ...videoModalState, src: '', videoUrl: '', videoDescription: '' });

            return;
          }
          toggleShowThumbain(true);
          window.alert('Please upload video thumbnail'); // eslint-disable-line no-alert
        });
    }
  };

  const { src, videoUrl, videoDescription } = videoModalState;
  return (
    // <ModalWindow isOpen={isModalOpen} toggle={onModalToggle} keyboard={!submitting} centered>
    <ModalWindow isOpen={isModalOpen} toggle={onModalToggle} centered>
      <ModalHeader toggle={onModalToggle}>
        Video Link
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="videoUrl">Add Video Link</Label>
            <Input
              type="url"
              id="videoUrl"
              placeholder="Video link"
              value={videoUrl}
              onChange={e => handleChange('videoUrl', e.target.value)}
              // disabled={submitting}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="videoDescription">Video Title</Label>
            <Input
              id="videoDescription"
              placeholder="Video Title"
              value={videoDescription}
              onChange={e => handleChange('videoDescription', e.target.value)}
              // disabled={submitting}
              required
            />
          </FormGroup>
          {
            showThumbnailUpload && (
              <ImageSelect
                buttonText="Upload thumbnail"
                value={src}
                onChange={v => handleChange('src', v)}
                // disabled={submitting}
              />
            )
          }
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit" disabled={submitting}>
            Save changes
          </Button>
        </ModalFooter>
      </form>
    </ModalWindow>
  );
};

VideoModal.defaultProps = {
  isModalOpen: false,
  submitting: false,
  data: {
    src: '',
    videoUrl: '',
    videoDescription: '',
  },
};

export default VideoModal;
