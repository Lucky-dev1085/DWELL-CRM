import React, { useState, useEffect, FC } from 'react';
import { Row, UncontrolledTooltip, Button } from 'reactstrap';
import { CategoryModal, Spinner } from 'site/components';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { cloneDeep, isEmpty } from 'lodash';
import 'react-tagsinput/react-tagsinput.css';
import actions from 'site/actions';
import { NavbarItem, AnimationWrapper } from 'site/components/common';
import { AmenitiesNavBar, NavbarAdd, AddIcon } from 'site/views/site_contents/amenities/styles';
import { ListResponse, AmenitiesPageData } from 'src/interfaces';
import Content from './_component/content';

interface AmenitiesProps extends RouteComponentProps {
  pageData: { values?: AmenitiesPageData },
  setChangedState: (state: boolean) => void,
  getPageData: (type: string) => Promise<ListResponse>,
  isPageDataLoaded?: boolean,
  clickedType?: { type: string },
  handleError?: (isError: boolean) => void,
}

const AmenitiesPage: FC<AmenitiesProps> = ({ getPageData, pageData, setChangedState, isPageDataLoaded, clickedType, handleError }) => {
  const [formValues, setFormValues] = useState(cloneDeep(pageData.values));
  const [showModal, toggleModal] = useState(false);
  const [categorySelected, updateCategorySelected] = useState(-1);
  const [categoryToEdit, updateCategoryToEdit] = useState(null);
  const [showCategories, toggleShowCategories] = useState(!isEmpty(pageData) ? pageData.values.showCategories : false);

  useEffect(() => {
    if (!isEmpty(pageData)) {
      setFormValues(cloneDeep(pageData.values));
      toggleShowCategories(pageData.values.showCategories);
    } else {
      getPageData('amenities');
    }
  }, [pageData]);

  const onClickEdit = (editCategory) => {
    updateCategoryToEdit(editCategory);
    toggleModal(true);
  };

  const handleChange = ({ target: { checked } }) => {
    toggleShowCategories(checked);
    setChangedState(true);
  };

  const handleSubCategories = (action, id, category = {}) => {
    const { subCategories } = formValues;
    if (action === 'remove') {
      const categoryList = formValues.subCategories.filter((el, i) => i !== id);
      updateCategorySelected(-1);
      setFormValues({ ...formValues, subCategories: categoryList });
    }

    if (action === 'edit') {
      const updateSubCategories = [...subCategories];
      updateSubCategories[id] = category;
      setFormValues({ ...formValues, subCategories: updateSubCategories });
    }

    if (action === 'create') {
      setFormValues({ ...formValues, subCategories: [...subCategories, category] });
    }
  };

  const renderSubcategories = () => {
    const subCategories = formValues.subCategories.map((t, i) =>
      (
        <NavbarItem key={i} onClick={() => updateCategorySelected(i)} active={categorySelected === i}>
          {t.pageTitle}
          <i className="ri-close-circle-fill" onClick={(e) => { e.stopPropagation(); onClickEdit(i); }} />
        </NavbarItem >
      ));

    return (
      <React.Fragment>
        {subCategories}
      </React.Fragment>
    );
  };

  if (!isPageDataLoaded || isEmpty(formValues)) return <Spinner />;

  return (
    <AnimationWrapper>
      <Row className="justify-content-between pl-3 pr-3">
        <AmenitiesNavBar>
          <NavbarItem onClick={() => updateCategorySelected(-1)} active={categorySelected === -1}>
            Main Content
          </NavbarItem>
          {renderSubcategories()}
          <NavbarAdd id="addCategory">
            <Button color="primary" onClick={() => onClickEdit(null)}>
              <AddIcon />
            </Button>
          </NavbarAdd>
          <UncontrolledTooltip placement="top" target="addCategory">
            Add Category
          </UncontrolledTooltip>
        </AmenitiesNavBar>
      </Row>
      <Content
        page={categorySelected}
        showCategories={showCategories}
        handleChange={handleChange}
        subCategories={formValues.subCategories}
        clickedType={clickedType}
        handleError={handleError}
      />
      <CategoryModal
        title={categoryToEdit !== null ? 'Edit Category' : 'New Category'}
        show={showModal}
        category={categoryToEdit !== null ? {
          id: categoryToEdit,
          ...formValues.subCategories[categoryToEdit],
        } : null}
        onClose={() => toggleModal(false)}
        handleSubCategories={handleSubCategories}
        removable={formValues.subCategories.length > 1}
      />
    </AnimationWrapper>
  );
};

AmenitiesPage.defaultProps = {
  pageData: {},
};

const mapStateToProps = state => ({
  isPageDataLoaded: state.pageData.isPageDataLoaded,
  pageData: state.pageData.amenitiesPageData,
});

export default connect(
  mapStateToProps,
  {
    ...actions.pageData,
  },
)(withRouter(AmenitiesPage));
