import React, { Fragment, useState, FC } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { IconAction } from 'site/components/common';
import { DetailResponse, Location, Category } from 'src/interfaces';

type DataType = Location | Category;

interface EditModalProps {
  data: DataType,
  onEdit: (data: DataType) => Promise<DetailResponse>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modalComp: any,
  index: number,
  submitting?: boolean,
  isCategoryNameExist?: (name: string) => boolean,
  categories?: {
    id?: number,
    name?: string,
    iconName?: string,
    createdDate?: string,
  }[],
}

const EditModal: FC<EditModalProps> = ({ data, onEdit, submitting, modalComp: ModalComp, index, ...rest }) => {
  const [isModalOpen, toggleModal] = useState(false);

  return (
    <Fragment>
      <IconAction onClick={() => toggleModal(!isModalOpen)} id={`editCategory-${index}`}>
        <i className="ri-pencil-line" />
      </IconAction>
      <UncontrolledTooltip placement="top" target={`editCategory-${index}`}>
        Edit
      </UncontrolledTooltip>
      {
        isModalOpen && (
          <ModalComp
            isModalOpen={isModalOpen}
            onModalToggle={() => toggleModal(!isModalOpen)}
            isEdit
            data={data}
            onSubmit={onEdit}
            submitting={submitting}
            {...rest}
          />
        )
      }
    </Fragment>
  );
};

EditModal.defaultProps = {
  submitting: false,
};

export default EditModal;
