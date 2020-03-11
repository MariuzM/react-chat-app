import React, { useCallback, useEffect, useState } from 'react'
import PubNub from 'pubnub'
import { PubNubProvider, usePubNub } from 'pubnub-react'

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
})

const channels = ['awesomeChannel']

const Chat = () => {
  const pub = usePubNub()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  useEffect(() => {
    pub.addListener({
      message: messageEvent => {
        setMessages([...messages, messageEvent.message])
      },
    })

    pub.subscribe({ channels })
  }, [messages])

  const sendMessage = useCallback(
    async message => {
      await pub.publish({
        channel: channels[0],
        message,
      })
      setInput('')
    },
    [pub, setInput],
  )

  return (
    <div>
      <div style={{ backgroundColor: 'white', height: '260px', overflow: 'scroll' }}>
        {messages.map((message, messageIndex) => {
          return <div key={[messageIndex]}>{message}</div>
        })}
      </div>

      <div>
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
      </div>
    </div>
  )
}

const App = () => {
  return (
    <PubNubProvider client={pubnub}>
      <Chat />
    </PubNubProvider>
  )
}

export default App
