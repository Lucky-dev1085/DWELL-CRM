import styled from 'styled-components';
import { CustomCol } from 'main_page/components/styles';
import Dots from 'images/dot.png';
import PresidentPhoto from 'images/person.png';

export const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  height: auto;
   @media (max-width: 767px){
     flex-direction: column;
    }
  ;
`;

export const DescriptionWrapper = styled(CustomCol)`
  display: flex;
  flex-direction: column;
  @media (max-width: 767px) {
    padding-left: 5%;
    padding-right: 5%;
    //margin-top: 64px;
  }
`;

export const CardWrapper = styled.div`
    max-width: 860px;
    width: 100%;
    min-height: 600px;
    padding: 40px;
    margin: auto;
    background-color: ${props => props.theme.colors.darkcyan};
    border-radius: 6px;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);

    @media (max-width: 767px){
      padding: 0;
      border-radius: 0;
    }
`;

export const Title = styled.h1`
  font-size: 30px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 30px;

@media (min-width: 576px) {
  font-size: 40px;
}
@media (min-width: 768px) {
  font-size: 36px;
}
@media (min-width: 992px) {
  margin: 30px 0 40px;
}
@media (min-width: 1200px) {
  font-size: 50px;
  margin: 30px 0 50px;
  letter-spacing: -1px;
}
`;

export const DescriptionText = styled.span`
    top: -10px;
    display: flex;
    flex-direction: column;
    flex: 1;
    font-weight: 400;
    margin: 0 30px;
    color: rgba(255,255,255,0.7);
    position: relative;
    font-size: 15px;
    line-height: 1.4;
    z-index: 5;

    @media (min-width: 576px) {
      font-size: 20px;
    }

    @media (min-width: 768px) {
      font-size: 18px;
    }

    @media (min-width: 992px) {
      font-size: 19px;
    }

    @media(max-width: 767px) {
        margin: 0 0 0 25px;
    }

    @media (min-width: 1200px) {
      font-size: 24px;
      line-height: 1.3;
      letter-spacing: -.5px;
    }
`;

export const President = styled.span`
    color: white;
    font-weight: 400;
`;

export const Quote = styled.span`
    color: rgba(255,255,255,0.75);
    font-size: 13px;
    font-weight: 400;

    @media (min-width: 576px) {
        font-size: 14px;
    }

    @media (min-width: 992px) {
        font-size: 16px;
    }
`;

export const CompanyLink = styled.a`
    color: rgba(255,255,255,0.75);
    margin-left: 5px;

    &:hover {
        color: white;
    }
`;

export const PresidentIcon = styled.img.attrs({ src: PresidentPhoto })`
      width: auto;
      height: 100%;
      position: relative;
`;

export const UtteranceWrapper = styled.div`
    display: flex;
    align-items: center;
    position: relative;

    &:before {
      top: -40px;
      left: -5px;
      width: 60px;
      height: 57px;
      opacity: .5;

      @media(max-width: 1199px){
          top: -5px;
          width: 40px;
          height: 37px;
      }
    }

    &:after {
      bottom: 0;
      left: 150px;
      width: 45px;
      height: 43px;
      opacity: .3;

      @media(max-width: 1199px){
          width: 25px;
          height: 23px;
          bottom: 125px;
          left: 95px;
      }
    }

    &:before, &:after {
      content: '';
      position: absolute;
      background-image: url(${Dots});
      background-size: contain;
      display: none;

      @media(min-width: 992px){
          display: block;
      }
    }
`;

export const CircleAvatar = styled.div`
  width: 168px;
  height: 168px;
  background-color: #1a5fc0;
  box-shadow: 0 0 0 10px rgba(255,255,255,0.1);
  border-radius: 100%;
`;

export const AvatarWrapper = styled.div`
  width: 90px;
  height: 90px;
  position: relative;
  top: -55px;
  left: 10px;

  @media (min-width: 576px) {
      width: 140px;
      height: 140px;
  }

  @media (min-width: 768px) {
      width: 100px;
      height: 100px;
  }

  @media (min-width: 1200px) {
      top: -20px;
      width: 180px;
      height: 180px;
      left: 10px;
  }

  &:before {
      content: '';
      position: absolute;
      bottom: 0;
      left: -1px;
      width: 84px;
      height: 84px;
      background-color: #1a5fc0;
      box-shadow: 0 0 0 5px rgba(255,255,255,0.1);
      border-radius: 100%;

      @media (min-width: 576px) {
          width: 130px;
          height: 130px;
      }
      @media (min-width: 768px) {
          width: 94px;
          height: 94px;
      }
      @media (min-width: 1200px) {
          width: 168px;
          height: 168px;
          box-shadow: 0 0 0 10px rgba(255,255,255,0.1);
      }
  }
`;

export const Divider = styled.hr`
  width: 100px;
  border-color: #fff;
  margin: 20px 0;
  opacity: .35;

  @media(max-width: 767px){
    width: 60px;
  }
`;

export const QuoteIcon = styled.i`
  font-size: 30px;
  color: #fff;
  opacity: .6;

  @media(max-width: 767px){
      font-size: 20px;
  }
`;
