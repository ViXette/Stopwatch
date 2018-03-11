import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'

import moment from 'moment'


const Timer = ({ interval, style }) => {
  const duration = moment.duration(interval)
  const pad = (n) => n < 10 ? '0' + n : n

  return (
    <View style={styles.timerContainer}>
      <Text style={style}>{pad(duration.minutes())}:</Text>
      <Text style={style}>{pad(duration.seconds())},</Text>
      <Text style={style}>{pad(Math.floor(duration.milliseconds() / 10))}</Text>
    </View>
  )
}



const RoundButton = ({ title, color, background, onPress, disabled }) => {
  //alert(disabled)
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { backgroundColor: background }, { opacity: disabled ? 0.25 : 1.0 }]}
      activeOpacity={0.5}
      disabled={disabled}
    >
      <View style={styles.buttonBorder}>
        <Text style={[styles.buttonTitle, { color }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  )
}



const ButtonsRow = ({ children }) => {
  return (
    <View style={styles.buttonsRow}>{children}</View>
  )
}



const Lap = ({ number, interval, fastest, slowest }) => {
  const lapStyle = [
    styles.lapText,
    fastest && styles.fastest,
    slowest && styles.slowest
  ]
  return (
    <View style={styles.lap}>
      <Text style={lapStyle}>Lap {number}</Text>
      <Timer style={[styles.lapTimer,lapStyle]} interval={interval} />
    </View>
  )
}



const LapsTable = ({ laps, timer }) => {
  const finishedLaps = laps.slice(1)
  let min = Number.MAX_SAFE_INTEGER
  let max = Number.MIN_SAFE_INTEGER

  if (finishedLaps.length >= 2) {
    finishedLaps.forEach(lap => {
      if (lap < min) { min = lap }
      if (lap > max) { max = lap }
    })
  }

  return (
    <ScrollView style={styles.scrollView}>
      {laps.map((lap, i) => (
        <Lap
          key={i}
          number={laps.length - i}
          interval={lap + (i === 0 && timer)}
          fastest={min === lap}
          slowest={max === lap}
        />
      ))}
    </ScrollView>
  )
}



export default class App extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      start: 0,
      now: 0,
      laps: []
    }
  }
  
  
  componentWillUnmount () {
    clearInterval(this.timer)
  }


  start = () => {
    const now = new Date().getTime()

    this.setState({
      start: now,
      now,
      laps: [0]
    })

    this.timer = setInterval(() => {
      this.setState({ now: new Date().getTime() })
    }, 100)
  }


  lap = () => {
    const timestamp = new Date().getTime()

    this.setState(prevState => {
      const [firstLap, ...other] = prevState.laps

      return {
        laps: [0, firstLap + prevState.now - prevState.start, ...other],
        start: timestamp,
        now: timestamp
      }
    })
  }


  resume = () => {
    const timestamp = new Date().getTime()

    this.setState({
      start: timestamp,
      now: timestamp
    })

    this.timer = setInterval(() => {
      this.setState({ now: new Date().getTime() })
    }, 100)
  }


  reset = () => {
    this.setState({
      start: 0,
      now: 0,
      laps: []
    })
  }


  stop = () => {
    clearInterval(this.timer)

    this.setState(prevState => {
      const [firstLap, ...other] = prevState.laps

      return {
        laps: [firstLap + prevState.now - prevState.start, ...other],
        start: 0,
        now: 0,
      }
    })
  }


  render() {
    const timer = this.state.now - this.state.start
    return (
      <View style={styles.container}>
        <Timer interval={this.state.laps.reduce((sum, lap) => sum + lap, 0) + timer} style={styles.timer} />
        {
          this.state.laps.length === 0
          &&
          <ButtonsRow>
            <RoundButton title='Lap' color='#FFFFFF' background='#3D3D3D' disabled />
            <RoundButton title='Start' color='#50D167' background='#1B361F' onPress={this.start} />
          </ButtonsRow>
        }
        {
          this.state.start > 0
          &&
          <ButtonsRow>
            <RoundButton title='Lap' color='#FFFFFF' background='#3D3D3D' onPress={this.lap} />
            <RoundButton title='Stop' color='#E33935' background='#3C1517' onPress={this.stop} />
          </ButtonsRow>
        }
        {
          (this.state.laps.length > 0 && this.state.start === 0)
          &&
          <ButtonsRow>
            <RoundButton title='Reset' color='#FFFFFF' background='#3D3D3D' onPress={this.reset} />
            <RoundButton title='Resume' color='#50D167' background='#1B361F' onPress={this.resume} />
          </ButtonsRow>
        }
        <LapsTable laps={this.state.laps} timer={timer} />
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20
  },
  timerContainer: {
    flexDirection: 'row',
  },
  timer: {
    color: '#FFF',
    fontSize: 76,
    fontWeight: '200',
    width: 110,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTitle: {
    fontSize: 18,
  },
  buttonBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginTop: 80,
    marginBottom: 30,
  },
  scrollView: {
    alignSelf: 'stretch',
  },
  lap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#151515',
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  lapText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  lapTimer: {
    width: 30,
  },
  fastest: {
    color: '#4BC05F'
  },
  slowest: {
    color: '#CC3531'
  },
})
