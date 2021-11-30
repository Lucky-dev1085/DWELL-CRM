import React, { FC, useEffect, useState } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { SingleDatePicker } from 'react-dates';
import { Col, FormGroup, Input, Row } from 'reactstrap';
import moment from 'moment';
import Select from 'react-select';
import { isEmpty } from 'lodash';
import { leadsFilterChoices } from 'dwell/constants';
import { Select as CustomSelect } from 'dwell/components';
import actions from 'dwell/actions';
import { PropertyProps } from 'src/interfaces';
import {
  AddConditionButton,
  ConditionCustomSelect,
  RemoveCondition,
  AddConditionLink,
  FilterItems,
} from './styles';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { OPERATOR_CHOICES, FILTER_CHOICES } = leadsFilterChoices;

interface LeadsFilterProps extends RouteComponentProps{
  currentProperty: PropertyProps,
  handleAddCondition: () => void,
  handleDeleteCondition: (id: number) => void,
  handleInputChange: (e: { target: { id, value } } | Event, compareValue?: string, compareOperator?: string) => void,
  handleSimpleInputChange: (e: Event) => void,
  handleSimpleInputOnBlur: (e: Event) => void,
  handleMultiSelectChange: (selectedOption: string, id: string) => void,
  filterItems: { id: number, compare_operator: string, compare_field: string, compare_value: string }[],
  floorPlans: { plan: string, id: number }[],
  isLinkButton: boolean,
}

