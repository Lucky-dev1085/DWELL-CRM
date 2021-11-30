/* eslint-disable jsx-a11y/heading-has-content */
import { Col, Row, Button, UncontrolledTooltip } from 'reactstrap';
import React, { useState, useEffect, FC } from 'react';
import { connect } from 'react-redux';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import BootstrapTable from 'react-bootstrap-table-next';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { ConfirmActionModal, PromotionModal, Loader } from 'site/components';
import actions from 'site/actions';
import { ContentHeader, IconAction, ContentBodySite, FormSwitcher } from 'site/components/common';
import { SuccessResponse, PromotionProps, DetailResponse } from 'src/interfaces';
import { PrimaryButton } from 'styles/common';
import { TableClient, EmptyContent, PromotionTextContainer } from 'site/views/site_contents/promotions/styles';

interface Promotions extends RouteComponentProps {
  isPromotionsLoaded: boolean,
  promotions: PromotionProps[],
  getPromotions: () => void,
  updatePromotion: (id: number, data: { status: string }) => Promise<DetailResponse>,
  deletePromotion: (id: number) => Promise<SuccessResponse>,
}

const Promotions: FC<Promotions> = ({ isPromotionsLoaded, promotions, getPromotions, deletePromotion, updatePromotion }) => {
  const [currentPromotion, setCurrentPromotion] = useState<PromotionProps>({});
  const [showPromotionModal, togglePromotionModal] = useState(false);
  const [showConfirmModal, toggleConfirmModal] = useState(false);

  useEffect(() => {
    getPromotions();
  }, []);

  const onClickNewPromotion = () => {
    togglePromotionModal(true);
    setCurrentPromotion({});
  };

  const handleReloadPromotions = () => {
    getPromotions();
    togglePromotionModal(false);
    setCurrentPromotion({});
  };

  const handleDeletePromotion = () => {
    deletePromotion(currentPromotion.id)
      .then(() => {
        getPromotions();
        toggleConfirmModal(false);
        setCurrentPromotion({});
      });
  };

  const stopAction = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const indication = () => {
    if (!isPromotionsLoaded) {
      return <Loader />;
    }
    return (
      <EmptyContent>
        <i className="ri-home-4-line" />
        <h5><span>No promotions</span></h5>
        <p>Please add the promotion here.</p>
        <PrimaryButton onClick={onClickNewPromotion}>
          <span>+</span> Add Promotion
        </PrimaryButton>
      </EmptyContent>);
  };

  const updatePromotionStatus = (e, promotion) => {
    stopAction(e);

    if (promotion.id) {
      updatePromotion(promotion.id, { ...promotion, is_active: !promotion.is_active })
        .then(() => getPromotions());
    }
  };

  const tableOptions = [
    {
      dataField: 'name',
      text: 'Name',
      sort: true,
    },
    {
      dataField: 'promotion_html',
      text: 'Promotion Text',
      sort: true,
      formatter: value => (
        <PromotionTextContainer dangerouslySetInnerHTML={{ __html: value }} />
      ),
    },
    {
      dataField: 'is_active',
      text: 'Active',
      sort: true,
      formatter: (value, raw) => <FormSwitcher inactive={!value} onClick={e => updatePromotionStatus(e, raw)} />,
    },
    {
      dataField: 'image',
      text: 'Background',
      formatter: value => (
        <img src={value || '/static/images/no-image.jpg'} alt="customer logo" style={{ width: '36px', height: '36px', borderRadius: '5px' }} />
      ),
    },
    {
      text: '',
      sort: false,
      dataField: 'id',
      formatter: (value, promotion) => (
        <div className="d-flex float-right">
          <IconAction>
            <i
              className="ri-pencil-line"
              id={`edit-${promotion.id}`}
              onClick={(e) => { stopAction(e); togglePromotionModal(true); setCurrentPromotion(promotion); }}
            />
          </IconAction>
          <UncontrolledTooltip placement="top" target={`edit-${promotion.id}`}>
            Edit promotion
          </UncontrolledTooltip>
          <IconAction>
            <i
              className="ri-delete-bin-5-line"
              id={`delete-${promotion.id}`}
              onClick={(e) => { stopAction(e); toggleConfirmModal(true); setCurrentPromotion(promotion); }}
            />
          </IconAction>
          <UncontrolledTooltip placement="top" target={`delete-${promotion.id}`}>
            Delete promotion
          </UncontrolledTooltip>
        </div>
      ),
    },
  ];

  const content = (
    <section>
      {showPromotionModal && (
        <PromotionModal
          title={currentPromotion.id ? 'Edit Promotion' : 'New Promotion'}
          reload={handleReloadPromotions}
          promotion={currentPromotion}
          show={showPromotionModal}
          onClose={() => togglePromotionModal(false)}
        />
      )}
      <ConfirmActionModal
        title="Confirm Delete"
        text="Do you wish to delete promotion"
        itemName={currentPromotion.name}
        onConfirm={handleDeletePromotion}
        show={showConfirmModal}
        onClose={() => toggleConfirmModal(false)}
      />
      <ToolkitProvider
        keyField="id"
        data={promotions}
        columns={tableOptions}
      >
        {
          props => (
            <BootstrapTable
              bordered={false}
              noDataIndication={indication}
              {...props.baseProps}
            />
          )
        }
      </ToolkitProvider>
    </section>
  );

  return (
    <ContentBodySite>
      <ContentHeader className="justify-content-end">
        <div>
          <Button
            color="primary"
            onClick={onClickNewPromotion}
          >
            <i className="ri-add-circle-fill" />
            Create New Promotion
          </Button>
        </div>
      </ContentHeader>
      <Row>
        <Col xs="12">
          <TableClient>
            {content}
          </TableClient>
        </Col>
      </Row>
    </ContentBodySite>
  );
};

const mapStateToProps = state => ({
  isPromotionsLoaded: state.promotion.isPromotionsLoaded,
  promotions: state.promotion.promotions,
});

export default connect(
  mapStateToProps,
  {
    ...actions.promotion,
  },
)(withRouter(Promotions));
