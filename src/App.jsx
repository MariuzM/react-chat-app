import React, { useState, useEffect } from 'react'
import PubNub from 'pubnub'
import { PubNubProvider } from 'pubnub-react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import './App.scss'

const items = ['marius', 'andrius', 'mikas']
const item = items[Math.floor(Math.random() * items.length)]

const pubnub = new PubNub({
  publishKey: 'pub-c-f1bd610a-427d-41e0-b0c3-c841ac7479e0',
  subscribeKey: 'sub-c-2c3d4134-63d1-11ea-9a99-f2f107c29c38',
  uuid: item,
  ssl: true,
})

const channels = ['myTestChannel']

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const sendMessage = msg => {
    pubnub.publish({
      channel: channels[0],
      message: {
        message: msg,
        uuid: item,
      },
    })
    setInput('')
  }

  useEffect(() => {
    pubnub.subscribe({ channels })

    pubnub.history(
      { channel: channels, count: 2, stringifiedTimeToken: true },
      (s, r) => {
        const temp = []
        for (let i = 0; i < r.messages.length; i += 1) {
          temp.push(r.messages[i].entry)
        }
        setMessages(() => temp)
      },
    )

    pubnub.addListener({
      message: msg => {
        console.log('event', msg)
        setMessages(prevState => [
          ...prevState,
          { message: msg.message.message, uuid: msg.message.uuid },
        ])
      },
    })
  }, [])

  return (
    <PubNubProvider client={pubnub}>
      <div className="container">
        {console.log('Test Run 3')}
        <div className="chat">
          {messages.map((m, mI) => {
            return (
              <div
                key={[mI]}
                className={`speech-bubble speech-bubble-${false ? 'left' : 'right'}`}
              >
                {m.message}
              </div>
            )
          })}
        </div>
      </div>

      <div className="input-button">
        <TextField
          className="msg-button"
          label="Type your message"
          value={input}
          onChange={e => setInput(e.target.value)}
        />

        <Button
          type="button"
          color="primary"
          variant="contained"
          onClick={e => {
            e.preventDefault()
            sendMessage(input)
          }}
        >
          Send Message
        </Button>
      </div>
    </PubNubProvider>
  )
}
