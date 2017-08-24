'use strict' 

const mqtt = require('mqtt')

const client =  mqtt.connect(
  'mqtts://energie-campus.cybus.io', 
  {
    username: 'warm-up',
    password: 'warm-up-what-the-data-2017'
  }
)

client.on('connect', () => {
  client.subscribe('io/cybus/energie-campus/energie/hausanschluss/scheinleistung/gesamt')
  client.subscribe('io/cybus/energie-campus/warm-up/#')
})

client.on('message', (topic, payload) => {
    console.log(topic, payload.toString())
})

setTimeout(() => {
  client.publish('io/cybus/energie-campus/warm-up/hello', 'world')
}, 2000)
