import html2canvas from 'html2canvas'
import Jspdf from 'jspdf'

const PDF_FORMAT_SETTINGS = {
    // pdfWidth - width of final image (in mm)
    // elementOffset - offset of image (in mm)
    // firstLineOffset - margin right for first line (in css pixels)
    // lineSpace - margin right for rest of lines (in css pixels)
    // Ratio - how to calculate height (height = pdfWidth * ratio)
    'a4': { pdfWidth: 190, elementOffset: 10, firstLineOffset: 23, lineSpace: 80, ratio: Math.sqrt(2) },
    'a5': { pdfWidth: 128, elementOffset: 10, firstLineOffset: 23, lineSpace: 80, ratio: Math.sqrt(2) },
}

function getPdfHeightFromElement (element: HTMLElement, expectedWidth: number) {
    const { clientWidth, clientHeight } = element
    const originalRatio = clientHeight / clientWidth
    return expectedWidth * originalRatio
}

function getLine () {
    const line = document.createElement('div')
    // line.style.width = 'calc(100% + 48px)'
    line.style.width = '100%'
    // line.style.margin = '0 -24px'
    line.style.borderTop = '1px solid black'
    return line
}

interface ICreatePdfOptions {
    element: HTMLElement
    fileName: string
    format: string
}

export function createPdf (options: ICreatePdfOptions) {
    const {
        element,
        fileName,
        format,
    } = options
    const settings = format in PDF_FORMAT_SETTINGS ? PDF_FORMAT_SETTINGS[format] : PDF_FORMAT_SETTINGS['a4']
    const { pdfWidth, elementOffset, firstLineOffset, lineSpace, ratio } = settings

    const maxElHeight = (element.clientWidth + 40) * ratio
    let freeSpace = maxElHeight - element.clientHeight - firstLineOffset

    const linesContainer = element.querySelector('#pdfLineInput')
    let linesCounter = 0

    while (linesContainer && freeSpace > elementOffset) {
        const marginTop = linesCounter > 0 ? lineSpace : firstLineOffset
        const line = getLine()
        line.style.marginTop = `${marginTop}px`
        linesContainer.appendChild(line)
        freeSpace -= lineSpace
        linesCounter++
    }

    const pdfHeight = getPdfHeightFromElement(element, pdfWidth)
    return  html2canvas(element).then(canvas => {
        const doc = new Jspdf('p', 'mm', [148, 210])
        const imageOptions = {
            imageData: canvas,
            x: elementOffset,
            y: elementOffset,
            width: pdfWidth,
            height: pdfHeight,
        }

        doc.addImage(imageOptions)
        return doc.save(fileName, { returnPromise: true })
    })
}

