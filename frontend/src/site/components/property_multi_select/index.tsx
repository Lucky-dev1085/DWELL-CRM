import React, { useState, FC } from 'react';
import { connect } from 'react-redux';
import { uniq } from 'lodash';
import { Col, Row, Label, Collapse, FormGroup } from 'reactstrap';
import MultiSelect from '@kenshooui/react-multi-select';
import { Search } from 'react-feather';
import { SearchBox } from 'site/components/common';
import '@kenshooui/react-multi-select/dist/style.css';
import { MultiSelectHeader, MultiSelectBody, ClientPropertyChoice, CheckIcon, AccessSelect, PropListItem } from './styles';

interface MultiSelectProps {
  clients: { id: number, name: string, properties: { id: number, name: string }[] }[],
  record: { clients: number[], properties: number[] },
  handleInputChange: (data: { clients?: number[], properties?: number[]}) => void,
  currentProperty: { id: number, client_id: number },
  isMyAccount: boolean,
  isCustomer: boolean,
}

const PropertyMultiSelect: FC<MultiSelectProps> = ({ clients, record, handleInputChange, isMyAccount, currentProperty, isCustomer = false }) => {
  const [multiSelectState, updateMultiSelect] = useState({
    expandedClients: [],
    keyword: '',
    propertiesKeyword: '',
  });

  const searchFound = (name = '', keyword = multiSelectState.keyword) => name.toLowerCase().includes(keyword.toLowerCase());

  let leftListItems = [];

  clients.forEach((client) => {
    leftListItems.push({
      id: `client_${client.id}`,
      label: client.name,
      cid: client.id,
      show: searchFound(client.name) || client.properties.filter(property => searchFound(property.name)).length,
      disabled: isMyAccount && client.id === currentProperty.client_id,
      isClient: true,
    });
    const propertyItems = client.properties.map(property => ({
      id: `property_${property.id}`,
      label: property.name,
      cid: property.id,
      parent: client.id,
      show: multiSelectState.expandedClients.includes(client.id) && searchFound(property.name),
      disabled: isMyAccount && property.id === currentProperty.id,
      isClient: false,
    }));
    leftListItems = leftListItems.concat(propertyItems);
  });

  const selectedItems = leftListItems.filter(i =>
    ((i.isClient && record.clients.includes(i.cid)) || (!i.isClient && record.properties.includes(i.cid))));

  const handleMultiChoiceItemClick = (raw, checked, e = null) => {
    if (e) e.stopPropagation();

    let newProperties;
    let newClients = record.clients;
    if (raw.isClient) {
      if (checked) {
        const removeIds = selectedItems.filter(item => item.parent === raw.cid).map(item => item.cid);
        newProperties = record.properties.filter(item => !removeIds.includes(item));
        newClients = record.clients.filter(client => client !== raw.cid);
      } else {
        newClients = record.clients.concat([raw.cid]);
        newProperties = uniq(record.properties.concat(leftListItems.filter(item => item.parent === raw.cid).map(item => item.cid)));
      }
    } else if (checked) {
      newProperties = record.properties.filter(item => item !== raw.cid);
    } else {
      const parentItem = selectedItems.find(item => item.cid === raw.parent);
      if (!parentItem) {
        newClients = record.clients.concat([raw.parent]);
      }
      newProperties = record.properties.concat([raw.cid]);
    }
    handleInputChange({ properties: newProperties, clients: newClients });
  };

  const handleSelectAll = (isAllSelected) => {
    if (isAllSelected) {
      handleInputChange({
        properties: (record.properties.includes(currentProperty.id) && isMyAccount) ? [currentProperty.id] : [],
        clients: (record.clients.includes(currentProperty.client_id) && isMyAccount) ? [currentProperty.client_id] : [],
      });
    } else {
      let properties = [];
      clients.forEach((client) => {
        properties = properties.concat(client.properties);
      });
      handleInputChange({ clients: clients.map(item => item.id), properties: properties.map(item => item.id) });
    }
  };

  const handleCollapse = (raw) => {
    const { expandedClients } = multiSelectState;
    let newItems;
    if (expandedClients.includes(raw.cid)) {
      newItems = expandedClients.filter(item => item !== raw.cid);
    } else {
      newItems = expandedClients.concat([raw.cid]);
    }
    updateMultiSelect({ ...multiSelectState, expandedClients: newItems });
  };

  const handleKeywordChange = (id, keyword) => {
    if (id === 'keyword') {
      const filteredProperties = leftListItems.filter(item => !item.isClient && searchFound(item.label));
      const filteredClients = uniq(filteredProperties.map(item => item.parent));
      updateMultiSelect({ ...multiSelectState, [id]: keyword, expandedClients: keyword ? filteredClients : [] });
    } else {
      updateMultiSelect({ ...multiSelectState, [id]: keyword });
    }
  };

  const { expandedClients, propertiesKeyword } = multiSelectState;
  const selectedProperties = selectedItems.filter(item => !item.isClient && searchFound(item.label, propertiesKeyword));
  return (
    <Row>
      <Col md={6}>
        <FormGroup>
          <Label>Properties</Label>
          <SearchBox>
            <Search />
            <input type="text" className="kn-search__input___2tyxf" placeholder="Search..." onChange={e => handleKeywordChange('keyword', e.target.value)} />
          </SearchBox>
          <MultiSelect
            wrapperClassName="multi-select-custom"
            items={leftListItems.filter(item => !!item.show)}
            selectedItems={selectedItems}
            showSelectedItems={false}
            showSearch={false}
            responsiveHeight={350}
            selectAllRenderer={() => (
              <MultiSelectHeader>
                <div className="mr-2" onClick={() => handleSelectAll(true)}>
                  Select None
                </div>
                <div onClick={() => handleSelectAll(false)}>
                  Select All
                </div>
              </MultiSelectHeader>
            )}
            itemRenderer={({ item, checked, disabled }) => (
              <Collapse isOpen={item.show}>
                <ClientPropertyChoice
                  disabled={item.disabled}
                  onClick={() => (item.isClient ? handleCollapse(item) : (!disabled && handleMultiChoiceItemClick(item, checked)))}
                  style={!item.isClient ? { paddingLeft: '35px' } : {}}
                >
                  <div className="d-flex">
                    <CheckIcon
                      checked={checked}
                      onClick={e => !disabled && item.isClient && handleMultiChoiceItemClick(item, checked, e)}
                    />
                    {item.label}
                  </div>
                  {item.isClient && (
                    <div style={{ cursor: 'pointer' }}>
                      {expandedClients.includes(item.cid) ? <i className="ri-arrow-up-s-line" /> : <i className="ri-arrow-down-s-line" />}
                    </div>
                  )}
                </ClientPropertyChoice>
              </Collapse>
            )}
          />
        </FormGroup>
      </Col>
      <Col md={6}>
        <FormGroup>
          <Label>{isCustomer ? 'Managed' : 'Access'} (Selected Properties)</Label>
          <SearchBox>
            <Search />
            <input type="text" className="kn-search__input___2tyxf" placeholder="Search..." onChange={e => handleKeywordChange('propertiesKeyword', e.target.value)} />
          </SearchBox>
          <AccessSelect>
            <MultiSelectHeader className="justify-content-between">
              <div>{selectedProperties.length} selected</div>
              <div style={{ cursor: 'pointer' }} onClick={() => handleInputChange({ properties: [] })}>Clear All</div>
            </MultiSelectHeader>
            <MultiSelectBody>
              {selectedProperties.map((item, index) => (
                <div key={index}>
                  <PropListItem>
                    <span>{item.label}</span>
                    <div onClick={() => handleMultiChoiceItemClick(item, true)}><i className="ri-close-line" /></div>
                  </PropListItem>
                </div>
              ))}
            </MultiSelectBody>
          </AccessSelect>
        </FormGroup>
      </Col>
    </Row>
  );
};

const mapStateToProps = state => ({
  currentProperty: state.property.property,
});

export default connect(mapStateToProps, {})(PropertyMultiSelect);
