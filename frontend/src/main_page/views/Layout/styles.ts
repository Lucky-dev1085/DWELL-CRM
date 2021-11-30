import styled from 'styled-components';
import BackgroundDemo from 'images/background-demo.png';

export const Container = styled.div`
    display: flex;
    padding: 40px 40px;
    width: 100%;
    height: 100%;
    overflow: auto;
    margin: 0;
    background: url(${BackgroundDemo}) repeat center center fixed;
    -webkit-background-size: 60%;
    -moz-background-size: 60%;
    -o-background-size: 60%;
    background-size: 60%;
    transition: background-image 1s ease-in-out;

    @media (max-width: 1199px) {
        height: 100%;
    }

    @media (max-width: 767px) {
        padding: 0;
    }
`;

export const Card = styled.div`
    margin: auto;
    background-image: linear-gradient(to bottom, #5999f0 0%, #0168fa 100%);
    width: 100%;
    max-width: 1200px;
    height: auto;
    padding: 40px 40px 20px;
    background-color: ${props => props.theme.colors.darkcyan};
    border-radius: 10px;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);

    @media (max-width: 767px){
      width: 100%;
      padding: 0;
      border-radius: 0;
    }
`;

export const Copyright = styled.p`
    margin-bottom: 0;
    text-align: right;
    font: normal normal normal 14px/23px Open Sans;
    letter-spacing: 0;
    color: white;

    @media (max-width: 767px) {
        margin-bottom: 1rem;
        text-align: center;
    }
`;

export const CopyRight = styled.div`
 margin-top: auto;
 color: rgba(255,255,255,0.4);
 font-weight: 400;
 font-size: 14px;

  @media(max-width: 991px){
      width: 100%;
      text-align: center;
  }
`;
