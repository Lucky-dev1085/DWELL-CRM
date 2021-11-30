import React, { FC } from 'react';
import ProgressiveImage from 'react-progressive-image-loading';
import Imgix, { Background } from 'react-imgix';
import { isChrome } from 'site/common';

declare global {
  interface Window { SSR: boolean; }
}

interface imgixParam {
  auto?: string,
  fit?: string,
  fm?: string,
}

interface ImageProps {
  src?: string,
  alt?: string,
  bg?: boolean,
  isLogo?: boolean,
  child?: { width: number, height: number },
}

const Image: FC<ImageProps> = (props) => {
  const { bg, child, isLogo, ...rest } = props;
  const { src } = props;
  let imgixParams = { auto: 'format', fit: 'crop' } as imgixParam;

  if (isLogo) {
    imgixParams = { ...imgixParams, fm: 'png' };
  }
  if (isChrome) {
    imgixParams = { ...imgixParams, fm: 'webp' };
  }
  const imgixSharedProps = {
    src,
    imgixParams,
    disableLibraryParam: true, // Disable library specific params.
    sizes: '100vw', // Defaults the image width to viewport width
  };

  const bgContent = window.SSR ? (
    <div style={{ backgroundImage: `url(${src}?fit=crop&auto=format&fm=webp&q=10)`, backgroundSize: 'cover' }} {...child} {...rest}>
      {props.children}
    </div>
  ) :
    (
      <ProgressiveImage
        src={`${src}`}
        preview={`${src}`}
        render={(source, style) => (
          <Background
            style={style}
            {...imgixSharedProps}
            // style={src ? assign(style, { backgroundImage: `url(${source})` }) : { backgroundImage: `url(${source})` }}
            {...child}
            {...rest}
          >{props.children}
          </Background>)
        }
      />
    );
  const image = bg
    ? bgContent : (
      <Imgix
        className="lazyload"
        {...imgixSharedProps}
        {...child}
        {...rest}
        htmlAttributes={{ ...rest }}
      />
    );

  return (
    image
  );
};

Image.defaultProps = {
  bg: false,
  alt: null,
  child: null,
  src: '/static/images/no-image.jpg',
  isLogo: false,
};

export default Image;
