import React, { useState, useEffect, Fragment, FC } from 'react';
import { CardBody, CardHeader } from 'reactstrap';
import clone from 'lodash/clone';
import trim from 'lodash/trim';
import { CardSiteLogo, SiteTable, CardTitle, ActionCardText } from 'site/components/common';
import { CategoryImage, ButtonControls } from 'site/views/site_contents/neighborhood/styles';
import { colorToRGB } from 'site/common';
import { getCustomColorValue } from 'site/common/customColors';
import { createIconUrl } from 'site/common/categoryIcon';
import { templates } from 'site/constants';
import { NeighborHoodPageData, NeighborHooadDesignData, DetailResponse } from 'src/interfaces';
import CategoryModal from './CategoryModal';
import DeleteModal from './DeleteModal';
import EditModal from './EditModal';

interface CategoryContentProps {
  formValues: NeighborHoodPageData,
  handlePageDataUpdate: (data: NeighborHoodPageData, message: string) => Promise<DetailResponse>,
  handleImageUpload: (image: string) => Promise<string>,
  dataDesign: NeighborHooadDesignData,
}

const categoryContentPropChange = (prev, next) => prev.formValues.categories === next.formValues.categories;

const CategoryContent: FC<CategoryContentProps> = React.memo(({ formValues, handlePageDataUpdate, handleImageUpload, dataDesign }) => {
  const [isCategoryModalOpen, toggleCategoryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  const getIconUrl = (category, type) => {
    if (dataDesign) {
      const { values: { customColors, siteTemplate } } = dataDesign;
      const activeTemplateColors = customColors[siteTemplate];
      let colorKey = '';

      if (type === 'activeIcon') colorKey = '$neighborhood-marker-active-color';
      if (type === 'inactiveIcon') colorKey = '$primary';
      if (type === 'inactiveIcon' && siteTemplate === templates.V3) colorKey = '$deep-gray';

      const markerColor = colorToRGB(getCustomColorValue(colorKey, activeTemplateColors));
      if (category.iconName) {
        return createIconUrl(category.iconName, { color: markerColor });
      }
      return category[type] ? category[type] : 'https://maps.google.com/mapfiles/kml/paddle/red-circle.png';
    }
    return null;
  };

  const getCategoryDeleteMessage = (category) => {
    const { locations } = formValues;
    const filteredLocations = locations.filter((loc) => {
      const hasOnlyOneCategory = loc.category.length === 1;
      if (hasOnlyOneCategory) {
        return loc.category[0] === category;
      }
      return false;
    });
    if (filteredLocations.length) {
      return (
        <Fragment>
          <p>This category has the following associated location(s) which will also be deleted:</p>
          <ul>
            {
              filteredLocations.map((l, i) => <li key={i}><strong>{l.name}</strong></li>)
            }
          </ul>
        </Fragment>
      );
    }
    return false;
  };

  useEffect(() => {
    const categoriesList = formValues.categories.map(c => ({ ...c, activeIcon: getIconUrl(c, 'activeIcon'), inactiveIcon: getIconUrl(c, 'inactiveIcon') }));
    setCategories(categoriesList);
    setIsSubmitting(false);
  }, [formValues]);

  const handleCategoryAdd = (data) => {
    const clonedPageData = clone(formValues);
    setIsSubmitting(true);
    return Promise.all([handleImageUpload(data.activeIcon), handleImageUpload(data.inactiveIcon)]).then((imageUrl) => {
      const categoriesId = clonedPageData.categories.map(category => category.id);
      const newCategory = {
        activeIcon: imageUrl[0],
        inactiveIcon: imageUrl[1],
        name: data.name,
        createdDate: new Date().toDateString(),
        id: categoriesId.length ? Math.max(...categoriesId) + 1 : 1,
      };
      clonedPageData.categories.push(newCategory);
      return handlePageDataUpdate(clonedPageData, 'Category added');
    }).then(() => setIsSubmitting(false));
  };

  const handleCategoryDelete = (id) => {
    const clonedPageData = clone(formValues);
    const { categories: categoriesList, locations } = clonedPageData;
    categoriesList.splice(categoriesList.findIndex(cat => cat.id === id), 1);
    const locationsToKeep = locations.filter((loc) => {
      const { category } = loc;
      const hasOnlyOneCategory = category.length === 1;
      if (hasOnlyOneCategory) {
        if (category[0] === id) {
          return false;
        }
      }
      return true;
    });
    locationsToKeep.forEach((l) => {
      // eslint-disable-next-line no-param-reassign
      l.category = l.category.filter(c => c !== id);
    });
    clonedPageData.locations = locationsToKeep;
    return handlePageDataUpdate(clonedPageData, 'Category deleted');
  };

  const handleCategoryEdit = async (data, index) => {
    const clonedPageData = clone(formValues);
    const { activeIcon, inactiveIcon } = data;
    const isNewActiveIcon = typeof activeIcon === 'object';
    const isNewInactiveIcon = typeof inactiveIcon === 'object';
    let imageUrl = [];
    setIsSubmitting(true);
    if (isNewActiveIcon || isNewInactiveIcon) {
      const activeIconPromise = isNewActiveIcon ? handleImageUpload(activeIcon) : activeIcon;
      const inactiveIconPromise = isNewInactiveIcon ? handleImageUpload(inactiveIcon) : inactiveIcon;
      imageUrl = await Promise.all([activeIconPromise, inactiveIconPromise]);
    }
    const [activeIconUrl, inactiveIconUrl] = imageUrl.length ? imageUrl : [activeIcon, inactiveIcon];
    clonedPageData.categories[index] = { ...clonedPageData.categories[index], ...data, activeIcon: activeIconUrl, inactiveIcon: inactiveIconUrl };
    return handlePageDataUpdate(clonedPageData, 'Category updated');
  };

  const isCategoryNameExist = (name, prevName = '') =>
    categories.filter(c => c.name.toLowerCase() !== prevName.toLowerCase()).map(c => c.name.toLowerCase()).includes(trim(name).toLowerCase());

  return (
    <CardSiteLogo>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <ActionCardText onClick={() => toggleCategoryModal(!isCategoryModalOpen)}>
          <i className="ri-price-tag-3-line" />
          Add Category
        </ActionCardText>
        {isCategoryModalOpen &&
          <CategoryModal
            isModalOpen={isCategoryModalOpen}
            onModalToggle={() => toggleCategoryModal(!isCategoryModalOpen)}
            submitting={isSubmitting}
            onSubmit={handleCategoryAdd}
            isCategoryNameExist={isCategoryNameExist}
          />
        }
      </CardHeader>
      <CardBody className="p-0 px-4">
        <SiteTable>
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Name</th>
              <th className="text-center" style={{ width: '15%' }}>Active State Icon</th>
              <th className="text-center" style={{ width: '15%' }}>Inactive State Icon</th>
              <th className="text-right" style={{ width: '20%' }}>Date Created</th>
              <th style={{ width: '15%' }} />
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={i}>
                <td>{c.name}</td>
                <td className="text-center">
                  <CategoryImage>
                    <img
                      src={c.activeIcon}
                      alt="Category icon"
                      height={40}
                      width={40}
                    />
                  </CategoryImage>
                </td>
                <td className="text-center">
                  <CategoryImage>
                    <img
                      src={c.inactiveIcon}
                      alt="Category icon"
                      height={40}
                      width={40}
                    />
                  </CategoryImage>
                </td>
                <td className="text-right">{c.createdDate}</td>
                <td style={{ textAlign: 'right' }}>
                  <ButtonControls>
                    <EditModal
                      data={{ ...c, activeIcon: getIconUrl(c, 'activeIcon'), inactiveIcon: getIconUrl(c, 'inactiveIcon') }}
                      onEdit={v => handleCategoryEdit(v, i)}
                      submitting={isSubmitting}
                      modalComp={CategoryModal}
                      isCategoryNameExist={name => isCategoryNameExist(name, c.name)}
                      index={i}
                    />{' '}
                    <DeleteModal
                      name={c.name}
                      message={getCategoryDeleteMessage(c.id)}
                      onDelete={() => handleCategoryDelete(c.id)}
                      index={i}
                      type="Category"
                    />
                  </ButtonControls>
                </td>
              </tr>
            ))}
          </tbody>
        </SiteTable>
      </CardBody>
    </CardSiteLogo>
  );
}, categoryContentPropChange);

export default CategoryContent;
