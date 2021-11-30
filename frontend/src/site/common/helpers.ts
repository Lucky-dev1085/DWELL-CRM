import { Images } from 'src/interfaces';

export const sortVideosToTop = (mediaA: Images, mediaB: Images): number => {
  const mediaAIsVideo = !!mediaA.videoUrl;
  const mediaBIsVideo = !!mediaB.videoUrl;
  if (mediaAIsVideo && !mediaBIsVideo) {
    return -1;
  } else if (!mediaAIsVideo && mediaBIsVideo) {
    return 1;
  }
  return 0;
};
