import styled from 'styled-components';
import { CardBody } from 'reactstrap';
import { parseColor } from 'site/components/common/mixin';

export const Gallery = styled.div`
  display: grid;
  gap: 20px;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

export const ButtonContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(${props => parseColor(props.theme.colors.gray900).toString()}, .5);
  display: none;
`;

export const ButtonAction = styled.div`
  width: ${props => props.theme.templates.heightxs};
  height: ${props => props.theme.templates.heightxs};
  padding: 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  color: ${props => props.theme.colors.colortx02};
  font-size: 18px;
  transition: all 0.15s;
  cursor: pointer;
  margin-right: 5px;

  &:hover, &:focus {
    transform: scale(1.1);
  }
`;

export const ImageGalleryItem = styled.div`
  position: relative;
  border-radius: ${props => props.theme.borders.radius};
  overflow: hidden;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;

  &:hover, &:focus {
    ${ButtonContainer} { display: flex; }
  }

  .carousel-item {
    height: 160px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

export const ListGroup = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
`;

export const ListGroupItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  border-width: 0;
  margin-top: 5px;
  height: 30px;

  span:first-child { color: ${props => props.theme.colors.colortx03}; }
  span:last-child {
    color: ${props => props.theme.colors.colortx01};
    font-weight: ${props => props.theme.fontWeights.medium};

    input {
      margin-bottom: 0;
      height: 30px;
    }
  }

  .editing {
    width: 30%;
  }

  .form-control.is-invalid {
    background: none;
    border-color: #f86c6b !important;
    padding-right: 0.75rem !important;
  }

  .beds-and-baths {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45% !important;
  }
`;

export const UnavailablePlan = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
`;

export const AddFloorPlanCardBody = styled(CardBody)`
  width: 100%;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top-width: 1px !important;
  border-bottom-width: 1px !important;
`;
