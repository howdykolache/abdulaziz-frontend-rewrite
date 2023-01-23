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

    addHeading(`${order.client.name} - ${formattedOrderDate} - ${clientType}`)
    addLine()
    displayOrderMetadata(order)

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

const displayOrderMetadata = (order) => {
  const rows = [
    {
      columns: [
        {
          widthInPercentage: 0.3,
          stringWidth: 105,
          label: 'Delivery:',
          value: () => {
            if (!order.deliveryMethod || order.deliveryMethod.toLowerCase() != 'pickup') {
              return order.client.address.replace(/\n/g, " ");
            } else {
              return 'Pickup'
            }
          }
        },
        {
          widthInPercentage: 0.2,
          label: 'Delivery Person:',
          value: order.deliveryDriver,
          stringWidth: 70,
        },
        {
          widthInPercentage: 0.3,
          label: 'Contact Person:',
          value: () => {
            let value = 'n\\a'
            
            if (order.contactName) value = order.contactName
            if (order.client.email) value += `$\n${order.client.email}`
            if (order.phoneNumber) value += `$\n${order.phoneNumber}`

            return value
          },
          stringWidth: 100,
        },
        {
          widthInPercentage: 0.1,
          label: 'Ready By:',
          value: order.readyTime,
          stringWidth: 20,
        },
        {
          widthInPercentage: 0.1,
          label: 'Delivery By:',
          value: order.deliveryTime,
          stringWidth: 20
        },
      ]
    },
    {
      columns: [
        {
          widthInPercentage: 0.5,
          label: 'Special Notes:',
          value: order.notes,
          stringWidth: 120
        },
        {
          widthInPercentage: 0.5,
          label: 'Delivery Notes:',
          value: order.deliveryNotes,
          stringWidth: 120
        }
      ]
    }
  ]

  currentLineY += 1

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    const xPadding = 20
    let currentX = xPadding
    
    row.columns.forEach(({ label, value, widthInPercentage, stringWidth }) => {
      let text = value
      
      if(!text) text = 'n/a'
      
      if (typeof text === 'function') text = text()
      
      // Removing emojis because they are messing up the text
      text = text.replace(/\p{Emoji}/ug, '')

      text = doc.splitTextToSize(text, stringWidth)
      
      addText(label, 'bold', currentX, currentLineY + 5)
      addText(text, 'normal', currentX, currentLineY + 9)

      // Set currentX to the end of this col (which is also the start of the next col)
      const colWidth = widthInPercentage * (width - xPadding * 2)
      currentX += colWidth
    });
    
    currentLineY += 18
  }
}

const addText = (text, fontStyle = 'normal', x = 20, y = 20) => {
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
