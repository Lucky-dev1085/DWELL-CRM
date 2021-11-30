import React, { FC } from 'react';
import { connect } from 'react-redux';
import { FormFeedback, Input, Label, FormGroup } from 'reactstrap';
import { ClientProps } from 'src/interfaces';
import { CustomSwitch, SwitchInput, SwitchLabel } from 'site/components/common';
import { CustomSelect } from './styles';

interface ClientFormProps {
  clients: Array<ClientProps>,
  client: ClientProps,
  errors: { id: number, name: string },
  onChange: (data: { target: { id: string, value: string | number } }) => null,
  shouldNotAllowExisting: boolean,
  whitelistClients: number[],
}

const ClientForm: FC<ClientFormProps> = ({ clients, onChange, client, errors, shouldNotAllowExisting, whitelistClients }) => {
  const availableClients = clients.filter(item => whitelistClients.includes(item.id));
  const customerOptions = availableClients.map((item, key) => (<option key={key} value={item.id}>{item.name}</option>));
  return (
    <React.Fragment>
      {!shouldNotAllowExisting ? (
        <FormGroup>
          <div className="mt-1">
            <CustomSelect type="select" value={client.useExisting} id="useExisting" onChange={onChange}>
              <option value="true">Existing Client</option>
              <option value="false">New Client</option>
            </CustomSelect>
          </div>
        </FormGroup>
      ) : null}
      {(client.useExisting === 'true' && !shouldNotAllowExisting) ? (
        <FormGroup className="mb-15">
          <div className="mt-1">
            <CustomSelect type="select" value={client.id} id="id" onChange={onChange} invalid={errors.id}>
              <option value={null}>Please choose the client</option>
              {customerOptions}
            </CustomSelect>
            <FormFeedback>{errors.id}</FormFeedback>
          </div>
        </FormGroup>
      ) :
        (
          <React.Fragment>
            <FormGroup>
              <Label htmlFor="name">Client name:</Label>
              <Input
                type="text"
                id="name"
                aria-describedby="name"
                placeholder="Enter name of client"
                value={client.name}
                onChange={onChange}
                invalid={errors.name}
              />
              <FormFeedback>{errors.name}</FormFeedback>
            </FormGroup>
            <CustomSwitch>
              <SwitchInput
                type="checkbox"
                id="status"
                checked={client.status === 'ACTIVE'}
                onChange={e => onChange({ target: { id: 'status', value: e.target.checked ? 'ACTIVE' : 'INACTIVE' } })}
              />
              <SwitchLabel htmlFor="status">Active State</SwitchLabel>
            </CustomSwitch>
          </React.Fragment>
        )}
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  isSubmitting: state.property.isSubmitting || state.pageData.isSubmitting,
  clients: state.client.clients,
  customers: state.customer.customers,
  isClientDataLoaded: state.property.isPropertyDataLoaded,
});

export default connect(
  mapStateToProps,
  null,
)(ClientForm);
