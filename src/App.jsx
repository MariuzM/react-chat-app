import React, { useCallback, useState, useEffect } from 'react'
import PubNub from 'pubnub'
import { PubNubProvider, PubNubConsumer } from 'pubnub-react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import './App.scss'

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    height: '80vh',
  },
  chat: {
    display: 'flex',
    flex: 3,
    flexDirection: 'column',
    borderWidth: '1px',
    borderColor: '#ccc',
    borderRightStyle: 'solid',
    borderLeftStyle: 'solid',
    border: '1.5px solid black',
    borderRadius: '10px',
    margin: '5px',
    padding: '10px',
  },
  bubble: {
    border: '0.5px solid black',
    borderRadius: '10px',
    margin: '5px',
    padding: '10px',
    display: 'flex',
  },
}

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
  const [messages, addMessage] = useState([])
  const [input, setInput] = useState('')

  const sendMessage = useCallback(
    async message => {
      await pubnub.publish({
        channel: channels,
        message: {
          message,
          uuid: item,
        },
      })
      setInput('')
    },
    [pubnub],
  )

  useEffect(() => {
    pubnub.history(
      { channel: channels, count: 2, stringifiedTimeToken: true },
      (s, r) => {
        const temp = []
        for (let i = 0; i < r.messages.length; i += 1) {
          temp.push(r.messages[i].entry)
        }
        addMessage(() => temp)
      },
    )

    pubnub.hereNow(
      {
        channels,
        includeUUIDs: true,
        includeState: true,
      },
      (s, r) => {
        // console.log(s)
        // console.log(r.channels.myTestChannel.occupants)
        // console.log(r.channels.myTestChannel.occupants[0].uuid)
      },
    )

    pubnub.subscribe({ channels, withPresence: true })
  }, [])

  return (
    <PubNubProvider client={pubnub}>
      <PubNubConsumer>
        {client => {
          console.log(client)
          console.log('does this run')
          client.addListener({
            message: msg => {
              addMessage([...messages, msg.message])
            },
          })
        }}
      </PubNubConsumer>

      <div style={styles.container}>
        <div style={styles.chat}>
          {messages.map((m, mI) => {
            return (
              <div
                key={[mI]}
                className={`speech-bubble speech-bubble-right ${true ? 'left' : 'right'}`}
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
            sendMessage(input)
            e.preventDefault()
          }}
        >
          Send Message
        </Button>
      </div>
    </PubNubProvider>
  )
}
