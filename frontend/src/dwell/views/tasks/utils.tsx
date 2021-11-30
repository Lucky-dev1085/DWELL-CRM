import React from 'react';
import TaskDetail from 'dwell/views/tasks/_taskDetail';
import { TaskItem } from 'dwell/views/tasks/styles';

export const defaultTasksData = (): JSX.Element[] => new Array(5).fill({
  task: {},
  onClose: null,
  onEdit: null,
}).map((props, index) => <TaskItem key={index}><TaskDetail {...props} /></TaskItem>);
