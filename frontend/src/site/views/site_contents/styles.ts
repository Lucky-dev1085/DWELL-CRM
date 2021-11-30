import styled from 'styled-components';

export const ContentBodySite = styled.div`
  display: flex;
  padding: 30px 30px 50px 20px;

  .settings-sidebar {
    width: 200px;
  }
`;

export const SiteBody = styled.div`
  flex: 1;
`;

export const ContentLabel = styled.label`
  display: block;
  font-size: 10px;
  font-weight: 500;
  color: ${props => props.theme.colors.colortx03};
  letter-spacing: .5px;
  line-height: 1;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

export const RemoveImage = styled.div`
  z-index: 1;
  padding: 5px;
  position: absolute;
  cursor: pointer;
  top: 0;
  right: 0;

  i {
    color: rgba(255,255,255,0.65);
    font-size: 20px;

    &:hover, &:focus {
      color: #fff;
    }
  }
`;
