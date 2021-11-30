import { actions } from 'dwell/constants';
import { TaskProps, TaskState, TaskActionTypes } from 'src/interfaces';
import { isLeadPage, isLeadsObject } from './utils';

const initialState: TaskState = {
  isSubmitting: false,
  errorMessage: null,
  isLoaded: true,
  tasks: [],
  leadTasks: [],
  task: {} as TaskProps,
  count: 0,
  availableDateTimes: [],
};

const actionMap = {
  [actions.GET_TASKS_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_TASKS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isLoaded: true, tasks: data.results }),
  [actions.GET_TASKS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: false }),

  [actions.GET_LEAD_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, leadTasks: data.tasks }),

  [actions.GET_LEAD_LEVEL_TASKS_REQUEST]: state => ({ ...state, isLoaded: false }),
  [actions.GET_LEAD_LEVEL_TASKS_SUCCESS]: (state, { result: { data } }) => ({ ...state, isLoaded: true, leadTasks: data.results }),
  [actions.GET_LEAD_LEVEL_TASKS_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isLoaded: true }),

  [actions.GET_TASK_BY_ID_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.GET_TASK_BY_ID_SUCCESS]: (state, { result: { data } }) => ({ ...state, isSubmitting: false, task: data }),
  [actions.GET_TASK_BY_ID_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.UPDATE_TASK_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_TASK_SUCCESS]: (state, { result: { data } }) => {
    const updateLeadTasksList = state.tasks.map(task => (task.id === data.id ? data : task));
    let updatedLeadTasksList = [...state.leadTasks];
    if (state.leadTasks.map(t => t.lead).includes(data.lead)) {
      updatedLeadTasksList = updatedLeadTasksList.map(task => (task.id === data.id ? data : task));
    }
    return { ...state, isSubmitting: false, tasks: updateLeadTasksList, leadTasks: updatedLeadTasksList };
  },
  [actions.UPDATE_TASK_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.COMPLETE_TASK_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.COMPLETE_TASK_SUCCESS]: (state, { result: { data } }) => {
    const updateLeadTasksList = state.tasks.map((task) => {
      if (task.id === data.id) {
        const resultTask = { ...task };
        resultTask.became_completed = true;
        return resultTask;
      }
      return task;
    });

    let updatedLeadTasksList = [...state.leadTasks];
    if (state.leadTasks.map(t => t.lead).includes(data.lead)) {
      updatedLeadTasksList = updatedLeadTasksList.map(task => (task.id === data.id ? data : task));
    }
    return { ...state, isSubmitting: false, tasks: updateLeadTasksList, leadTasks: updatedLeadTasksList };
  },
  [actions.COMPLETE_TASK_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_LEAD_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_LEAD_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.CREATE_LEAD_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.CREATE_TASK_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_TASK_SUCCESS]: (state, { result: { data } }) => {
    const updateLeadTasksList = [...state.tasks];
    updateLeadTasksList.push(data);
    const updatedLeadTasksList = [...state.leadTasks];
    if (state.leadTasks.map(t => t.lead).includes(data.lead)) {
      updatedLeadTasksList.push(data);
    }
    return { ...state, isSubmitting: false, tasks: updateLeadTasksList, leadTasks: updatedLeadTasksList };
  },
  [actions.CREATE_TASK_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.DELETE_TASK_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.DELETE_TASK_SUCCESS]: (state, { result: { data } }) => {
    const updateLeadTasksList = state.tasks.filter(task => (task.id !== data.id));
    return { ...state, isSubmitting: false, tasks: updateLeadTasksList };
  },
  [actions.UPDATE_TASK_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status, isSubmitting: false }),

  [actions.PUSHER_CREATE_RECORD]: (state, { row }) => {
    let newLeadTasks = state.leadTasks;
    if (isLeadPage() && isLeadsObject(row.lead)) {
      newLeadTasks = [row].concat(state.leadTasks.filter(t => t.id !== row.id));
    }
    const newTasks = [row].concat(state.tasks.filter(t => t.id !== row.id));
    return { ...state, tasks: newTasks, leadTasks: newLeadTasks };
  },
  [actions.PUSHER_UPDATE_RECORD]: (state, { row }) => {
    let newLeadTasks = state.leadTasks;
    if (isLeadPage() && isLeadsObject(row.lead)) {
      newLeadTasks = [row].concat(state.leadTasks.filter(t => t.id !== row.id));
    }

    let newTasks = state.tasks;
    const oldTask = state.tasks.find(t => t.id === row.id);
    if (oldTask && oldTask.status !== 'COMPLETED' && row.status === 'COMPLETED') {
      newTasks = newTasks.map((t) => {
        if (t.id === row.id) {
          const resultTask = { ...t };
          resultTask.became_completed = true;
          return resultTask;
        }
        return t;
      });
    } else {
      newTasks = [row].concat(state.tasks.filter(t => t.id !== row.id));
    }
    return { ...state, tasks: newTasks, leadTasks: newLeadTasks, task: state.task.id === row.id ? row : state.task };
  },
  [actions.PUSHER_DELETE_RECORD]: (state, { row }) => ({ ...state,
    tasks: state.tasks.filter(t => t.id.toString() !== row.id.toString()),
    leadTasks: state.leadTasks.filter(t => t.id.toString() !== row.id.toString()),
  }),

  [actions.GET_AVAILABLE_TOUR_TIMES_REQUEST]: state => ({ ...state }),
  [actions.GET_AVAILABLE_TOUR_TIMES_SUCCESS]: (state, { result: { data } }) => ({ ...state, availableDateTimes: data.times || [] }),
  [actions.GET_AVAILABLE_TOUR_TIMES_FAILURE]: (state, { error: { response: { status } } }) => ({ ...state, errorMessage: status }),
};

export default (state = initialState, action: TaskActionTypes): TaskState => {
  if (actionMap[action.type]) {
    if (action.type.includes('PUSHER_') && action.pusherModel !== 'task') {
      return state;
    }
    return actionMap[action.type](state, action);
  }

  return state;
};
