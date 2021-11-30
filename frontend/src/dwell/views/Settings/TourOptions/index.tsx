import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Col, Row, DropdownMenu, Label } from 'reactstrap';
import actions from 'dwell/actions';
import { isEmpty } from 'lodash';
import styled from 'styled-components';
import { DetailResponse, PropertyProps } from 'src/interfaces';
import Select from 'react-select';
import {
  ContentText,
  ContentTitleSm,
  Divider, FormGroupBar,
  SettingsFooter,
  SettingsPrimaryButton,
} from 'dwell/views/Settings/styles';

const FormSwitch = styled.button`
    border: none;
    margin-left: 10px;
    margin-bottom: 0;
    width: 30px;
    height: 16px;
    background-color: ${props => (props.checked ? props.theme.colors.green : props.theme.colors.gray400)};
    border-radius: 10px;
    position: relative;
    transition: background-color 0.25s;
    cursor: pointer;

    &:focus {
        outline: none;
    }

    &:before {
      content: '';
      width: 12px;
      height: 12px;
      background-color: #fff;
      border-radius: 100%;
      position: absolute;
      top: 2px;
      left: ${props => (props.checked ? '16px' : '2px')};
      transition: left 0.25s;
    }
`;

const FormSwitchWrapper = styled.div`
    position: absolute;
    top: 25px;
    right: 30px;
    display: flex;
    align-items: center;
    color: ${props => props.theme.colors.colortx02};
    font-size: 13px;
`;

const CustomSelect = styled(Select)`
    width: 800px !important;
`;

const CustomLabel = styled(Label)`
   margin-bottom: 0 !important;
   margin-left: 10px;
`;

const CustomFormGroupBar = styled(FormGroupBar)`
   display: flex;
   align-items: center;
`;
export const SelectMenu = styled(DropdownMenu)`
  width: 300px;
  border-color: ${props => props.theme.input.borderColor};
  padding: 4px;
  max-height: 146px;
  overflow-y: auto;
  border-radius: unset;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  top: -5px !important;
`;

const tourPlanChoices = [
  { label: 'Virtual Tour', value: 'VIRTUAL_TOUR' },
  { label: 'Guided Virtual Tour', value: 'GUIDED_VIRTUAL_TOUR' },
  { label: 'In-Person Tour', value: 'IN_PERSON' },
  { label: 'Facetime Tour', value: 'FACETIME' },
  { label: 'Self-Guided Tour', value: 'SELF_GUIDED_TOUR' },
];
const bedroomPlanChoices = [
  { label: 'Studio', value: 'STUDIO' },
  { label: '1 bedroom', value: 'ONE_BEDROOM' },
  { label: '2 bedroom', value: 'TWO_BEDROOM' },
  { label: '3 bedroom', value: 'THREE_BEDROOM' },
  { label: '4 bedroom', value: 'FOUR_BEDROOM' },
];

const forms = [
  {
    label: 'Show tour types',
    name: 'tour_types',
    choices: tourPlanChoices,
  },
  {
    label: 'Show bedroom plans',
    name: 'bedroom_types',
    choices: bedroomPlanChoices,
  },
];

interface TourOptionsProps {
  updateTourOptions: (id: number, data: PropertyProps) => Promise<DetailResponse>,
  isSubmitting: boolean,
  currentProperty: PropertyProps,
  tour_types: string[],
  bedroom_types: string[],
}

const TourOptions: FC<TourOptionsProps> = ({ isSubmitting, currentProperty, updateTourOptions }) => {
  const [loaded, setLoaded] = useState(true);
  const [isBookingEnabled, setIsBookingEnabled] = useState(false);
  const [fields, setFields] = useState({ tour_types: [], bedroom_types: [] });

  useEffect(() => {
    setFields({ ...fields, tour_types: currentProperty.tour_types, bedroom_types: currentProperty.bedroom_types });
    setIsBookingEnabled(currentProperty.is_booking_enabled);
  }, []);

  const handleOnChange = ({ target: { value, id } }) => {
    setFields({ ...fields, [id]: value });
  };

  const handleSaveTourOptions = () => {
    if (!isEmpty(currentProperty)) {
      setLoaded(false);
      updateTourOptions(currentProperty.id, { ...fields, is_booking_enabled: isBookingEnabled }).then(() => setLoaded(true));
    }
  };

  return (
    <React.Fragment>
      <ContentTitleSm>Tour Options</ContentTitleSm>
      <ContentText>Set tour types and bedroom plans to show to prospects in Dwell Chat's tour scheduling workflow.</ContentText>
      <FormSwitchWrapper>Enable <FormSwitch checked={isBookingEnabled} onClick={() => setIsBookingEnabled(!isBookingEnabled)} /></FormSwitchWrapper>
      <Divider />
      {forms.map((item, index) => {
        const defaultValue = isEmpty(fields[item.name]) ? null : item.choices.filter(option => fields[item.name].includes(option.value));
        return (
          <CustomFormGroupBar key={index} style={{ borderColor: '#e9eaf0' }}>
            <Col sm={4}>
              <Row>
                <CustomLabel>{item.label}</CustomLabel>
              </Row>
            </Col>
            <Col sm={8}>
              <Row>
                <CustomSelect
                  value={defaultValue}
                  isMulti
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  options={item.choices}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder={item.label}
                  onChange={selectedItems => handleOnChange({ target: { id: item.name, value: selectedItems && selectedItems.length ? selectedItems.map(it => it.value) : [] } })}
                />
              </Row>
            </Col>
          </CustomFormGroupBar>);
      })}
      <SettingsFooter>
        <SettingsPrimaryButton onClick={() => handleSaveTourOptions()} disabled={!loaded || isSubmitting || isEmpty(fields.bedroom_types)} >Save Changes</SettingsPrimaryButton>
      </SettingsFooter>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  currentProperty: state.property.property,
  isSubmitting: state.property.isSubmitting,
});

export default connect(
  mapStateToProps,
  {
    ...actions.property,
  },
)(TourOptions);
