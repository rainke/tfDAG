let id = 0;
export class Operator {
    public next: Operator[] = [];
    public selected = false; // 是否选中
    public id = id++;
    public width = 100;
    public height = 100;
    public drawTo = {x: 0, y: 0};
    public task_id = '';
    public params!: OperatorDataParams;
    public operator!: string;

    constructor(public x = 0, public y = 0) {}

    public setData(config: OperatorData) {
      this.task_id = config.task_id || config.source_id;
      this.params = getParams(config.params);
      this.operator = config.operator;
    }

    public getData() {
      return {
        task_id: this.task_id,
        params: this.params,
        operator: this.operator
      };
    }
}

function getParams(params: OperatorDataParams|string) {
  if (typeof params === 'string') {
    try {
      return JSON.parse(params);
    } catch (e) {
      return {};
    }
  } else {
    return params;
  }
}

export interface OperatorDataParams {
  bash_command?: string;
  port?: string;
  method?: string;
  path?: string;
  token?: string;
  host?: string;
}

export interface OperatorData {
  task_id: string;
  source_id: string;
  params: OperatorDataParams;
  operator: string;
}

export const createOperator = (config: any, x: number = 0, y: number = 0) => {
  const operator = new Operator(x, y);
  operator.task_id = config.task_id;
  return operator;
};

export const computeResult = (operators: Operator[]) => {
  const rst: {operators: any; dag_args: any; dependencies: string[]} = {
    operators: {},
    dag_args: {
      dag_id: 'dag_' + Date.now(),
      default_args: {
        owner: 'lfm'
      },
      start_date: '2018-11-12 15:26:00'
    },
    dependencies: []
  };
  operators.forEach(operator => {
    rst.operators[operator.task_id] = operator.getData();
    operator.next.forEach(next => {
      rst.dependencies.push(`${operator.task_id}.set_downstream(${next.task_id})`);
    });
  });

  return rst;
};

export const tasksource = {
    extra: 'task_id="test-datasocket"',
    is_Enabled: true,
    operator: 'ariflow.contrib.operators.datasocket_operator.DataSocketOpertor',
    params: {port: 9999, method: 'post', path: 'scheduled/runner_1', token: 'token.0'},
    source_id: 'test'
};

export const from_frontend_1 = {
  operators: {
    bash_op_1: {
      task_id: 'bash_task_1',
      params: {
        bash_command: 'ls -l'
      },
      operator: 'airflow.operators.bash_operator.BashOperator'
    },
    dummy_op_1: {
      task_id: 'dummy_1',
      params: {},
      operator: 'airflow.operators.dummy_operator.DummyOperator'
    },
    data_socket_op_1: {
      task_id: 'do_ds_job',
      params: {
        port: 9999,
        method: 'POST',
        path: 'scheduled/runner_1',
        token: 'token',
        host: '0.0.0.0'
      },
      operator: 'airflow.contrib.operators.datasocket_operator.DataSocketOperator'
    },
  },
  dag_args: {
    dag_id: 'dag_1',
    default_args: {
      owner: 'lfm'
    },
    start_date: '2018-11-12 15:26:00'
  },
  dependencies: ['dummy_op_1.set_downstream(bash_op_1)', 'data_socket_op_1.set_downstream(bash_op_1)']
};
