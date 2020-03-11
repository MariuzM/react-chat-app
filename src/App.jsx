import React, { useCallback, useState, useEffect } from 'react'
import PubNub from 'pubnub'
import { PubNubProvider, PubNubConsumer } from 'pubnub-react'

const pubnub = new PubNub({
  publishKey: 'pub-c-f1bd610a-427d-41e0-b0c3-c841ac7479e0',
  subscribeKey: 'sub-c-2c3d4134-63d1-11ea-9a99-f2f107c29c38',
  uuid: 'username',
  ssl: true,
})

const channels = ['myTestChannel']

export default function App() {
  const [messages, addMessage] = useState([])
  const [input, setInput] = useState('')

  const sendMessage = useCallback(
    async message => {
      await pubnub.publish({
        channel: channels[0],
        message,
      })
      setInput('')
    },
    [pubnub, setInput],
  )

  useEffect(() => {
    pubnub.history(
      { channel: { channels }, count: 2, stringifiedTimeToken: true },
      (status, response) => console.log(...response.messages),
    )

    pubnub.publish(
      {
        message: { such: 'object' },
        channel: { channels },
        // sendByPost: false, // true to send via post
        // storeInHistory: false, // override default storage options
        // meta: { cool: 'meta' }, // publish extra meta with the request
      },
      (status, response) => {
        if (status.error) console.log(status)
        else console.log('message Published w/ timetoken', response.timetoken)
      },
    )
  }, [messages])

  return (
    <PubNubProvider client={pubnub}>
      <PubNubConsumer>
        {client => {
          client.addListener({
            message: messageEvent => {
              addMessage([...messages, messageEvent.message])
            },
          })

          client.subscribe({ channels })
        }}
      </PubNubConsumer>

      <div style={{ backgroundColor: 'white', height: '260px', overflow: 'scroll' }}>
        {messages.map((message, messageIndex) => {
          return <div key={[messageIndex]}>{message}</div>
        })}
      </div>

      <input
        type="text"
        placeholder="Type your message"
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button
        type="button"
        onClick={e => {
          e.preventDefault()
          sendMessage(input)
        }}
      >
        Send Message
      </button>
    </PubNubProvider>
  )
}
