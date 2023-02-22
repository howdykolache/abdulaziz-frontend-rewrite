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
    'Client Rec ID'
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

export  const arrayToCsv = (array) => {
  const replacer = (key, value) => {
    if (value === null || value === undefined) return ''

    return value.replace(/,/g, '').replaceAll('"', '')
  }

  // Use the first object’s keys as the headers, assuming all objects 
  // share the same exact keys
  const header = Object.keys(array[0])

  let csv = array.map((row) => {
    return header
      .map((fieldName) => JSON.stringify(row[fieldName], replacer))
      .join(',')
  })

  // Insert the headers array at the first row, as a string of comma separated headers
  csv.unshift(header.join(','))
  
  csv = csv.join('\r\n')

  return csv.replace(/"/g, '')
}

export const downloadCsv = (content, fileName) => {
  const aEl = document.createElement('a');
  aEl.setAttribute('download', `${fileName}.csv`);

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);

  aEl.href = url;

  document.body.appendChild(aEl);

  aEl.click();

  aEl.parentElement.removeChild(aEl);
};