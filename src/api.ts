import { get, post, del } from './utils/ajax';

export const delTaskSource = (id: string) =>
  del(`/api/experimental/tasksources/${id}`);

export const getDags = () => get('/api/experimental/dags');

export const getDagsById = (dag_id: string) =>
  get(`/api/experimental/dags/${dag_id}`);
