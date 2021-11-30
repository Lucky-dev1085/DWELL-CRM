import React, { FC } from 'react';
import { map } from 'lodash';
import { Col, Row } from 'reactstrap';
import { ColorPicker } from 'site/components';

interface ListProps {
  id: string,
  objectKey?: string,
  colorLabels?: { name: string, label: string }[],
  data: { name: string, value: string }[],
  onChange: (data: { target: { id?: string, value?: string | number } }) => void,
}

const List: FC<ListProps> = ({ data, onChange, id, objectKey, colorLabels }) => {
  const mappedItems = map(data, (item, key) => {
    const resolvedValue = objectKey ? item[objectKey] : item;
    const labelTxt = colorLabels.find(colorLabel => colorLabel.name === item.name);
    const resolvedId = objectKey ? `${id}[${key}][${objectKey}]` : `${id}[${key}]`;

    return (
      <Col md="6" className="flex-column align-items-start" key={key}>
        <div className="d-flex">
          <ColorPicker
            id={resolvedId}
            target={`color-${key}`}
            value={resolvedValue}
            onChange={onChange}
            defaultColors={[]}
            className="w-100"
            isShowTooltip={false}
            title={labelTxt ? labelTxt.label : 'Header and Footer color:'}
          />
        </div>
      </Col>
    );
  });

  return (
    <React.Fragment>
      <Row>
        {mappedItems}
      </Row>
    </React.Fragment>
  );
};

List.defaultProps = {
  objectKey: null,
  colorLabels: [],
};

export default List;
