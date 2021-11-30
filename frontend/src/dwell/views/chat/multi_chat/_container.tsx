// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import {
  ActiveChatsCount, ChatBodyContent, ChatBodyHeader, ChatBodyHeaderTitle, ChatBodyPanel, NextSlideSvg, PrevSlideSvg,
  SliderButton, ChatBodyHeaderDotsIndicator, Overlay,
} from 'dwell/views/chat/multi_chat/styles';
import actions from 'dwell/actions';
import { connect } from 'react-redux';
import Slider from 'react-slick';
import ActiveChatPanel from './panel';

const ChatContainer = ({ activeChats, setActiveSlide, activeSlide }) : JSX.Element => {
  const slider = useRef(null);
  const [isFirstChatRemove, toggleChatRemove] = useState(false);

  useEffect(() => {
    if (activeChats.length <= 3 && activeSlide !== 0) {
      setActiveSlide(0);
      slider.current.slickGoTo(0);
    }
    if (activeChats.length > 3 && activeChats.length < activeSlide + 3) {
      setActiveSlide(activeChats.length - 3);
      slider.current.slickGoTo(activeChats.length - 3);
    }
    toggleChatRemove(false);
  }, [activeChats]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: activeChats.length < 3 ? (activeChats.length || 1) : 3,
    slidesToScroll: 1,
    arrows: false,
    // swipe: false,
    beforeChange: (current, next) => {
      if (next >= 0) {
        setActiveSlide(next);
      }
    },
  };

  const nextSlide = () => {
    if (activeSlide < activeChats.length - 3) {
      slider.current.slickNext();
    }
  };

  const prevSlide = () => {
    if (activeSlide > 0) {
      slider.current.slickPrev();
    }
  };

  return (
    <ChatBodyContent>
      <ChatBodyHeader>
        <ChatBodyHeaderTitle>
            Active Conversations
          <ActiveChatsCount>{activeChats.length}</ActiveChatsCount>
        </ChatBodyHeaderTitle>
        {activeChats.length > 3 && (
          <div className="d-flex" style={{ position: 'relative' }}>
            <Overlay left={isFirstChatRemove ? 6 : activeSlide * 20}>
              <ChatBodyHeaderDotsIndicator isOverlay first />
              <ChatBodyHeaderDotsIndicator isOverlay middle />
              <ChatBodyHeaderDotsIndicator isOverlay last />
            </Overlay>
            {activeChats.map((chat, index) => {
              const firstOverlapPos = activeSlide < activeChats.length - 3 ? activeSlide : activeChats.length - 3;
              return (
                <ChatBodyHeaderDotsIndicator
                  first={firstOverlapPos === index}
                  middle={firstOverlapPos + 1 === index}
                  last={firstOverlapPos + 2 === index}
                  isHidden={isFirstChatRemove && index === 0}
                  onClick={() => {
                    if (index > activeChats.length - 3) {
                      slider.current.slickGoTo(activeChats.length - 3);
                    } else {
                      slider.current.slickGoTo(index);
                    }
                  }}
                />
              );
            })}
          </div>
        )}
        <div className="d-flex">
          <SliderButton onClick={() => prevSlide()} disabled={activeSlide <= 0}>
            <PrevSlideSvg />
          </SliderButton>
          <SliderButton onClick={() => nextSlide()} disabled={activeSlide >= activeChats.length - 3} >
            <NextSlideSvg />
          </SliderButton>
        </div>
      </ChatBodyHeader>
      <ChatBodyPanel>
        <Slider {...settings} ref={slider}>
          {activeChats.map((contact, index) => (
            <ActiveChatPanel
              contactId={contact.id}
              isSMS={contact.isSMS}
              key={index}
              isFirstChatRemove={activeChats.length > 3 ? isFirstChatRemove : null}
              handleFirstChatRemove={index === 0 ? () => toggleChatRemove(true) : null}
            />))}
        </Slider>
      </ChatBodyPanel>
    </ChatBodyContent>);
};

const mapStateToProps = state => ({
  activeChats: state.prospectChat.activeChats,
  activeSlide: state.prospectChat.activeSlide,
});

export default connect(
  mapStateToProps,
  {
    ...actions.prospectChat,
  },
)(ChatContainer);
