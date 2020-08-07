// Konfiguruje biblitekę Webpack.
module.exports = {
  output: {
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [ '@babel/preset-react' ]
            }
          }
        ]
      }
    ]
  }
};
