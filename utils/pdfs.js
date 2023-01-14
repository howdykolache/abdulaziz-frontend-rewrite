import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import moment from 'moment'

let currentLineY
let currentLineBottomMargin
let doc
let width
let height

export const generateOrderPdf = (orders) => {
  doc = new jsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' })
  width = doc.internal.pageSize.getWidth()
  height = doc.internal.pageSize.getHeight()

  for (let index = 0; index < orders.length; index++) {
    const order = orders[index]
    const data = []
    const formattedOrderDate = moment(order.date, 'YYYY-MM-DD').format('MM/DD')
    const clientType = order.client.type.replace(/^[0-9]\./, '').trim()

    currentLineY = 10
    currentLineBottomMargin = 0

    addHeading(`${order.client.name} - ${formattedOrderDate} - ${clientType}`)
    addLine()
    
    addText('Delivery:', 'bold')

    // Since we are splitting the content into two columns, we want 2nd col to start on the same Y axis as the
    // delivery line on the 1st col
    const rightColStartY = currentLineY
    // Horizontal beginning of the 2nd column
    const rightColStartX = width / 2.5  

    if (order.deliveryMethod) {
      if (order.deliveryMethod.toLowerCase() === 'pickup') {
        addText('Pickup')
      } else {
        addText(order.client.address)
        currentLineY += 16

        // Placing delivery person & special notes on the 2nd col

        if (order.deliveryDriver) {
          addText('Delivery By:', 'bold', rightColStartY, rightColStartX)
          addText(order.deliveryDriver, 'normal', rightColStartY + 4, rightColStartX)
        }        
        
        rightColStartY += 8 // adding some space

        if (order.notes) {
          addText('Special Notes:', 'bold', rightColStartY, rightColStartX)
          let notes = order.notes
          // Split the text to prevent overflowing
          notes = doc.splitTextToSize(notes, 178)
          addText(notes, 'normal', rightColStartY + 4, rightColStartX)
        }
      }
    } else {
      addText(order.client.address)
      currentLineY += 16
    }

    if (order.contactName) {
      addText('Contact Person:', 'bold')
      addText(`${order.contactName} ${order.phoneNumber || ''}`)
    }

    if (order.readyTime) {
      addText('Ready By', 'bold')
      addText(order.readyTime)
    }

    if (order.deliveryTime) {
      addText('Delivery By', 'bold')
      addText(order.deliveryTime)
    }

    for (const key in order.products) {
      const product = order.products[key]
      if (product.qty) {
        data.push({
          product: product.name,
          qty: product.qty
        })
      }
    }

    data.push({
      product: {
        content: 'Total',
        styles: {
          fontStyle: 'bold'
        }
      },
      qty: {
        content: order.products.reduce((qty, item) => qty + item.qty, 0),
        styles: {
          fontStyle: 'bold'
        }
      }
    })

    generateTable(data)

    if (index + 1 < orders.length) doc.addPage()
  }

  addFooters()
  doc.save(`orders-${orders[0].date}.pdf`)
}

const generateTable = (body) => {
  currentLineY += 3
  console.log('b', body)

  autoTable(doc, {
    columnStyles: { qty: { halign: 'center' } },
    columns: [
      { header: 'Product', dataKey: 'product' },
      { header: '#', dataKey: 'qty' }
    ],
    body: body,
    margin: { top: currentLineY, left: 20 },
    headStyles: {
      fillColor: '#fff',
      textColor: '#000'
    },
    bodyStyles: {
      textColor: '#000'
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'head') {
        if (hookData.column.dataKey === 'qty') {
          hookData.cell.styles.halign = 'center'
        }
      }
    }
  })
}

const addText = (text, fontStyle = 'normal', y, x = 20) => {
  if (!y) {
    y = currentLineY + 3 + currentLineBottomMargin
    currentLineBottomMargin = 1
    currentLineY = y
  }

  doc.setFontSize(9)
  doc.setFont('helvetica', fontStyle)

  doc.text(text, x, y)
}

const addHeading = (text) => {
  currentLineBottomMargin = 7
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(text, 20, currentLineY)
}

const addLine = (y) => {
  if (!y) y = currentLineY = currentLineY + 3
  doc.setLineWidth(0.8)
  doc.setFont('helvetica', 'normal')
  doc.line(20, currentLineY, width - 20, currentLineY)
}

const addFooters = () => {
  const pageCount = doc.internal.getNumberOfPages()

  const lines = [
    {
      text: 'This is for receiving purposes only. An invoice will be sent each week for prior week deliveries',
      fontSize: 9,
      spacing: 7
    },
    {
      text: 'For any queries or comments please email howdy@howdykolache.com',
      fontSize: 9,
      spacing: 7
    },
    {
      text: 'THANK YOU FOR YOUR BUSINESS',
      fontSize: 12,
      spacing: 9,
      fontStyle: 'bold'
    }
  ]

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    currentLineY = height - 30
    addLine()

    lines.forEach((line) => {
      doc.setFontSize(line.fontSize)
      doc.setFont('helvetica', line.fontStyle ? line.fontStyle : 'normal')
      currentLineY += line.spacing
      doc.text(line.text, width / 2, currentLineY, { align: 'center' })
    })
  }
}
