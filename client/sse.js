var assert = require('assert')
var events = require('./events')

module.exports = sse

function sse (state, emitter) {
  state.sse = {
    log: [],
    url: ''
  }

  emitter.on('DOMContentLoaded', function () {
    emitter.on(events.LAUNCH_NOTEBOOK, function (address) {
      assert.equal(typeof address, 'string', events.LAUNCH_NOTEBOOK + ': address should be type string')

      console.log('addr', address)
      const eventSource = new window.EventSource('/~launch/' + address)

      eventSource.addEventListener('stdout', function (event) {
        state.sse.log.push({ type: 'stdout', data: event.data })
        emitter.emit('render')
      }, false)

      eventSource.addEventListener('stderr', function (event) {
        state.sse.log.push({ type: 'stderr', data: event.data })
        emitter.emit('render')
      }, false)

      eventSource.addEventListener('goto', function (event) {
        state.sse.url = event.data
        emitter.emit('render')
      }, false)

      eventSource.addEventListener('end', function (event) {
        eventSource.close()
      }, false)

      eventSource.onerror = function (event) {
        emitter.emit('log:error', event)
        eventSource.close()
      }
    })
  })
}
