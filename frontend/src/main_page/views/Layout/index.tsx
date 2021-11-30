import React from 'react';
import Content from 'main_page/components/Content';
import 'src/scss/style.scss';
import Header from './Header';
import { Container, Card, CopyRight } from './styles';

const DemoLayout = (): JSX.Element => (
  <Container>
    <Card>
      <Header />
      <Content />
      <CopyRight>© 2021 Lift Lytics LLC. All Rights Reserved.</CopyRight>
    </Card>
  </Container>
);

export default DemoLayout;
