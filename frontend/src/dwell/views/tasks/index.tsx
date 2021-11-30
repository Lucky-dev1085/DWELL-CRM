import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ButtonDropdown } from 'reactstrap';
import { Helmet } from 'react-helmet';
import actions from 'dwell/actions/index';
import moment from 'moment';
import { sortBy } from 'lodash';
import { TaskCreationModal } from 'dwell/components/index';
import 'src/scss/pages/_task_list.scss';
import { defaultTasksData } from 'dwell/views/tasks/utils';
import { TOUR_TYPES } from 'dwell/constants/tour_types';
import { ListResponse, TaskProps, UserProps } from 'src/interfaces';
import { ContainerFluid, ContentTitle, DropdownLink, ContentHeader, SelectDropDownItem, SelectDropdownMenu } from 'styles/common';
import TaskDetail from './_taskDetail';
import { TaskGroup, TaskLabel, TaskLabelSpan, TaskItem, TaskGroups, TaskList, ShowMoreButton, NewTaskButton } from './styles';

interface LeadNamesProps {
  id?: number,
  external_id: string,
}

interface IndexProps extends RouteComponentProps {
  getTasks?: ({ show_all: boolean }) => Promise<ListResponse>,
  getLeadNames?: () => Promise<ListResponse>,
  tasks: Array<TaskProps>,
  leadNames: Array<LeadNamesProps>,
  currentUser: UserProps,
  isLoaded: boolean,
}

const Index: FC<IndexProps> = ({ getTasks, getLeadNames, tasks, leadNames, currentUser, isLoaded }) => {
  const initShowAllTasksByCategoryList = [false, false, false, false];

  const [isShowingModal, setIsShowingModal] = useState(false);
  const [currentTask, setCurrentTask] = useState({});
  const [ownerFilter, setOwnerFilter] = useState('My Tasks');
  const [isShowingStatusDropdown, setIsShowingStatusDropdown] = useState(false);
  const [showAllTasksByCategory, setShowAllTasksByCategory] = useState(initShowAllTasksByCategoryList);

  useEffect(() => {
    getTasks({ show_all: true });
    getLeadNames();
  }, []);

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsShowingModal(true);
  };

  const handleNewTask = () => {
    setCurrentTask({});
    setIsShowingModal(true);
  };

  const handleClose = () => {
    setIsShowingModal(false);
  };

  let filteredTasks = tasks.map(task => ({
    ...task,
    date: Object.keys(TOUR_TYPES).includes(task.type) ? task.tour_date : task.due_date,
  }));
  filteredTasks = sortBy(filteredTasks.filter(task => !task.is_cancelled), ['date']);

  let completedTask = filteredTasks.filter(task => task.status === 'COMPLETED')
    .sort((a, b) => (new Date(b.updated).getTime() - new Date(a.updated).getTime()));

  filteredTasks = filteredTasks.filter(task => task.status !== 'COMPLETED');
  if (ownerFilter === 'My Tasks') {
    filteredTasks = filteredTasks.filter(task => task.owner === currentUser.id);
    completedTask = completedTask.filter(task => task.owner === currentUser.id);
  }
  const upcomingTasks = filteredTasks.filter(task => moment(task.date).isAfter(moment().utc().toDate(), 'day'));
  const overdueTasks = filteredTasks.filter(task => moment(task.date).isBefore(moment().utc().toDate(), 'day'));
  const todayTasks = filteredTasks.filter(task => moment(task.date).isSame(moment().utc().toDate(), 'day'));

  const getCategoryIndex = (taskCategory) => {
    switch (taskCategory) {
      case 'Upcoming':
        return 0;
      case 'Today':
        return 1;
      case 'Overdue':
        return 2;
      case 'Completed':
        return 3;
    }
    return null;
  };

  const handleSetOwnerFilter = (value) => {
    setShowAllTasksByCategory(initShowAllTasksByCategoryList);
    setOwnerFilter(value);
  };

  const handleShowTaskListCategory = (taskCategory) => {
    const updateShowAllTasksByCategory = [...showAllTasksByCategory];
    updateShowAllTasksByCategory[getCategoryIndex(taskCategory)] = true;
    setShowAllTasksByCategory(updateShowAllTasksByCategory);
  };

  const showTasksGroup = (filteredTasksArray, taskLabel) => {
    let filteredTasksList = [];
    const tasksList = isLoaded ? filteredTasksArray.map((task, index) => (
      <TaskItem key={index}>
        <TaskDetail
          task={task}
          onClose={handleClose}
          onEdit={handleEditTask}
        />
      </TaskItem>
    )) : defaultTasksData();
    if (filteredTasksArray.length > 4 && !showAllTasksByCategory[getCategoryIndex(taskLabel)]) {
      filteredTasksList = tasksList.slice(0, 4);
      filteredTasksList.push(<ShowMoreButton key={`show${taskLabel}`} className="btn btn-white btn-more" onClick={() => handleShowTaskListCategory(taskLabel)}>Show more ({filteredTasksArray.length - 4}) </ShowMoreButton>);
    } else {
      filteredTasksList = tasksList;
    }
    return (
      <TaskGroup>
        <TaskList>
          <TaskLabel>
            {taskLabel}
            {isLoaded && <TaskLabelSpan> {filteredTasksArray.length}</TaskLabelSpan>}
          </TaskLabel>
          {filteredTasksList}
        </TaskList>
      </TaskGroup>
    );
  };

  const tasksGroup = (
    <React.Fragment>
      <TaskGroups>
        {showTasksGroup(upcomingTasks, 'Upcoming')}
        {showTasksGroup(todayTasks, 'Today')}
        {showTasksGroup(overdueTasks, 'Overdue')}
        {showTasksGroup(completedTask, 'Completed')}
      </TaskGroups>
    </React.Fragment>
  );

  const content = (
    <React.Fragment>
      {tasksGroup}
      <TaskCreationModal show={isShowingModal} task={currentTask} leadNames={leadNames} handleClose={handleClose} />
    </React.Fragment>
  );
  return (
    <ContainerFluid fluid>
      <Helmet>
        <title>DWELL | Tasks</title>
      </Helmet>
      <ContentHeader>
        <div className="mr-auto">
          <ContentTitle>
            Tasks
          </ContentTitle>
        </div>
        <ButtonDropdown className="mr-2 float-right" isOpen={isShowingStatusDropdown} toggle={() => setIsShowingStatusDropdown(!isShowingStatusDropdown)}>
          <DropdownLink tag="a">
            <i className="ri-list-check-2" /> {ownerFilter}
          </DropdownLink>
          <SelectDropdownMenu right>
            <SelectDropDownItem onClick={() => handleSetOwnerFilter('My Tasks')}>
              My Tasks
            </SelectDropDownItem>
            <SelectDropDownItem onClick={() => handleSetOwnerFilter('All Tasks')}>
              All Tasks
            </SelectDropDownItem>
          </SelectDropdownMenu>
        </ButtonDropdown>
        <NewTaskButton className="btn btn-primary" onClick={handleNewTask}>
          <i className="ri-add-circle-fill mr-2" /> New task
        </NewTaskButton>
      </ContentHeader>
      {content}
    </ContainerFluid>
  );
};

const mapStateToProps = state => ({
  leadNames: state.lead.leadNames,
  currentUser: state.user.currentUser,
  tasks: state.task.tasks,
  isLoaded: state.task.isLoaded,
});

export default connect(
  mapStateToProps,
  {
    ...actions.task,
    ...actions.lead,
    ...actions.user,
    ...actions.property,
  },
)(withRouter(Index));
