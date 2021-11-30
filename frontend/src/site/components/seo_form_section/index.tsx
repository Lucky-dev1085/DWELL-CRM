import React, { useState, useEffect, FC } from 'react';
import { Row, Col, CardHeader, CardBody, FormGroup } from 'reactstrap';
import { FormItem } from 'site/components';
import { CardBasic, CardTitle } from 'site/components/common';
import { FormError } from 'src/interfaces';

interface SeoProps {
  title: string,
  titleId?: string,
  description: string,
  descriptionId?: string,
  helperText?: string,
  submitIsClicked?: boolean,
  headerLabel?: string,
  onChange: (data: { target: { id: string, value: string | number } }) => void,
  handleErrors?: (errors: FormError) => void,
}

const SeoFormSection: FC<SeoProps> = ({ onChange, title, titleId, description, descriptionId, helperText, handleErrors, submitIsClicked, headerLabel }) => {
  const [formErrors, updateErrors] = useState({} as FormError);

  const validate = () => {
    const errors = {} as FormError;

    if (title.length > 65) {
      errors.seoTitle = 'Title should be less than 65 letters';
    }

    if (description.length > 156) {
      errors.seoDescription = 'Description should be less than 156 letters';
    }
    updateErrors(errors);
    handleErrors(errors);
  };

  useEffect(() => {
    validate();
  }, [title, description]);

  return (
    <Row>
      <Col xs="12">
        <CardBasic>
          <CardHeader>
            <CardTitle>{headerLabel}</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col xs="12">
                <FormGroup>
                  <FormItem
                    handleOnChange={onChange}
                    value={title}
                    title="Page Title"
                    id={titleId}
                    name="title"
                    section="SEO"
                    placeholder="Title"
                    invalid={submitIsClicked && formErrors.seoTitle}
                    showTooltip
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col xs="12">
                <FormGroup className="mb-0">
                  <FormItem
                    handleOnChange={onChange}
                    value={description}
                    title="Page Description"
                    id={descriptionId}
                    name="description"
                    section="SEO"
                    placeholder="Description"
                    invalid={submitIsClicked && formErrors.seoDescription}
                    isTextArea
                    textAreaRow={3}
                    showTooltip
                    helperText={helperText}
                    sectionClassName="mb-input-none"
                  />
                </FormGroup>
              </Col>
            </Row>
          </CardBody>
        </CardBasic>
      </Col>
    </Row>
  );
};

SeoFormSection.defaultProps = {
  titleId: 'seo.title',
  descriptionId: 'seo.description',
  helperText: 'Description should be less than 156 letters',
  headerLabel: 'Search Engine Optimization (SEO)',
};

export default SeoFormSection;
