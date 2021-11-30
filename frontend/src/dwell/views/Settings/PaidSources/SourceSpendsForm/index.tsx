import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col, CardFooter, Row, DropdownToggle, DropdownMenu, DropdownItem, ButtonDropdown } from 'reactstrap';
import actions from 'dwell/actions';
import 'src/scss/pages/_paid_sources.scss';
import { isEmpty } from 'lodash';
import { DetailResponse, SourceProps } from 'src/interfaces';

interface SourceSpendFormProps extends RouteComponentProps {
  currentSource?: { id: string },
  sources: SourceProps[],
  updateSourceById: (sourceId: number | string, data: {is_paid: boolean}, msg?: (() => void) | boolean) => Promise<DetailResponse>,
  getSources: () => void,
  onClose: () => void,
}

const SourceSpendForm: FC<SourceSpendFormProps> = ({ currentSource, updateSourceById, getSources, onClose, sources }) => {
  const [sourceId, setSourceId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isEmpty(currentSource)) {
      setSourceId(currentSource.id);
    }
  }, [currentSource]);

  const handleCreate = () => {
    if (currentSource.id && currentSource.id !== sourceId) {
      updateSourceById(currentSource.id, { is_paid: false });
    }
    updateSourceById(sourceId, { is_paid: true })
      .then(() => {
        onClose();
        getSources();
      });
  };

  const handleCancel = () => {
    onClose();
  };

  const convertedSourceChoices = sources.filter(source => !source.is_paid || source.id === currentSource.id).reduce((prev, source) => ({ ...prev, [source.id]: source.name }), {});
  return (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12">
          <Card className="create-paid-source">
            <CardHeader>
              {currentSource.id ? 'Edit paid source' : 'Create paid source'}
            </CardHeader>
            <CardBody>
              <Card>
                <CardBody>
                  {
                    <ButtonDropdown className="mr-1 select-input w-25" isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(!isDropdownOpen)}>
                      <DropdownToggle caret className="bg-white">
                        {sourceId ? convertedSourceChoices[sourceId] : 'Select source'}
                      </DropdownToggle>
                      <DropdownMenu>
                        {Object.keys(convertedSourceChoices).map((key, index) => (
                          <React.Fragment key={index}>
                            <DropdownItem onClick={() => setSourceId(key)} className={key === sourceId ? 'selected' : ''}>
                              {convertedSourceChoices[key]}
                            </DropdownItem>
                          </React.Fragment>
                        ))}
                      </DropdownMenu>
                    </ButtonDropdown>
                  }
                </CardBody>
                <CardFooter className="bg-white">
                  <button className="mr-1 btn btn-primary float-right" onClick={handleCreate} disabled={!sourceId}>Save paid source</button>
                  <button className="mr-1 btn btn-secondary float-right" onClick={handleCancel}>Cancel</button>
                </CardFooter>
              </Card>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = state => ({
  sources: state.prospectSource.sources,
});

SourceSpendForm.defaultProps = {
  currentSource: {} as { id: string },
};

export default connect(
  mapStateToProps,
  {
    ...actions.prospectSource,
  },
)(withRouter(SourceSpendForm));
