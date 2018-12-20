import { Operator, OperatorDataParams } from '../components/relation';
import {forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, ForceLink} from 'd3-force';

export interface Dag {
  operators: {
    [task_id: string]: {
      task_id: string;
      params: OperatorDataParams;
      operator: string;
      source_id: string;
    };
  };
  dag_args: {
    dag_id: string;
    default_args: {
      owner: string;
    };
    start_date: string;
    schedule_interval: string;
  };
  dependencies: string[];
}

const computLocation = (nodes: any[], edges: any[]) => {
  return new Promise<any[]>(resolve => {
    const force = forceSimulation()
      .force('link', forceLink())
      .force('change', forceManyBody())
      .force('center', forceCenter(200, 200))
      .force('collide', forceCollide(100));

    force.nodes(nodes).on('end', function() {
      resolve(nodes);
    });
    (force.force('link') as ForceLink<any, any>).links(edges).distance(100);
  });
};

const convertDag = async (dag: Dag) => {
  const ops: Operator[] = [];
  for (const [key, operator] of Object.entries(dag.operators)) {
    const op = new Operator();
    if (!operator.source_id) {
      operator.task_id = key;
      operator.source_id = key;
    }
    op.setData(operator);
    ops.push(op);
  }
  const edges: any[] = [];
  dag.dependencies.forEach(item => {
    const re = /^(.+)\.set_downstream\((.+)\)$/;
    const match = item.match(re);
    if (match) {
      const [_, taskIdPrev, taskIdNext] = match;
      const prev = ops.findIndex(op => op.task_id === taskIdPrev);
      const next = ops.findIndex(op => op.task_id === taskIdNext);
      ops[prev].next.push(ops[next]);
      edges.push({
        source: prev,
        target: next,
        value: 1
      });
    }
  });
  const nodes = await computLocation(ops.map(op => ({task_id: op.task_id})), edges);
  ops.map((op, index) => {
    op.x = nodes[index].x;
    op.y = nodes[index].y;
  });
  return ops;
};

export default convertDag;
