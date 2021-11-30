import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import taskAction from 'dwell/actions/task';
import createHistory from 'history/createBrowserHistory';
import { sortBy } from 'lodash';
import { TaskCreationModal } from 'dwell/components';
import 'src/scss/pages/_task_list.scss';
import TaskDetail from 'dwell/views/tasks/_taskDetail';
import { isEmpty } from 'codemirror/src/util/misc';
import { TOUR_TYPES } from 'dwell/constants/tour_types';
import {
  CardWidget,
  CardWidgetBody, CardWidgetButton, CardWidgetFooter,
  CardWidgetHeader, CardWidgetPrimaryButton,
  CardWidgetTitle, TaskWrapper,
} from 'dwell/views/lead/overview/styles';

interface TasksListProps extends RouteComponentProps {
  isShared: boolean,
}

interface StateProps {
  newTask: boolean,
}

const TasksList: FC<TasksListProps> = ({ location: { pathname, state }, isShared }) => {
  const [isShowingModal, setIsShowingModal] = useState(false);
  const [currentTask, setCurrentTask] = useState({});
  const [showCompleted, setsShowCompleted] = useState(false);
  const [showAllTask, setShowAllTask] = useState(false);

  const dispatch = useDispatch();
  const tasks = useSelector(states => states.task.leadTasks);
  const isLoaded = useSelector(states => states.task.isLoaded);
  const currentProperty = useSelector(states => states.property.property);
  const lead = useSelector(states => states.lead.lead);
  const { getLeadTasks } = taskAction;

  const { id, first_name: firstName, last_name: lastName } = lead;

  useEffect(() => {
    if (state) {
      const { newTask } = state as StateProps;
      setIsShowingModal(newTask);
      const history = createHistory();
      history.replace({ ...history.location, state: {} });
    }
  }, []);

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsShowingModal(true);
  };

  const handleNewTask = () => {
    setCurrentTask({});
    setIsShowingModal(true);
  };

  const handleClose = (isUpdated) => {
    if (isUpdated) {
      dispatch(getLeadTasks(Number(pathname.split('/').pop())));
    }
    setIsShowingModal(false);
  };

  let filteredTasks = tasks.map(task => ({
    ...task,
    date: Object.keys(TOUR_TYPES).includes(task.type) ? task.tour_date : task.due_date,
  }));
  filteredTasks = sortBy(filteredTasks, ['date']);

  let content = null;
  const resultTasks = lead && isLoaded ? filteredTasks : new Array(2).fill({ status: 'OPEN' });
  const completedTasks = resultTasks.filter(task => task.status === 'COMPLETED');
  const openTasks = resultTasks.filter(task => task.status !== 'COMPLETED');
  const filteredOpenTasks = !isEmpty(openTasks) && (showAllTask ? openTasks : [openTasks[0]]);

  if (isLoaded && !isEmpty(openTasks) && showCompleted && isEmpty(completedTasks)) {
    setShowAllTask(false);
    setsShowCompleted(false);
  }

  if (!isEmpty(currentProperty)) {
    content = !isEmpty(resultTasks) ? (
      <React.Fragment>
        {!showCompleted && (!isEmpty(filteredOpenTasks) ?
          <React.Fragment>
            {filteredOpenTasks.map((task, index) => (
              <TaskWrapper key={index}>
                <TaskDetail task={task} onClose={handleClose} onEdit={handleEditTask} isLeadLevel isShared={isShared} />
              </TaskWrapper>))}
          </React.Fragment> : (
            <div className="no-upcoming-text">
                There are no tasks coming up for this lead.
            </div>
          ))}
        {showCompleted && !isEmpty(completedTasks) &&
          <React.Fragment>
            {completedTasks.map((task, index) => (
              <TaskWrapper key={index}>
                <TaskDetail task={task} onClose={handleClose} onEdit={handleEditTask} isLeadLevel isShared={isShared} />
              </TaskWrapper>))}
          </React.Fragment>}
      </React.Fragment>
    ) : (<div className="no-upcoming-text">There are no tasks coming up for this lead.</div>);
  }
  return (
    <CardWidget size="sm">
      <CardWidgetHeader>
        <CardWidgetTitle>Upcoming Tasks</CardWidgetTitle>
      </CardWidgetHeader>
      <CardWidgetBody>
        {content}
        <TaskCreationModal show={isShowingModal} task={currentTask} currentLead={{ id, name: `${firstName} ${lastName}` }} handleClose={handleClose} isLeadLevel />
      </CardWidgetBody>
      {!isShared && isLoaded && lead && (
        <CardWidgetFooter>
          {openTasks.length > 1 &&
            <CardWidgetPrimaryButton color="primary" inverse onClick={() => { setShowAllTask(!showAllTask); setsShowCompleted(false); }}>
              {showAllTask ? 'Hide Tasks' : 'Show All Tasks '} ({openTasks.length})
            </CardWidgetPrimaryButton>}
          <CardWidgetPrimaryButton className="mt-10" color="primary" onClick={handleNewTask}>Add New Task</CardWidgetPrimaryButton>
          {!isEmpty(completedTasks) &&
          <CardWidgetButton className="mt-10" onClick={() => { setShowAllTask(false); setsShowCompleted(!showCompleted); }}>
            {showCompleted ? 'Hide Completed Tasks' : 'Show Completed Tasks'}
          </CardWidgetButton>}
        </CardWidgetFooter>)}
    </CardWidget>
  );
};

export default withRouter(TasksList);
