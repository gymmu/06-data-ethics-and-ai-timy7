import './style.css'
import DOMPurify from 'dompurify'

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

function renderSources(sources, elem) {
    const title = document.createElement('h2')
    title.textContent = "Quellen"
    elem.appendChild(title)

    sources.forEach(source => {
        const {metadata, pageContent} = source
        const newElem = createSourceElem(pageContent, metadata)
        elem.append(newElem)
    })
}

function sanatize(content) {
    return DOMPurify.sanitize(content, {ALLOWED_TAGS: []})
}

function createSourceElem(text, metadata) {
    const html = `<div class="source-container">
    <div class="source-text">
... ${sanatize(text)} ...
    </div>
    <div class="source-metadata">
        <a href="${metadata.source}">${metadata.source}</a>
    </div>
</div>
`
    const newContainer = document.createElement('div')
    newContainer.classList.add('source-container')
    newContainer.innerHTML = html

    return newContainer
}

document.getElementById("ask-form").addEventListener("submit", async (ev) => {
    ev.preventDefault()
    const question = document.getElementById('question').value
    const output = document.querySelector("#output")
    output.innerHTML = "<h2>... waiting ...</h2>"
    const response = await query(question)

    console.log(response)

    output.innerHTML = ""

    renderAnswer(response.answer, output)
    renderSources(response.context, output)
})


