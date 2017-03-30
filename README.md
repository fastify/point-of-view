# point-of-view
Template plugin for Fastify

## Install

```
npm install point-of-view --save
```
<a name="usage"></a>
## Usage
```js
const fastify = require('fastify')()

fastify.register(require('point-of-view'), {
  engine: {
    ejs: require('ejs')
  }
})

fastify.get('/', (req, reply) => {
  reply.view('/templates/index.ejs', { text: 'text' })
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
```
## Acknowledgements

This project is kindly sponsored by:
- [nearForm](http://nearform.com)
- [LetzDoIt](http://www.letzdoitapp.com/)

## License

Licensed under [MIT](./LICENSE).
