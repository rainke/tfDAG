import { get, post, del } from './utils/ajax';

export const delTaskSource = (id: string) =>
  del(`/api/experimental/tasksources/${id}`);

export const getDags = () =>
  get('/api/experimental/dags_raw_str').then(res =>
    res.msg.map((item: string) => JSON.parse(item))
  );

export const getDagsById = (dag_id: string) =>
  get(`/api/experimental/dags/${dag_id}`);
