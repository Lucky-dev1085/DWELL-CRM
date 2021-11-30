import React, { useState, FC } from 'react';
import { map } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons/faPlayCircle';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { sortVideosToTop } from 'site/common/helpers';
import { ConfirmActionModal } from 'site/components';
import {
  Gallery, GalleryItem, RemoveImage, ItemImage, GalleryItemOverlay, GalleryItemNoIndent, ActionWrapper, ButtonAction, GalleryWrapper, PlayIcon,
  VideoDescription,
} from 'site/components/sortable_list/styles';
import CheckBox from '../check_box';
import EditMediaModal from './EditMediaModal';

const SortableItem = SortableElement(({ categories, onRemoveClick, indexToChange, noInputs, onInputChange, onHomePageVideoChange, value: { src, title, location, useGradient, category, videoUrl, displayOnHomepage }, submitting, onSubmit }) => {
  const [isEditModalOpen, toggleEditModal] = useState(false);
  const [isShowConfirm, toggleConfirm] = useState(false);
  const isVideo = !!videoUrl;

  const details = noInputs ? (
    <GalleryItem className="mb-0">
      <RemoveImage onClick={() => onRemoveClick(src)} >
        <i className="ri-close-circle-fill" />
      </RemoveImage>
      <ItemImage>
        <img src={src} alt="carousel" />
      </ItemImage>
      <div className="mt-1">
        <CheckBox
          id={`images[${indexToChange}].useGradient`}
          label="Use gradient"
          checked={useGradient}
          onChange={() => onInputChange({ target: { id: `images[${indexToChange}].useGradient`, value: !useGradient } })}
        />
      </div>
    </GalleryItem>
  ) :
    (
      <GalleryItemNoIndent>
        <GalleryWrapper style={isVideo ? { marginBottom: 0 } : null}>
          <img src={src} alt="carousel" />
          {
            isVideo && (
              <React.Fragment>
                <GalleryItemOverlay />
                <PlayIcon>
                  <FontAwesomeIcon icon={faPlayCircle} />
                </PlayIcon>
                <VideoDescription>{title}</VideoDescription>
              </React.Fragment>
            )
          }
          <ActionWrapper>
            <ButtonAction onClick={() => toggleEditModal(true)}>
              <i className="ri-edit-2-fill" />
            </ButtonAction>
            <ButtonAction onClick={() => toggleConfirm(true)} >
              <i className="ri-delete-bin-line" />
            </ButtonAction>
          </ActionWrapper>
          <EditMediaModal
            submitting={submitting}
            onSubmit={(data) => { onSubmit(data, indexToChange); }}
            isModalOpen={isEditModalOpen}
            onModalToggle={() => toggleEditModal(!isEditModalOpen)}
            categories={categories}
            data={{ title, category, location }}
            displayOnHomepage={!!displayOnHomepage}
            indexToChange={indexToChange}
            onHomePageVideoChange={onHomePageVideoChange}
            isVideo={isVideo}
          />
          <ConfirmActionModal
            title="Confirm Delete"
            text="You are about to delete this media file"
            onConfirm={() => { onRemoveClick(src, isVideo); toggleConfirm(false); }}
            show={isShowConfirm}
            onClose={() => toggleConfirm(false)}
          />
        </GalleryWrapper>
      </GalleryItemNoIndent>
    );

  return (
    <React.Fragment>
      {details}
    </React.Fragment>
  );
});

const Grid = SortableContainer(({ categories, items, noInputs, onInputChange, onHomePageVideoChange, onRemoveClick, isGalleryPage, submitting, onSubmit }) => {
  // const sortedItems = isGalleryPage ? items.sort(sortVideosToTop) : items;
  const sortedItems = items;
  const itemsWithOriginalIndex = sortedItems.map((itm, i) => ({ ...itm, index: i }));
  return (
    <Gallery>
      {map(itemsWithOriginalIndex, (value, index) => (
        <div key={index} className="position-relative">
          <SortableItem
            categories={categories}
            noInputs={noInputs}
            onInputChange={onInputChange}
            onHomePageVideoChange={onHomePageVideoChange}
            index={value.index}
            indexToChange={value.index}
            value={value}
            onRemoveClick={onRemoveClick}
            submitting={submitting}
            onSubmit={onSubmit}
          />
        </div>
      ))}
    </Gallery>
  );
});

interface Image {
  src?: string,
  title?: string,
  location?: string,
  useGradient?: boolean,
  category?: string,
  videoUrl?: string,
  displayOnHomepage?: boolean,
}

interface SortableListProps {
  categories?: string[],
  images: Image[],
  noInputs?: boolean,
  isGalleryPage?: boolean,
  submitting?: boolean,
  onInputChange?: (data: { target: { id: string, value: string | number } }) => void,
  onHomePageVideoChange?: (index: string) => void,
  onSubmit?: (data: Image, index: string) => void,
  onSortEnd: (data: { oldIndex: number, newIndex: number }) => void,
  onRemoveClick: (src: string, isVideo: boolean) => void,
}

const SortableList: FC<SortableListProps> = ({ categories, images, onRemoveClick, onSortEnd, onInputChange, noInputs, isGalleryPage, onHomePageVideoChange, submitting, onSubmit }) => {
  const resolveShouldCancelStart = event => event.target.tagName.toLowerCase() !== 'img';

  return (
    <Grid
      onRemoveClick={onRemoveClick}
      onInputChange={onInputChange}
      items={images}
      categories={categories}
      axis="xy"
      onSortEnd={onSortEnd}
      noInputs={noInputs}
      shouldCancelStart={resolveShouldCancelStart}
      isGalleryPage={isGalleryPage}
      onHomePageVideoChange={onHomePageVideoChange}
      distance={1}
      submitting={submitting}
      onSubmit={onSubmit}
    />
  );
};

SortableList.defaultProps = {
  onInputChange: null,
  noInputs: false,
  categories: null,
  isGalleryPage: false,
  submitting: false,
};

export default SortableList;
