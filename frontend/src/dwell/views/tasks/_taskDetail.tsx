import React, { FC, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Col, Row, Tooltip } from 'reactstrap';
import moment from 'moment';
import TimeAgo from 'react-timeago';
import actions from 'dwell/actions/index';
import { fieldChoices } from 'dwell/constants';
import { CheckboxSkeleton, getPropertyId, LineSkeleton } from 'src/utils';
import { TOUR_TYPES } from 'dwell/constants/tour_types';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import { DetailResponse, ListResponse, SuccessResponse } from 'src/interfaces';
import { CheckBox } from 'site/components';
import {
  TaskFooter, TaskBody, TaskEditLinks, TaskNavLinks, TaskDue, TaskDueDate, TaskType, LeadDetails, TaskHeaders,
  TaskInfo, ShowUnits, LeadLink, OwnerName, AssignedOwner, TaskDot,
} from './styles';

const formatter = buildFormatter({
  prefixAgo: null,
  prefixFromNow: null,
  suffixAgo: 'ago',
  suffixFromNow: '',
  seconds: '%d seconds',
  minute: '1 minute',
  minutes: '%d minutes',
  hour: '1 hour',
  hours: '%d hours',
  day: '1 day',
  days: '%d days',
  week: '1 week',
  weeks: '%d weeks',
  month: '1 month',
  months: '%d months',
  year: '1 year',
  years: '%d years',
  wordSeparator: ' ',
  numbers: [],
});

interface TaskProps {
  id?: number,
  type: string,
  tour_date: Date,
  due_date: Date,
  status: string,
  owner: number,
  lead: number,
  showing_units: Array<UnitProps>
  description: string,
  lead_name: string,
  old_title: string,
  owner_name: string,
  became_completed?: boolean,
}

interface FloorPlansProps {
  id: number,
  plan: string,
}

interface UnitProps {
  id: number,
  floor_plan: number,
  unit: string,
}

interface TaskDetailProps extends RouteComponentProps{
  deleteTaskById: (id: number) => Promise<SuccessResponse>,
  task: TaskProps,
  onClose: (isUpdated: boolean) => null,
  updateTaskById: (id: number, task: TaskProps) => Promise<DetailResponse>,
  getLeadById: (leadId: number) => Promise<ListResponse>,
  isLeadLevel: boolean,
  floorPlans: Array<FloorPlansProps>,
  isShared: boolean,
  completed: boolean,
  onEdit: (task: TaskProps) => null,
  completeTask: (id: number) => Promise<DetailResponse>,
  isLoaded: boolean,
}

