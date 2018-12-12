module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://192.168.186.129:8080'
            }
        }
    }
}