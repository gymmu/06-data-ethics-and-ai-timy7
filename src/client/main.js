import './style.css'

/**
 * Lese die Query von der Webseite aus, und stelle eine Frage an den
 * Documentstore.
 */
async function query(question) {
    try {
        const res = await fetch('http://localhost:3000/query', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: question })
        })
        const data = await res.json()
        return data
    } catch (err) {
        console.error(err)
    }
}

function renderAnswer(answer, elem) {
    const newContainer = document.createElement('div')
    newContainer.classList.add('answer-container')
    newContainer.textContent = answer
    elem.appendChild(newContainer)
}

/**
* Pass the context into the renderer. The context has the source text, as
* well as the metadata to the source.
* { metadata: {loc: {lines: from, to}, source}, pageContent }
*/
function renderSources(sources, elem) {
    sources.forEach(source => {
        const {metadata, pageContent} = source
        const newElem = createSourceElem(pageContent, metadata)
        elem.append(newElem)
    })
}

function createSourceElem(text, metadata) {
    const newContainer = document.createElement('div')
    newContainer.classList.add('source-container')

    const newText = document.createElement('div')
    newText.classList.add('source-text')
    newText.textContent = `... ${text} ...`
    newContainer.appendChild(newText)

    const newMeta = document.createElement('div')
    newMeta.classList.add('source-metadata')

    const newMetaLink = document.createElement('a')
    newMetaLink.href = metadata.source
    newMetaLink.textContent = metadata.source
    newMeta.appendChild(newMetaLink)

    newContainer.appendChild(newMeta)

    return newContainer
}

document.getElementById("ask-form").addEventListener("submit", async (ev) => {
    ev.preventDefault()
    const question = document.getElementById('question').value
    const output = document.querySelector("#output")
    output.innerHTML = "<p>...waiting</p>"
    const response = await query(question)

    console.log(response)

    output.innerHTML = ""

    renderAnswer(response.answer, output)
    renderSources(response.context, output)
})