const LeadsFilter: FC<LeadsFilterProps> = ({ currentProperty, handleAddCondition, handleDeleteCondition, handleInputChange,
  filterItems, handleSimpleInputChange, handleSimpleInputOnBlur, handleMultiSelectChange, floorPlans, isLinkButton = true }) : JSX.Element => {
  const [ownersChoice, setOwnersChoice] = useState({});
  const [floorPlanChoice, setFloorPlanChoice] = useState({});
  const [focusedItems, setFocusedItems] = useState({});

  useEffect(() => {
    if (!isEmpty(currentProperty)) {
      setOwnersChoice(currentProperty.users.reduce((prev, user) => ({ ...prev, [user.id]: user.email }), {}));
    }
  }, [currentProperty]);

  useEffect(() => {
    if (!isEmpty(floorPlans)) {
      setFloorPlanChoice(floorPlans.reduce((prev, floorPlan) => ({ ...prev, [floorPlan.id]: floorPlan.plan }), {}));
    }
  }, [floorPlans]);

  // useEffect(() => {
  //
  // }, [filterItems]);

  const setOperatorChoices = (filter, item) => {
    if (filter.choices || ['owner', 'floor_plan'].includes(item.compare_field)) {
      return OPERATOR_CHOICES.selection;
    }
    if (filter.isText) {
      return OPERATOR_CHOICES.text;
    }
    if (filter.isNumber) {
      return OPERATOR_CHOICES.number;
    }
    return OPERATOR_CHOICES.date;
  };

  const setChoices = (filter, compareField) => {
    if (compareField === 'owner') return ownersChoice;
    if (compareField === 'floor_plan') return floorPlanChoice;
    return filter.choices;
  };

  const filterItemsInput = () => {
    if (!isEmpty(filterItems)) {
      return filterItems.map((item, index) => {
        const filter = FILTER_CHOICES[item.compare_field] || {};
        const operatorChoices = setOperatorChoices(filter, item);
        if (item.compare_operator && !Object.keys(operatorChoices).includes(item.compare_operator)) {
          handleInputChange({ target: { id: `filter_items.[${index}].compare_operator`, value: '' } });
        }
        const operatorContent = (
          <CustomSelect
            id={`filter_items.[${index}].compare_operator`}
            placeholder="Filter operator"
            value={item.compare_operator}
            onChange={e => handleInputChange(e)}
            choices={operatorChoices}
            required
          />
        );
        let fieldContent = null;
        if (filter.isText || filter.isNumber) {
          fieldContent = (
            <FormGroup>
              <Input
                type="text"
                id={`filter_items.[${index}].compare_value[0]`}
                placeholder="Filter value"
                value={item.compare_value[0] || ''}
                onChange={e => (handleSimpleInputChange ? handleSimpleInputChange(e) : handleInputChange(e))}
                onBlur={e => (handleSimpleInputOnBlur ? handleSimpleInputOnBlur(e) : null)}
                required
              />
            </FormGroup>);
          if (item.compare_operator === 'IS_BETWEEN') {
            fieldContent =
              (
                <React.Fragment>
                  <Row>
                    <Col sm={6}>
                      <FormGroup>
                        <Input
                          type="text"
                          id={`filter_items.[${index}].compare_value[0]`}
                          placeholder="Filter value"
                          value={item.compare_value[0] || ''}
                          onChange={e => (handleSimpleInputChange ? handleSimpleInputChange(e) : handleInputChange(e))}
                          onBlur={e => (handleSimpleInputOnBlur ? handleSimpleInputOnBlur(e) : null)}
                          required
                        />
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup>
                        <Input
                          type="text"
                          id={`filter_items.[${index}].compare_value[1]`}
                          placeholder="Filter value"
                          value={item.compare_value[1] || ''}
                          onChange={e => (handleSimpleInputChange ? handleSimpleInputChange(e) : handleInputChange(e))}
                          onBlur={e => (handleSimpleInputOnBlur ? handleSimpleInputOnBlur(e) : null)}
                          required
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </React.Fragment>);
          }
        }
        if (filter.choices || ['owner', 'floor_plan'].includes(item.compare_field)) {
          fieldContent = (
            <FormGroup>
              <CustomSelect
                id={`filter_items.[${index}].compare_value[0]`}
                placeholder="Filter value"
                value={item.compare_value[0]}
                onChange={e => handleInputChange(e)}
                choices={setChoices(filter, item.compare_field)}
                required
              />
            </FormGroup>
          );
          if (item.compare_operator === 'IS_ONE_OF') {
            const options = Object.entries(setChoices(filter, item.compare_field)).map(([key, value]) => ({
              value: key,
              label: value,
            }));
            const defaultValue = isEmpty(item.compare_value) ? null : options.filter(option => item.compare_value.includes(option.value));
            fieldContent = (
              <FormGroup>
                <Select
                  defaultValue={defaultValue}
                  id={`filter_items.[${index}].compare_value`}
                  isMulti
                  options={options}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  onChange={selectedOption => handleMultiSelectChange(selectedOption, `filter_items.[${index}].compare_value`)}
                />
              </FormGroup>
            );
          }
        }
        if (filter.isDate) {
          fieldContent = (
            <FormGroup>
              <SingleDatePicker
                inputIconPosition="after"
                small
                block
                id={index.toString()}
                numberOfMonths={1}
                date={item.compare_value[0] ? moment(item.compare_value[0]) : null}
                isOutsideRange={() => false}
                onDateChange={date => handleInputChange({
                  target: {
                    id: `filter_items.[${index}].compare_value[0]`,
                    value: date && date.format('YYYY-MM-DD'),
                  },
                })}
                focused={focusedItems[`focused${index}1`] || false}
                onFocusChange={({ focused }) => setFocusedItems({ ...focusedItems, [`focused${index}1`]: focused })}
                openDirection="down"
                hideKeyboardShortcutsPanel
                isDayHighlighted={day => day.isSame(moment(), 'd')}
              />
            </FormGroup>
          );

          if (item.compare_operator === 'IS_BETWEEN') {
            fieldContent =
              (
                <React.Fragment>
                  <Row>
                    <Col sm={6}>
                      <FormGroup>
                        <SingleDatePicker
                          inputIconPosition="after"
                          small
                          block
                          id={index.toString()}
                          numberOfMonths={1}
                          date={item.compare_value[0] ? moment(item.compare_value[0]) : null}
                          isOutsideRange={() => false}
                          onDateChange={date => handleInputChange({
                            target: {
                              id: `filter_items.[${index}].compare_value[0]`,
                              value: date && date.format('YYYY-MM-DD'),
                            },
                          })}
                          focused={focusedItems[`focused${index}1`] || false}
                          onFocusChange={({ focused }) => setFocusedItems({
                            ...focusedItems,
                            [`focused${index}1`]: focused,
                          })}
                          openDirection="down"
                          hideKeyboardShortcutsPanel
                          isDayHighlighted={day => day.isSame(moment(), 'd')}
                        />
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup>
                        <SingleDatePicker
                          inputIconPosition="after"
                          small
                          block
                          id={index.toString()}
                          numberOfMonths={1}
                          date={item.compare_value[1] ? moment(item.compare_value[1]) : null}
                          isOutsideRange={() => false}
                          onDateChange={date => handleInputChange({
                            target: {
                              id: `filter_items.[${index}].compare_value[1]`,
                              value: date && date.format('YYYY-MM-DD'),
                            },
                          })}
                          focused={focusedItems[`focused${index}2`] || false}
                          onFocusChange={({ focused }) => setFocusedItems({
                            ...focusedItems,
                            [`focused${index}2`]: focused,
                          })}
                          openDirection="down"
                          hideKeyboardShortcutsPanel
                          isDayHighlighted={day => day.isSame(moment(), 'd')}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </React.Fragment>);
          }
        }
        if (item.compare_operator === 'IS_NOT_SET') {
          fieldContent = null;
        }
        return (
          <Row key={index}>
            <Col sm={4}>
              <FormGroup>
                <ConditionCustomSelect
                  type="select"
                  name="select"
                  id={`filter_items.[${index}].compare_field`}
                  value={item.compare_field || ''}
                  onChange={(e) => {
                    handleInputChange(e, `filter_items.[${index}].compare_value[0]`, `filter_items.[${index}].compare_operator`);
                  }}
                >
                  {Object.keys(FILTER_CHOICES).sort()
                    .map((key, ind) => (
                      <option value={key} key={ind}>{FILTER_CHOICES[key].name}</option>))}
                </ConditionCustomSelect>
              </FormGroup>
            </Col>
            <Col sm={3}>
              <FormGroup>
                {operatorContent}
              </FormGroup>
            </Col>
            <Col sm={4}>
              {fieldContent}
            </Col>
            <Col xs={1} className="d-flex align-items-center form-group">
              {index !== 0 &&
              <RemoveCondition onClick={() => handleDeleteCondition(index)}>
                <i className="ri-close-circle-fill" />
              </RemoveCondition>}
            </Col>
          </Row>
        );
      });
    }
    return null;
  };

  return (
    <React.Fragment>
      <FilterItems>
        {filterItemsInput()}
      </FilterItems>
      <Row>
        <Col xd="12">
          {isLinkButton ? <AddConditionLink onClick={handleAddCondition}>+ Add Condition</AddConditionLink> :
            <AddConditionButton onClick={handleAddCondition} className="btn btn-sm"><span>+</span> Add Condition</AddConditionButton>}
        </Col>
      </Row>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  properties: state.property.properties,
  currentProperty: state.property.property,
  floorPlans: state.property.property.floor_plans,
});

export default connect(
  mapStateToProps,
  {
    ...actions.property,
  },
)(withRouter(LeadsFilter));
