import { Operator, OperatorDataParams } from '../components/relation';
// import {forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, ForceLink} from 'd3-force';
import dagreD3 from 'dagre-d3';

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
    // const force = forceSimulation()
    //   .force('link', forceLink())
    //   .force('change', forceManyBody())
    //   .force('center', forceCenter(200, 200))
    //   .force('collide', forceCollide(100));

    // force.nodes(nodes).on('end', function() {
    //   resolve(nodes);
    // });
    // (force.force('link') as ForceLink<any, any>).links(edges).distance(100);
    const g = new dagreD3.graphlib.Graph()
    .setGraph({
        rankdir: 'LR'
    })
    .setDefaultEdgeLabel(function() { return {}; });
    nodes.forEach(node => {
      console.log(node);
      g.setNode(node.task_id,  { width: 100, height: 100, label: node.task_id});
    });
    edges.forEach(edge => {
      console.log(edge);
      g.setEdge(edge.source, edge.target);
    });
    const rst = g.nodes().map(v => g.node(v));
    // @ts-ignore
    dagreD3.dagre.layout(g);
    console.log(rst);
    resolve(rst);
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
        source: taskIdPrev,
        target: taskIdNext
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