const TaskDetail: FC<TaskDetailProps> = (props) => {
  const { task } = props;
  const [editTooltipOpen, setEditTooltipOpen] = useState(false);
  const [deleteTooltipOpen, setDeleteTooltipOpen] = useState(false);

  const handleDelete = () => {
    const { deleteTaskById, updateTaskById, onClose, getLeadById, isLeadLevel } = props;
    setDeleteTooltipOpen(false);
    if (Object.keys(TOUR_TYPES).includes(task.type)) {
      const resultTask = { ...task, is_cancelled: true };
      updateTaskById(task.id, resultTask)
        .then(() => {
          if (isLeadLevel) {
            getLeadById(task.lead);
          }
          onClose(true);
        });
    } else {
      deleteTaskById(task.id)
        .then(() => {
          onClose(true);
        });
    }
  };

  const handleTaskComplete = () => {
    const { updateTaskById, onClose, completeTask, isLeadLevel, getLeadById } = props;
    const resultTask = { ...task, status: task.status !== 'COMPLETED' ? 'COMPLETED' : 'OPEN' };
    if (task.status !== 'COMPLETED') {
      completeTask(task.id).then(() => {
        if (isLeadLevel) {
          getLeadById(task.lead);
        }
      });
    } else {
      updateTaskById(task.id, resultTask)
        .then(() => {
          if (isLeadLevel) {
            getLeadById(task.lead);
          }
          onClose(true);
        });
    }
  };

  const clickEdit = () => {
    if (task.status === 'PENDING') return;
    const { onEdit } = props;
    onEdit(task);
  };

  // const testNotification = (id) => {
  //   const { testTaskNotification } = props;
  //   testTaskNotification({ id });
  // };

  const { floorPlans, isLeadLevel, isShared, isLoaded } = props;
  const {
    showing_units: showingUnits,
    type,
    description,
    due_date: dueDate,
    tour_date:
      tourDate,
    lead_name: leadName,
    owner_name: ownerName,
    lead,
    status,
    id,
    old_title: oldTitle,
    became_completed: becameCompleted,
  } = task;
  const { TASK_FILED_CHOICES: { type: typeChoices } } = fieldChoices;
  const siteId = getPropertyId();
  const showingDate = Object.keys(TOUR_TYPES).includes(type) ? tourDate : dueDate;
  const dateDiff = moment(showingDate).diff(moment(), 'days');
  const showOverdueStyle = dateDiff < 0;
  const isToday = moment(showingDate).isSame(moment(), 'day');

  const getDueDateColor = () => {
    if (status === 'COMPLETED') {
      return '#24ba7b';
    } else if (showOverdueStyle) {
      return '#f3505c';
    } else if (!isToday) {
      return '#ccced9';
    }
    return '';
  };

  return (
    <Row>
      <Col xs={12} >
        <TaskHeaders>
          {!isShared && isLoaded &&
            <CheckBox
              id={`complete-task-${id}`}
              checked={status === 'COMPLETED' || becameCompleted}
              onChange={handleTaskComplete}
              labelClassName="label-checkbox"
              disabled={status === 'PENDING'}
            />}
          {!isShared && !isLoaded && <CheckboxSkeleton />}
          <TaskInfo>
            {isLoaded ?
              <TaskType className="task-title" style={{ textDecoration: status === 'COMPLETED' || becameCompleted ? 'line-through' : 'none' }}>{typeChoices[type]}</TaskType> :
              <LineSkeleton width={100} height={12} />}
            {!becameCompleted && oldTitle && <div className="ml-2 gray task-old-title">(original: {oldTitle})</div>}
            {!becameCompleted && description && <TaskBody>{description}</TaskBody> }
            {!becameCompleted && showingUnits && showingUnits.length > 0 &&
            <ShowUnits>
              <span>Showing units: </span>
              {showingUnits.map((unitData, index) =>
                floorPlans.map(floorInfo => (unitData.floor_plan === floorInfo.id ? <span key={index}>{unitData.unit} ({floorInfo.plan}){index !== (showingUnits.length - 1) ? ',' : ''} </span> : '')))}
            </ShowUnits>}
            {!isLoaded && <LineSkeleton width={190} height={8} />}
            {!becameCompleted && !isLeadLevel &&
            <LeadDetails>{isLoaded ?
              <>Linked lead: <LeadLink to={`/${siteId}/leads/${lead}`} >{leadName}</LeadLink></> :
              <LineSkeleton width={150} height={8} />}
            </LeadDetails>}
            {!becameCompleted &&
            <AssignedOwner>{isLoaded ?
              <>Assigned to: <OwnerName>{ownerName}</OwnerName></> :
              <LineSkeleton width={150} height={8} />}
            </AssignedOwner>}
            <div>
              {isLoaded ? <>{status === 'PENDING' && 'Status: Pending'}</> : <LineSkeleton width={150} height={10} />}
            </div>
          </TaskInfo>
        </TaskHeaders>
        {!becameCompleted &&
        <TaskFooter>
          {!isLoaded ? <LineSkeleton width={80} height={10} /> :
            <TaskDueDate>
              <TaskDot style={{ backgroundColor: getDueDateColor() }} />
              <TaskDue>{status !== 'COMPLETED' ? 'Due:' : ''}</TaskDue>
              {showingDate ? ` ${moment(showingDate).format('MMM DD')} ` : <span> date to be set</span>}
              {isLeadLevel && showingDate &&
                <>
                  (<TimeAgo
                    className="created-date"
                    date={new Date(showingDate)}
                    live={false}
                    title={moment(showingDate).format('YYYY-MM-DD HH:mm')}
                    formatter={formatter}
                  />)
                </>}
            </TaskDueDate>}
          {isLoaded &&
          <TaskNavLinks>
            <TaskEditLinks id={`edit-task-${id}`} onClick={clickEdit} disabled={status === 'PENDING'}><i className="ri-pencil-fill" /></TaskEditLinks>
            <Tooltip trigger="hover" placement="top" isOpen={editTooltipOpen} target={`edit-task-${id}`} toggle={() => setEditTooltipOpen(!editTooltipOpen)}>
              Edit Task
            </Tooltip>
            <TaskEditLinks id={`delete-task-${id}`} onClick={handleDelete}><i className="ri-delete-bin-5-line" /></TaskEditLinks>
            <Tooltip trigger="hover" placement="top" isOpen={deleteTooltipOpen} target={`delete-task-${id}`} toggle={() => setDeleteTooltipOpen(!deleteTooltipOpen)}>
              Delete Task
            </Tooltip>
          </TaskNavLinks>}
        </TaskFooter>}
      </Col>
    </Row>
  );
};

const mapStateToProps = state => ({
  floorPlans: state.property.property.floor_plans,
  isLoaded: state.task.isLoaded,
});

export default connect(
  mapStateToProps,
  {
    ...actions.task,
    ...actions.lead,
  },
)(withRouter(TaskDetail));
