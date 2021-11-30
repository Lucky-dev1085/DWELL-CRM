import styled from 'styled-components';
import { CardBasic, CardSiteLogo } from 'site/components/common';

export const CardBasicCustom = styled(CardBasic)`
  height: calc(100% - 20px);
`;

export const SiteLogo = styled.div`
  height: 50px;

  img {
    height: 100%;
  }
`;

export const SecondLogoCard = styled(CardSiteLogo)`
  margin: 10px;

  .card-body {
    background: #ccc;
  }
`;

export const Label = styled.label`
  letter-spacing: .2px;
  font-size: 13px;
  font-family: 'IBM Plex Sans',sans-serif;
  color: #4a5e8a;
  line-height: 1;
  font-weight: 400;
`;

export const MapWrapper = styled.div`
  height: 50vh;
  margin-top: 2rem;
`;

export const Divider = styled.hr`
  border-color: ${props => props.theme.colors.gray200};
`;
