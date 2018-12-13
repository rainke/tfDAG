module.exports = {
    devServer: {
        proxy: {
            '/api': {
                // target: 'http://192.168.186.129:8080'
                target: 'http://10.133.0.48:12345'
            }
        }
    }
}