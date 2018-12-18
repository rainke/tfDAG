import {get, post, del} from './utils/ajax';

export const delTaskSource = (id: string) => del(` /api/experimental/taskwources/${id}`);
