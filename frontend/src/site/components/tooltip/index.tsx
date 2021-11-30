import React, { useState, FC } from 'react';
import { connect } from 'react-redux';
import { UncontrolledTooltip } from 'reactstrap';
import styled from 'styled-components';
import { LOGGED_ACCOUNT, roleTypes } from 'site/constants';
import TooltipModal from '../modal/tooltip_modal';

const InfoTooltip = styled.i`
  line-height: .5;
  color: ${props => props.theme.colors.colortx03};
  font-size: 16px;
  transition: ease all 0.25s;
  cursor: default;
  &:hover {
    color: inherit;
    cursor: pointer;
  }
`;

const InfoWrapper = styled.div`
  margin-bottom: -8px;
`;

interface TooltipProps {
  section: string,
  selector: string,
  isTooltipItemsLoaded: boolean,
  tooltipItems: { section?: string, elements?: { selector: string, value: string }[] }[],
}

const Tooltip: FC<TooltipProps> = ({ section, selector, tooltipItems, isTooltipItemsLoaded }) => {
  const [showModal, toggleModal] = useState(false);

  const openModal = () => {
    const loggedAccount = JSON.parse(localStorage.getItem(LOGGED_ACCOUNT)) || {};
    const isLLAdmin = loggedAccount.role === roleTypes.LIFT_LYTICS_ADMIN;

    if (!isLLAdmin) return;

    toggleModal(true);
  };

  const loggedAccount = JSON.parse(localStorage.getItem(LOGGED_ACCOUNT)) || {};

  let foundTooltip = false;
  let title = 'Not made yet ...';
  const targetId = `tooltip-${selector.replace(/\./g, '-')}`;
  if (!isTooltipItemsLoaded) {
    // title = 'Loading ...'; TODO this
  } else {
    const tooltipElements = tooltipItems.find(item => item.section === section);

    if (tooltipElements && tooltipElements.elements) {
      const tooltip = tooltipElements.elements.find(item => item.selector === selector);

      if (tooltip) {
        title = tooltip.value;
        foundTooltip = true;
      }
    }
  }

  return (
    <React.Fragment>
      <InfoWrapper><InfoTooltip id={targetId} className="ri-information-line" onClick={openModal} /></InfoWrapper>
      <UncontrolledTooltip placement="top" target={targetId}>
        {title}
      </UncontrolledTooltip>
      {loggedAccount.role === roleTypes.LIFT_LYTICS_ADMIN && (
        <TooltipModal
          title="Edit Tooltip"
          section={section}
          selector={selector}
          value={foundTooltip ? title : ''}
          show={showModal}
          onClose={() => toggleModal(false)}
        />
      )}
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  isTooltipItemsLoaded: state.tooltips.isTooltipItemsLoaded,
  tooltipItems: state.tooltips.tooltipItems,
});

export default connect(mapStateToProps)(Tooltip);
