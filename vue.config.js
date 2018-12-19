
const config = {
    // baseUrl:'/editdag/',
    devServer: {
        proxy: {
            '/api': {
                // target: 'http://192.168.186.129:8080'
                target: 'http://10.133.0.31:12345'
            }
        }
    }
};

if (process.env.NODE_ENV === 'production') {
    config.pages = {
        index: {
            entry: 'src/main.ts',
            template: 'public/index_prd.html',
            filename: 'edit_dag.html'
        }
    }
}
module.exports = config;
