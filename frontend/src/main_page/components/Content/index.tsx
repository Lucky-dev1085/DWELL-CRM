import React from 'react';
import { Container, Row } from 'reactstrap';
import DemoForm from 'main_page/components/Forms';
import { CustomCol } from 'main_page/components/styles';
import { ContentWrapper, DescriptionWrapper, DescriptionText, President, Quote, Title, CompanyLink, PresidentIcon, UtteranceWrapper, QuoteIcon, Divider, AvatarWrapper } from './styles';

const Content = (): JSX.Element => (
  <ContentWrapper>
    <Container>
      <Row>
        <DescriptionWrapper xs={12} lg={7} xl={8}>
          <Title>
            Superlative lead
            <br />
            management software
          </Title>
          <UtteranceWrapper>
            <AvatarWrapper>
              <PresidentIcon />
            </AvatarWrapper>
            <DescriptionText>
              <QuoteIcon className="ri-double-quotes-l" />
              <span>
                We became ILS independent with Dwell and haven’t looked back. Last year we saved over two million dollars in marketing spend.
                Per dollar, we outperform in-market and nationwide competitors by miles on marketing and leasing efficiency thanks to Dwell.
              </span>
              <Divider />
              <Quote> <President>John Carlson</President>, President at
                <CompanyLink href="https://www.mark-taylor.com/" target="_blank" tabindex="-1">Mark Taylor Residential</CompanyLink>
              </Quote>
            </DescriptionText>
          </UtteranceWrapper>
        </DescriptionWrapper>
        <CustomCol xs={12} lg={5} xl={4}>
          <DemoForm />
        </CustomCol>
      </Row>
    </Container>
  </ContentWrapper>
);

export default Content;
