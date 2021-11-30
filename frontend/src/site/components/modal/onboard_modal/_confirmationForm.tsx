import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col, CardBody, Card } from 'reactstrap';
import { LOGGED_ACCOUNT, roleTypes } from 'site/constants';
import { LabelTitle } from './styles';

const loggedAccount = JSON.parse(localStorage.getItem(LOGGED_ACCOUNT)) || {};
const isLLAdmin = loggedAccount.role === roleTypes.LIFT_LYTICS_ADMIN;

const stylesRow = { marginTop: 0 };

const ConfirmationForm = ({ customer, user, property, client, customers, clients, source, userSkipped, propertySkipped, customerDetails }) => {
  // eslint-disable-next-line
  const existingCustomer = customers.find(item => item.id === parseInt(customer.id, 0));
  // eslint-disable-next-line
  const existingClient = clients.find(item => item.id === parseInt(client.id, 0));
  const employees = customerDetails.id === customer.id ? customerDetails.employee : [];
  return (
    <React.Fragment>
      {isLLAdmin ? (
        <Row>
          <Col xs={source === 'property' && existingCustomer ? '6' : '12'} className={source === 'property' ? 'pr-10' : ''}>
            <Card className="p-2 mb-10">
              <CardBody className="pt-1 pb-0">
                <Row style={stylesRow}>
                  <Col>
                    <Row style={stylesRow}><LabelTitle>Customer Name</LabelTitle></Row>
                    <Row style={stylesRow}><h6>{existingCustomer ? existingCustomer.customer_name : customer.customer_name}</h6></Row>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col xs={source === 'property' && existingCustomer ? '6' : '12'} className={source === 'property' ? 'pl-10' : ''}>
            <Card className="p-2 mb-10">
              <CardBody className="pt-1 pb-0">
                <Row style={stylesRow}>
                  <Col>
                    <Row style={stylesRow}><LabelTitle>Client name:</LabelTitle></Row>
                    <Row style={stylesRow}><h6>{existingClient ? existingClient.name : client.name}</h6></Row>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      ) : null}

      {!isLLAdmin && (
        <Row>
          <Col xs="12">
            <Card className="p-2 mb-10">
              <CardBody className="pt-1 pb-0">
                <Row>
                  <Col>
                    <Row style={stylesRow}><LabelTitle>Client name:</LabelTitle></Row>
                    <Row style={stylesRow}><h6>{existingClient ? existingClient.name : client.name}</h6></Row>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>)
      }

      {
        !userSkipped && (
          <React.Fragment>
            <Card className="p-2 mb-10">
              <CardBody className="pt-1 pb-0">
                <Row style={stylesRow}><LabelTitle>Selected Users:</LabelTitle></Row>
                {employees.filter(i => user.ids.includes(i.id)).map(i => (
                  <Row style={stylesRow}><h6>{`${i.first_name} ${i.last_name}`}</h6></Row>
                ))}
              </CardBody>
            </Card>
          </React.Fragment>
        )
      }

      {
        !propertySkipped && (
          <React.Fragment>
            <Card className="p-2 mb-10">
              <CardBody className="pt-1 pb-0">
                <Row className="mb-2">
                  <Col xs="12" className="mb-2">
                    <Row style={stylesRow}><LabelTitle>Domain:</LabelTitle></Row>
                    <Row style={stylesRow}><h6>{property.domain}</h6></Row>
                  </Col>
                  <Col xs="12">
                    <Row style={stylesRow}><LabelTitle>Property name:</LabelTitle></Row>
                    <Row style={stylesRow}><h6>{property.name}</h6></Row>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </React.Fragment>
        )
      }
    </React.Fragment>
  );
};

ConfirmationForm.defaultProps = {
  customers: [],
  clients: [],
  customerDetails: {},
};

ConfirmationForm.propTypes = {
  customers: PropTypes.arrayOf(PropTypes.shape({})),
  clients: PropTypes.arrayOf(PropTypes.shape({})),
  customerDetails: PropTypes.shape({}),
  customer: PropTypes.shape({}).isRequired,
  property: PropTypes.shape({}).isRequired,
  client: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  source: PropTypes.string.isRequired,
  userSkipped: PropTypes.bool.isRequired,
  propertySkipped: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isSubmitting: state.property.isSubmitting || state.pageData.isSubmitting,
  clients: state.client.clients,
  customers: state.customer.customers,
  isClientDataLoaded: state.property.isPropertyDataLoaded,
  customerDetails: state.customer.customerDetails,
});

export default connect(
  mapStateToProps,
  null,
)(ConfirmationForm);
