import styled from 'styled-components';
import { Modal } from 'reactstrap';

export const CustomModalWindow = styled(Modal)`
  max-width: 600px;
  width: 100%;

  .modal-header {
    border-bottom-color: ${props => props.theme.colors.colorbg02};
    padding: 18px 20px;
    position: relative;
    border-bottom-width: 1px;
  }

  .modal-title {
    margin-bottom: 0;
    font-size: 18px;
    font-weight: 500;
  }

  .modal-body {
    padding: 30px;
    color: ${props => props.theme.colors.colortx01};

    strong {
      font-weight: ${props => props.theme.fontWeights.medium};
      color: ${props => props.theme.colors.colortx01};
    }

    p:last-child { margin-bottom: 0; }

    hr {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
    }
  }

  .modal-footer {
    padding: 15px 20px;
    border-top-color: ${props => props.theme.colors.colorbg02};
    border-top-width: 1px;

    .btn {
      height: ${props => props.theme.templates.heightmd};
      padding-left: 20px;
      padding-right: 20px;
      margin: 0;


      + .btn { margin-left: 10px; }
    }

    .btn-secondary {
        background-color: #fff;
        color: #4a5e8a;
    }

    .btn-primary {
        background-color: ${props => props.theme.colors.colorui01} !important;
    }

  }

  .modal-body-sending {
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;

    i {
      display: block;
      margin-bottom: 20px;
      font-size: 48px;
      line-height: 1;
    }

    .card-title {
      font-size: 20px;
      color: ${props => props.theme.colors.colortx01};
      margin-bottom: 0;
    }

    .card-email-info {
      align-self: stretch;
      text-align: center;
      background-color: ${props => props.theme.colors.colorbg01};
      padding: 25px 30px;
      border-radius: 5px;
      margin: 30px 0;
    }

    .card-btn-group {
      display: flex;

      .btn {
        height: ${props => props.theme.templates.heightmd};

        + .btn { margin-left: 10px; }
      }
    }
  }
`;
