import React, { useEffect, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import actions from 'dwell/actions';
import { toast, ToastOptions } from 'react-toastify';
import { toastError } from 'site/constants';
import Loader from 'dwell/components/Loader';
import { paths, RECENT_PROPERTY_HYPHENS } from 'dwell/constants';

interface NylasIntegrationProps extends RouteComponentProps {
  getToken: (data: { code: string }) => Promise<void>,
  isTokenObtained: boolean,
}

const NylasIntegration: FC<NylasIntegrationProps> = ({ location: { search }, getToken, isTokenObtained, history: { push } }) => {
  useEffect(() => {
    const code = decodeURIComponent(search.replace(new RegExp(`^(?:.*[&\\?]${encodeURIComponent('code')
      .replace(/[.+*]/g, '\\$&')}(?:\\=([^&]*))?)?.*$`, 'i'), '$1'));
    getToken({ code }).then().catch((error) => {
      toast.error(error.response.data.error || 'Sorry! Something wrong happened. Please, try to authorize again.', toastError as ToastOptions);
      const propertyId = localStorage.getItem(RECENT_PROPERTY_HYPHENS);
      push({ pathname: paths.build(paths.client.SETTINGS.EMAIL_SYNC, propertyId), state: { tab: 2, isTokenObtained } });
    });
  }, []);

  useEffect(() => {
    if (isTokenObtained) {
      const propertyId = localStorage.getItem(RECENT_PROPERTY_HYPHENS);
      push({ pathname: paths.build(paths.client.SETTINGS.EMAIL_SYNC, propertyId), state: { tab: 2, isTokenObtained } });
    }
  }, [isTokenObtained]);

  return <Loader />;
};

const mapStateToProps = state => ({
  isTokenObtained: state.nylas.isTokenObtained,
});

export default connect(
  mapStateToProps,
  {
    ...actions.nylas,
  },
)(withRouter(NylasIntegration));
