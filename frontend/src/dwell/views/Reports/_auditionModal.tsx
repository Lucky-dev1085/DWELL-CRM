import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import { Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import { cloneDeep } from 'lodash';
import Loader from 'dwell/components/Loader';
import { reportTypes } from 'dwell/constants';
import 'src/scss/pages/_reports.scss';
import 'src/scss/pages/_leads_list.scss';
import { sortColumns } from './ReportBlocks/_utils';

interface AuditionModalProps {
  show: boolean,
  type: string,
  isLoaded: boolean,
  handleClose: () => void,
  overviewReports: { leads: [], tours: [], leases: [], responses: [] },
}

const AuditionModal: FC<AuditionModalProps> = (props) => {
  const { show, handleClose, type, overviewReports, isLoaded } = props;
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const closeBtn = <button className="close" onClick={() => handleClose()}>&times;</button>;
  const currentReport = reportTypes.REPORT_BLOCK_TYPES[type];
  const { defaultSortField } = currentReport;

  useEffect(() => {
    switch (type) {
      case 'LEADS':
        setData((overviewReports.leads || [])
          .sort((a, b) => b[defaultSortField] - a[defaultSortField]));
        break;
      case 'TOURS':
        setData((overviewReports.tours || [])
          .sort((a, b) => b[defaultSortField] - a[defaultSortField]));
        break;
      case 'LEASES':
        setData((overviewReports.leases || [])
          .sort((a, b) => b[defaultSortField] - a[defaultSortField]));
        break;
      case 'RESPONSES':
        setData((overviewReports.responses || [])
          .sort((a, b) => new Date(a[defaultSortField]).getTime() - new Date(b[defaultSortField]).getTime()));
        break;
      default: break;
    }
    setColumns(reportTypes.REPORT_BLOCK_TYPES[type].columns);
  }, [type, overviewReports]);

  const indication = () => (
    <React.Fragment>
      <div className="empty-table">
        {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
        <div>{!isLoaded ? <Loader /> : <h4>No results found</h4>}</div>
      </div>
    </React.Fragment>);

  const onTableChange = (changeType, { sortField, sortOrder, data: tableData }) => {
    let result = cloneDeep(tableData);
    if (changeType === 'sort') {
      result = sortColumns(sortOrder, sortField, result);
      setData(result);
    }
  };

  return (
    <Modal
      isOpen={show}
      centered
      toggle={() => handleClose()}
      size="xl"
      aria-labelledby="example-custom-modal-styling-title"
      className="drilldown reports"
    >
      <ModalHeader close={closeBtn}>
        <span>{`${currentReport.name}`}</span>
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col xs={12} style={{ paddingBottom: '1em' }}>
            <BootstrapTable
              remote={{ sort: true }}
              keyField="id"
              data={data || []}
              columns={columns}
              wrapperClasses="drilldown-table audition table-responsive table-alpha"
              noDataIndication={indication}
              onTableChange={onTableChange}
              bordered={false}
            />
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

const mapStateToProps = state => ({
  overviewReports: state.report.overviewReports,
  isLoaded: state.report.isLoaded,
});

export default connect(mapStateToProps)(AuditionModal);
