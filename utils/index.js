import moment from 'moment'
import axios from 'axios'

export const TEST_CLIENT_IDS = [
  'recQ3nAfYJ41yUrj5'
]

export const AIRTABLE_ENTITITY_FIELDS = {
  PRODUCTS: [
    'Name',
    'Description',
    'Display Order',
    'Logo',
    'Product Type',
    'Available'
  ],
  ORDER: [
    'Client',
    'Date',
    'Ready Time',
    'Delivery Time',
    'Summed Orders',
    'Packaging',
    'Temperature',
    'Notes',
    'Delivery Notes',
    'Delivery Driver',
    'Delivery Type',
    'Client Details',
    'Delivery Address',
    'Order Phone',
    'Order Contact',
    'Client'
  ]
}

export const weekDayNames = () => {
  return Array.apply(null, Array(7)).map((_, index) => {
    return moment(index, 'e').startOf('week').isoWeekday(index + 1).format('dddd')
  })
}

export const getWeekDayNumByName = (name) => {
  const weekDays = weekDayNames()

  for (let index = 0; index < weekDays.length; index++) {
    const day = weekDays[index]

    if (day.toLowerCase() === name.toLowerCase()) {
      return index + 1
    }
  }
}

export const breakUpArrayIntoChunks = (array, size) => {
  const chunks = []

  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size))
  }

  return chunks
}

export const sendEmail = async (subject, body)=> {
  try {
    const options = {
      'Content-Type': 'application/json'
    }

    await axios.post('/.netlify/functions/send-email', { subject, body }, options)
  } catch (error) {
    console.error(error)
  }
}