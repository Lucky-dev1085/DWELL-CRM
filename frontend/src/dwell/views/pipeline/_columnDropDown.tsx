import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Dropdown } from 'reactstrap';
import cn from 'classnames';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { isEmpty } from 'lodash';
import actions from 'dwell/actions';
import { columnsNames } from 'dwell/constants';
import { ColumnProps } from 'src/interfaces';
import 'src/scss/pages/_lead_creation.scss';
import 'src/scss/pages/_columns_settings.scss';
import { ColumnsSettingsIcon, ColumnsSettingDropdownMenu, ColumnsSettingsDropdownItem, ColumnsSettingDropdownMenuLabel } from './styles';

const Column = ({ column, index, changeColumn }) => (
  <Draggable key={column.name} draggableId={column.name} index={index}>
    {(provided, snapshot) => (
      <li
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{ ...provided.draggableProps.style }}
        className={` draggable-column ${snapshot.isDragging ? 'is-dragging' : ''}`}
      >
        <ColumnsSettingsDropdownItem
          className={cn({ active: column.is_visible })}
          toggle={false}
          tag="a"
          onClick={() => changeColumn(column.name, !column.is_visible)}
        >
          {columnsNames.COLUMNS_NAMES[column.name].name}
        </ColumnsSettingsDropdownItem>
      </li>)}
  </Draggable>
);

const defaultColumns = [
  { name: 'name', is_visible: true, position: 0 },
  { name: 'stage', is_visible: true, position: 1 },
  { name: 'owner', is_visible: true, position: 2 },
  { name: 'acquisition_date', is_visible: true, position: 3 },
  { name: 'move_in_date', is_visible: false, position: 4 },
  { name: 'days_to_move_in', is_visible: false, position: 5 },
  { name: 'next_task', is_visible: true, position: 6 },
  { name: 'next_task_date', is_visible: true, position: 7 },
  { name: 'source', is_visible: true, position: 8 },
  { name: 'floor_plan', is_visible: true, position: 9 },
  { name: 'last_followup_date', is_visible: true, position: 10 },
  { name: 'last_activity_date', is_visible: true, position: 11 },
  { name: 'created', is_visible: false, position: 12 },
];

interface LeadsTableProps extends RouteComponentProps {
  columns: ColumnProps[],
  createColumnsSettings: (columns: { columns: ColumnProps[] }) => null,
  updateColumnsSettings: (columns: { columns: ColumnProps[] }) => null,
}

const ColumnsSettingsDropDown: FC<LeadsTableProps> = ({ columns, createColumnsSettings, updateColumnsSettings }) => {
  const [leadsColumns, setLeadsColumns] = useState(defaultColumns);
  const [shouldShowColumnsSettingsModal, setShouldShowColumnsSettingsModal] = useState(false);

  const handleClose = () => {
    setShouldShowColumnsSettingsModal(!shouldShowColumnsSettingsModal);
  };

  useEffect(() => {
    if (!isEmpty(columns)) {
      setLeadsColumns(columns.sort((a, b) => (a.position - b.position)));
    }
  }, [columns]);

  const handleSave = (newColumns) => {
    if (!isEmpty(columns)) {
      updateColumnsSettings({ columns: newColumns });
    } else {
      createColumnsSettings({ columns: newColumns });
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    let resultColumns = leadsColumns;
    const [removed] = resultColumns.splice(result.source.index, 1);
    resultColumns.splice(result.destination.index, 0, removed);
    resultColumns = resultColumns.map((column, index) => ({ ...column, position: index }));
    setLeadsColumns(resultColumns);
    handleSave(resultColumns);
  };

  const changeColumn = (id, checked) => {
    const newColumns = leadsColumns;
    newColumns[newColumns.findIndex(column => column.name === id)].is_visible = checked;
    setLeadsColumns(newColumns);
    handleSave(newColumns);
  };

  return (
    <Dropdown
      isOpen={shouldShowColumnsSettingsModal}
      toggle={() => handleClose()}
      className="columns-settings-modal"
    >
      <ColumnsSettingsIcon className="ri-list-settings-line" tag="a" />
      <ColumnsSettingDropdownMenu>
        <ColumnsSettingDropdownMenuLabel>SHOW COLUMNS</ColumnsSettingDropdownMenuLabel>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {provided => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="p-0">
                {leadsColumns.map((column, index) => (
                  <Column changeColumn={changeColumn} index={index} key={column.name} column={column} />
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </ColumnsSettingDropdownMenu>
    </Dropdown>
  );
};

const mapStateToProps = state => ({
  columns: state.columnsSettings.columns,
});

export default connect(
  mapStateToProps,
  {
    ...actions.columnsSettings,
  },
)(withRouter(ColumnsSettingsDropDown));
