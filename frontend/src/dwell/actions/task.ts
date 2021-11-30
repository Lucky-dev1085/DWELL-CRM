import { actions, paths } from 'dwell/constants';
import { build } from 'dwell/constants/paths';
import { ActionType, AvailableTimesParams, ManageRequestProps, TaskProps } from 'src/interfaces';

export default {
  getTasks: (showAll: boolean): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_TASKS_REQUEST,
        actions.GET_TASKS_SUCCESS,
        actions.GET_TASKS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.TASKS, { params: showAll }),
    },
  }),
  getLeadTasks: (leadId: number, params?: ManageRequestProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_LEAD_LEVEL_TASKS_REQUEST,
        actions.GET_LEAD_LEVEL_TASKS_SUCCESS,
        actions.GET_LEAD_LEVEL_TASKS_FAILURE,
      ],
      promise: client => client.get(build(paths.api.v1.LEAD_LEVEL_TASKS, leadId), { params }),
    },
  }),
  deleteTaskById: (id: number, leadId: number = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_TASK_REQUEST,
        actions.DELETE_TASK_SUCCESS,
        actions.DELETE_TASK_FAILURE,
      ],
      promise: client => client.delete(leadId ? build(paths.api.v1.LEAD_LEVEL_TASK_DETAILS, leadId, id) : build(paths.api.v1.TASK_DETAILS, id)),
    },
  }),
  updateTaskById: (id: number, params: TaskProps, leadId: number = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_TASK_REQUEST,
        actions.UPDATE_TASK_SUCCESS,
        actions.UPDATE_TASK_FAILURE,
      ],
      promise: client => client.put(leadId ? build(paths.api.v1.LEAD_LEVEL_TASK_DETAILS, leadId, id) : build(paths.api.v1.TASK_DETAILS, id), params),
    },
  }),
  completeTask: (id: number, leadId: number = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.COMPLETE_TASK_REQUEST,
        actions.COMPLETE_TASK_SUCCESS,
        actions.COMPLETE_TASK_FAILURE,
      ],
      promise: client => client.patch(leadId ? build(paths.api.v1.LEAD_LEVEL_TASK_DETAILS, leadId, id) : build(paths.api.v1.TASK_DETAILS, id), { status: 'COMPLETED' }),
    },
  }),
  createTask: (data: TaskProps, leadId: number = null): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_TASK_REQUEST,
        actions.CREATE_TASK_SUCCESS,
        actions.CREATE_TASK_FAILURE,
      ],
      promise: client => client.post(leadId ? build(paths.api.v1.LEAD_LEVEL_TASKS, leadId) : paths.api.v1.TASKS, data),
    },
  }),

  testTaskNotification: (param: TaskProps): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.TEST_TASK_NOTIFICATIONS_REQUEST,
        actions.TEST_TASK_NOTIFICATIONS_SUCCESS,
        actions.TEST_TASK_NOTIFICATIONS_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.TEST_TASK_NOTIFICATIONS, { params: param }),
    },
  }),
  getAvailableTourTime: (param?: AvailableTimesParams): ActionType => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_AVAILABLE_TOUR_TIMES_REQUEST,
        actions.GET_AVAILABLE_TOUR_TIMES_SUCCESS,
        actions.GET_AVAILABLE_TOUR_TIMES_FAILURE,
      ],
      promise: client => client.get(paths.api.v1.TOUR_AVAILABLE_TIME, { params: { ...param,
        tz_difference: new Date().getTimezoneOffset() } }),
    },
  }),
};
