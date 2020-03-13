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
        channel: channels,
        message,
      })
      setInput('')
    },
    [pubnub, setInput],
  )

  useEffect(() => {
    pubnub.history(
      { channel: channels, count: 2, stringifiedTimeToken: true },
      (status, response) => {
        const temp = []
        for (let i = 0; i < response.messages.length; i += 1) {
          temp.push(response.messages[i].entry)
        }
        addMessage(() => temp)
      },
    )

    // pubnub.publish(
    //   {
    //     message: { such: 'object' },
    //     channel: { channels },
    //     // sendByPost: false, // true to send via post
    //     // storeInHistory: false, // override default storage options
    //     // meta: { cool: 'meta' }, // publish extra meta with the request
    //   },
    //   (status, response) => {
    //     if (status.error) console.log(status)
    //     else console.log('message Published w/ timetoken', response.timetoken)
    //   },
    // )
  }, [])

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

      <div style={styles.container}>
        <div style={styles.chat}>
          {messages.map((message, messageIndex) => {
            return (
              <div
                key={[messageIndex]}
                className={`speech-bubble speech-bubble-right ${true ? 'left' : 'right'}`}
              >
                {message}
              </div>
            )
          })}
        </div>
      </div>

      <div className="input-button">
        <TextField
          className="msg-button"
          id="filled-basic"
          label="Type your message"
          variant="filled"
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
