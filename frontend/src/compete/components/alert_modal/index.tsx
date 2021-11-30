import React, { useState, useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ModalHeader, ModalBody, ModalFooter, Button, CustomInput } from 'reactstrap';
import alertAction from 'compete/actions/alert';
import exploreMarketsAction from 'compete/actions/explore_markets';
import { Alert } from 'src/interfaces';
import { reportSettingsFilters, filtersFormat, stringToCapitalize } from 'compete/constants';
import { trackedAssets, alertTypes, initialState } from 'compete/constants/alert_modal';
import { ModalAlert, AlertTypeWrapper, ErrorMessage } from './styles';
import AlertInfo from './alert_info';

interface AlertModalProps {
  show: boolean,
  onClose: () => void,
  isEdit?: boolean,
  editAlert?: Alert,
  reload?: () => void,
}

const AlertModal: FC<AlertModalProps> = ({ show, onClose, isEdit = false, editAlert, reload }) => {
  const [alert, setAlert] = useState(initialState);
  const [assetsMarket, setAssetsMarket] = useState([]);
  const [assetsSubmarket, setAssetsSubmarket] = useState([]);
  const [customAssets, setCustomAssets] = useState([]);
  const [submitIsClicked, updateSubmitIsClicked] = useState(false);
  const [step, setStep] = useState(1);
  const [alertType, setAlertType] = useState(null);

  const dispatch = useDispatch();
  const isSubmitting = useSelector(state => state.alert.isSubmitting);
  const exploreMarketsList = useSelector(state => state.exploreMarkets.exploreMarketsList);

  const { createAlert, updateAlert } = alertAction;
  const { getExploreMarketsList } = exploreMarketsAction;

  const getTrackedAssetByKey = key => exploreMarketsList[key].filter(el => editAlert[key].includes(el.id));

  useEffect(() => {
    if (isEdit) {
      setAlert({ ...initialState,
        id: editAlert.id,
        name: editAlert.name,
        trackedAssets: editAlert.track_assets_mode,
        status: editAlert.status,

        condition: stringToCapitalize(editAlert.condition_subject),
        thresholdType: stringToCapitalize(editAlert.condition_type),
        thresholdPercent: editAlert.condition_value,
        baseline: editAlert.baseline,
        unitTypes: reportSettingsFilters.showRentForOptions.filter(el => editAlert.condition_unit_types.includes(el.value)) || [reportSettingsFilters.showRentForOptions[0]],
      });

      setAssetsMarket(getTrackedAssetByKey('markets'));
      setAssetsSubmarket(getTrackedAssetByKey('submarkets'));
      setCustomAssets(getTrackedAssetByKey('properties'));
      setStep(2);
      setAlertType(editAlert.type);
    } else {
      dispatch(getExploreMarketsList());
    }
  }, []);

  const handleChange = (key, value) => {
    setAlert({ ...alert, [key]: value });
  };

  const handleClose = () => {
    onClose();
    updateSubmitIsClicked(false);
  };

  const trackedAssetsId = () => {
    switch (alert.trackedAssets) {
      case trackedAssets.MARKETS:
        return { markets: assetsMarket.map(el => el.id) };
      case trackedAssets.SUBMARKETS:
        return { submarkets: assetsSubmarket.map(el => el.id) };
      case trackedAssets.CUSTOM:
        return { properties: customAssets.map(el => el.id) };
      default:
        return {};
    }
  };

  const handleSubmit = () => {
    updateSubmitIsClicked(true);

    if (step === 1 && alertType) {
      setStep(2);
      updateSubmitIsClicked(false);
    }

    if (step === 2) {
      if (alert.name) {
        const newAlert = {
          ...alert,
          ...trackedAssetsId(),
          track_assets_mode: alert.trackedAssets,
          type: alertType,
          condition_subject: alert.condition.toUpperCase(),
          condition_type: filtersFormat(alert.thresholdType),
          condition_value: alert.thresholdPercent,
          condition_unit_types: alert.unitTypes.map(el => el.value),
          unitTypes: undefined,
        };

        if (alert.id) {
          dispatch(updateAlert(Number(alert.id), newAlert));
        } else {
          dispatch(createAlert(newAlert)).then(() => reload());
        }
        handleClose();
      }
    }
  };

  const closeBtn = <button className="close" onClick={handleClose}><i className="ri-close-line" /></button>;

  const buttonName = step === 1 ? 'Next' : 'Create Alert';

  return (
    <React.Fragment>
      <ModalAlert isOpen={show} toggle={handleClose} centered>
        <ModalHeader toggle={handleClose} close={closeBtn}>
          {isEdit ? 'Edit Alert' : 'New Alert'}
        </ModalHeader>
        <ModalBody>
          {step === 1 &&
            <React.Fragment>
              <AlertTypeWrapper onClick={() => setAlertType(alertTypes.BENCHMARK)}>
                <CustomInput
                  value={alertTypes.BENCHMARK}
                  type="radio"
                  id="alert-type-benchmark"
                  checked={alertType === alertTypes.BENCHMARK}
                  onChange={() => setAlertType(alertTypes.BENCHMARK)}
                />
                <div className="ml-1">
                  <h6>Benchmark Alert</h6>
                  <p className="mb-0">
                    Get a weekly alert that benchmarks rent, occupancy, and
                    concession data against previous week/month values.
                  </p>
                </div>
              </AlertTypeWrapper>
              <AlertTypeWrapper className="mt-3" onClick={() => setAlertType(alertTypes.THRESHOLD)}>
                <CustomInput
                  value={alertTypes.THRESHOLD}
                  type="radio"
                  id="alert-type-threshold"
                  checked={alertType === alertTypes.THRESHOLD}
                  onChange={() => setAlertType(alertTypes.THRESHOLD)}
                />
                <div className="ml-1">
                  <h6>Threshold Alert</h6>
                  <p className="mb-0">
                    Get a daily alert when rent, occupancy, or concession data
                    meets your threshold criteria.
                  </p>
                </div>
              </AlertTypeWrapper>
              {!alertType && submitIsClicked && <ErrorMessage>Please choose alert type</ErrorMessage>}
            </React.Fragment>
          }
          {step === 2 &&
            <AlertInfo
              isEdit={isEdit}
              submitIsClicked={submitIsClicked}
              handleChange={handleChange}
              alert={alert}
              alertType={alertType}
              assetsMarket={assetsMarket}
              setAssetsMarket={setAssetsMarket}
              assetsSubmarket={assetsSubmarket}
              setAssetsSubmarket={setAssetsSubmarket}
              customAssets={customAssets}
              setCustomAssets={setCustomAssets}
            />}
        </ModalBody>
        <ModalFooter>
          <Button color="white" onClick={handleClose}>Cancel</Button>
          <Button color="primary"disabled={isSubmitting} onClick={handleSubmit}>
            {isEdit ? 'Save Changes' : buttonName}
          </Button>
        </ModalFooter>
      </ModalAlert>
    </React.Fragment>
  );
};

export default AlertModal;
