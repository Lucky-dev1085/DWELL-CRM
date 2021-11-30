import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { Row, Col } from 'reactstrap';
import { SBTbl, StyledTHead, StyledTRow, StyledTBody, SBTblHeaderItem, SBTblBodyItem, SBTblHeaderSub, SBTblHeaderBody, SBTblWrapper } from './styles';

interface Acquisition {
  sessions: string,
  visitors: string,
  new_visitors: string,
}

interface Behavior {
  bounce_rate: string,
  pages_session: string,
  avg_session_duration: string,
}

interface Conversion {
  leads_per: string,
  leads_sharp: string,
  tours_per: string,
  tours_sharp: string,
  leases_per: string,
  leases_sharp: string,
}

interface SourceBehaviorReportProps extends RouteComponentProps {
  type: string,
  isUpdated: boolean,
  attribution: string,
  isLoaded: boolean,
  sitesReports: {
    tbl_values: { source_mediums: [], acquisitions: Acquisition[], behaviors: Behavior[], conversions: Conversion[] },
  },
  compareFilterValue: string,
  setIsAuditionOpen: (show: boolean) => void,
  setAuditionModalType: (type: string) => void,
  period: string,
}

const SourceBehaviorReport: FC<SourceBehaviorReportProps> = ({ sitesReports, compareFilterValue, type,
  isUpdated, attribution, isLoaded }) => {
  const [tblValues, setTblValues] = useState({ source_mediums: [], acquisitions: [], behaviors: [], conversions: [] });

  useEffect(() => {
    if (!isEmpty(sitesReports)) {
      const { tbl_values: sitesTblValues } = sitesReports;

      setTblValues({
        source_mediums: sitesTblValues.source_mediums,
        acquisitions: sitesTblValues.acquisitions,
        behaviors: sitesTblValues.behaviors,
        conversions: sitesTblValues.conversions,
      });
    }
  }, [sitesReports]);

  const getHeaderSubTitle = (key) => {
    switch (key) {
      case 'sessions':
        return 'Sessions';
        break;
      case 'visitors':
        return 'Visitors';
        break;
      case 'new_visitors':
        return 'New Visitors';
        break;
      case 'bounce_rate':
        return 'Bounce Rate';
        break;
      case 'pages_session':
        return 'Pages/Session';
        break;
      case 'avg_session_duration':
        return 'Avg. Session Duration';
        break;
      case 'leads_per':
        return 'Leads %';
        break;
      case 'leads_sharp':
        return 'Leads #';
        break;
      case 'tours_per':
        return 'Tours %';
        break;
      case 'tours_sharp':
        return 'Tours #';
        break;
      case 'leases_per':
        return 'Leases %';
        break;
      case 'leases_sharp':
        return 'Leases #';
        break;
    }
    return '';
  };

  return (
    <React.Fragment>
      <Row>
        <Col sm={12}>
          <SBTblWrapper>
            <SBTbl>
              <StyledTHead>
                <StyledTRow>
                  <SBTblHeaderItem>&nbsp;</SBTblHeaderItem>
                  <SBTblHeaderItem colSpan={3}>Acquisition</SBTblHeaderItem>
                  <SBTblHeaderItem colSpan={3}>Behaviors</SBTblHeaderItem>
                  <SBTblHeaderItem colSpan={6}>Conversions</SBTblHeaderItem>
                </StyledTRow>
                <StyledTRow>
                  <SBTblHeaderSub>&nbsp;</SBTblHeaderSub>
                  {!isEmpty(tblValues.acquisitions) && Object.keys(tblValues.acquisitions[0]).map(key => (
                    <SBTblHeaderSub>
                      <span>{getHeaderSubTitle(key)}</span>
                      <p>{tblValues.acquisitions[0][key]}</p>
                    </SBTblHeaderSub>
                  ))}
                  {!isEmpty(tblValues.behaviors) && Object.keys(tblValues.behaviors[0]).map(key => (
                    <SBTblHeaderSub>
                      <span>{getHeaderSubTitle(key)}</span>
                      <p>{tblValues.behaviors[0][key]}</p>
                    </SBTblHeaderSub>
                  ))}
                  {!isEmpty(tblValues.conversions) && Object.keys(tblValues.conversions[0]).map(key => (
                    <SBTblHeaderSub>
                      <span>{getHeaderSubTitle(key)}</span>
                      <p>{tblValues.conversions[0][key]}</p>
                    </SBTblHeaderSub>
                  ))}
                </StyledTRow>
                <StyledTRow>
                  <SBTblHeaderBody>Source/Medium</SBTblHeaderBody>
                  <SBTblHeaderBody>Sessions</SBTblHeaderBody>
                  <SBTblHeaderBody>Users</SBTblHeaderBody>
                  <SBTblHeaderBody>New Users</SBTblHeaderBody>
                  <SBTblHeaderBody>Bounce Rate</SBTblHeaderBody>
                  <SBTblHeaderBody>Pages/Session</SBTblHeaderBody>
                  <SBTblHeaderBody>Avg. Session Duration</SBTblHeaderBody>
                  <SBTblHeaderBody>Leads %</SBTblHeaderBody>
                  <SBTblHeaderBody>Leads #</SBTblHeaderBody>
                  <SBTblHeaderBody>Tours %</SBTblHeaderBody>
                  <SBTblHeaderBody>Tours #</SBTblHeaderBody>
                  <SBTblHeaderBody>Leases %</SBTblHeaderBody>
                  <SBTblHeaderBody>Leases #</SBTblHeaderBody>
                </StyledTRow>
              </StyledTHead>
              <StyledTBody>
                {tblValues.source_mediums.map((item, index) => (
                  <StyledTRow>
                    <SBTblBodyItem>{item}</SBTblBodyItem>
                    {!isEmpty(tblValues.acquisitions) && Object.keys(tblValues.acquisitions[index + 1]).map(key => (
                      <SBTblBodyItem>{tblValues.acquisitions[index + 1][key]}</SBTblBodyItem>
                    ))}
                    {!isEmpty(tblValues.behaviors) && Object.keys(tblValues.behaviors[index + 1]).map(key => (
                      <SBTblBodyItem>{tblValues.behaviors[index + 1][key]}</SBTblBodyItem>
                    ))}
                    {!isEmpty(tblValues.conversions) && Object.keys(tblValues.conversions[index + 1]).map(key => (
                      <SBTblBodyItem>{tblValues.conversions[index + 1][key]}</SBTblBodyItem>
                    ))}
                  </StyledTRow>
                ))}
              </StyledTBody>
            </SBTbl>
          </SBTblWrapper>
        </Col>
      </Row>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  sitesReports: state.report.sitesReports,
  currentProperty: state.property.property,
  isLoaded: state.report.isLoaded,
});

export default connect(mapStateToProps)(withRouter(SourceBehaviorReport));
