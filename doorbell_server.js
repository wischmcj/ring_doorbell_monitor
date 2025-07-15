const WebSocket = require('ws');
const http = require('http');
const request = require('request');


// // starting a prometheus server
// const client = require('prom-client');

// const register = client.register

// const port = 3100

// const requestHandler = (request, response) => {
//   response.end(register.metrics())
// }

// const server = http.createServer(requestHandler)

// server.listen(port, (err) => {
//   if (err) {
//     return console.log('something bad happened', err)
//   }

//   console.log('server is listening on ' + port)
// })


const hosts = 'HOST IP'
// The number of ports (number of warriors per host)
const numberOfPorts = 'Num HOST PORT s'
// const numberOfPorts = 20


const startingPort = 8000
const ports = []

// add ports sequentially, one for each warrior on each droplet
for(var i = 1; i < numberOfPorts + 1; i++) {
  ports.push(startingPort+i)
}

// // Set up basic gauges for data transfer
// const receivingGauge = new client.Gauge({
//   name: 'receiving',
//   help: 'receiving data in bytes',
//   labelNames: ['host', 'port', 'version']
// });
// // Guage for archiveteam items e.g. urls
// const itemsGauge = new client.Gauge({
//   name: 'items',
//   help: 'items being worked on',
//   labelNames: ['status']
// });

// create map with a key for each item status
// increment vals to show # items in each status
const items = {}
setInterval(() => {
  const count = {}
  Object.keys(items).forEach((k) => {
    const v = items[k]
    if (!count[v.status]) {
      count[v.status] = 1
    } else {
      count[v.status] = count[v.status] + 1
    }
  })
  console.log(count)
//   Object.keys(count).forEach((status) => {
//     const v = count[status]
//     itemsGauge.set({status}, v)
//   })
}, 1000)
// 
function listen (host, port) {
  const r1 = Math.floor(Math.random() * 100)
  const r2 = Math.floor(Math.random() * 100)
  const hostport = host+':'+port
  const url = 'ws://'+hostport+'/'+r1+'/'+r2+'/websocket'
  const ws = new WebSocket(url)

  const retry = (err) => {
    console.log('got err', err)
    console.log('trying again in 10 seconds')
    setTimeout(() => {
      listen(host, port)
    }, 1000 * 10)
  }

  ws.on('error', (err) => {
    console.error(err)
    retry(err)
  })
  // standardize file size text
  function bytesToSize(bytes) {
     var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
     if (bytes == 0) return '0 Byte';
     var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
     return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

 //look for line containing 'Cloning Version', extract following text
  let version = 'unknown'
  const get_version = (callback) => {
    request({
      url:'http://'+hostport+'/api/help',
      auth: {user: '${username}', pass: '${password}'}
      // auth: {user: 'diggan', pass: 'knullam32'}
    }, (err, res, body) => {
      if (err) {
        console.log(err)
        return
      }
      let foundLine = false
      body.split('\n').forEach((line) => {
        if (line.indexOf('Cloning version') !== -1) {
          foundLine = true
          version = line.split(' ')[9]
          if(callback) callback()
        }
      })
      if (!foundLine) {
        console.log(body)
      }
    })
  }
  // define behavior when msgs are recieved 
  // behavior varies based on event name
  setInterval(get_version, 1000 * 60)
  get_version(() => {
    receivingGauge.set({host, port, version}, 0)
    ws.on('message', function incoming(data) {
      try {
        const parsed = JSON.parse(JSON.parse(data.substring(1))[0])
        let found = false
        if (parsed.event_name === 'bandwidth') {
          found = true
          const {receiving, sending} = parsed.message
          receivingGauge.set({host, port, version}, receiving)
        }
        const ignoredMessages = [
          'item.output',
          'timestamp',
          'warrior.status',
          'warrior.broadcast_message',
          // 'warrior.projects_loaded',
          // 'project.refresh'
        ]
        if (ignoredMessages.includes(parsed.event_name)) {
          found = true
        }
        if (parsed.event_name === 'item.task_status') {
          // console.log('item.task_status')
          found = true
          // console.log(parsed)
          const message = parsed.message
          // console.log(message.new_status)
          if (!items[message.item_id]) {
            items[message.item_id] = {
              host,
              port,
              status: 'Unknown'
            }
          }

          items[message.item_id].status = message.new_status
          // if (message.new_status === 'running') {
          // }
          // if (message.new_status === 'completed') {
          //   items[message.item_id].status = 'SendDoneToTracker'
          // }
          // if (message.new_status === 'failed') {
          //   items[message.item_id].status = 'Failed'
          // }
        }

        if (!found) {
          console.log('unknown event', parsed.event_name)
        }
      } catch (err) {
        if (err.toString().indexOf('SyntaxError') === -1) {
          console.log(err)
        }
      }
    })
  })
}

hosts.forEach((host) => {
  ports.forEach((port) => {
    listen(host, port)
  })
})
