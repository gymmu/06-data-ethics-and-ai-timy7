import './style.css'

/**
 * Lese die Query von der Webseite aus, und stelle eine Frage an den
 * Documentstore.
 */
async function query() {
    const question = document.getElementById('question').value
    try {
        const res = await fetch('http://localhost:3000/query', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: question })
        })
        console.log(res)
        const data = await res.json()
        console.log(data)
    } catch (err) {
        console.error(err)
    }
}

document.getElementById("query-btn").addEventListener("click", query)
