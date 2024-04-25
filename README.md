# Paper über Data-Ethics

In diesem Projekt verfassen wir ein Dokument über die ethischen
Herausforderungen im Zusammenhang mit Daten und künstlicher Intelligenz.

Die Projektarbeit setzt sich aus mehreren Teilen zusammen, die nacheinander
abgearbeitet werden.

1. Recherche zum Thema durchführen und ein Quellenverzeichnis erstellen.
2. Die Rechercheergebnisse analysieren, in Notizen zusammenfassen und die Fragestellung formulieren.
3. Die Arbeit schreiben und das Quellenverzeichnis verlinken.
4. Review zu einer anderen Arbeit verfassen.
5. Einarbeiten des Feedbacks aus dem Review für die eigene Arbeit.

## Werkzeuge

In diesem Projekt verwenden wir verschiedene Werkzeuge, wie Latex um Dokumente
zu erstellen, eine KI die uns Informationen aus verschiedenen Dokumenten
zusammen tragen kann, und Werkzeuge die Sie bereits kennen, wie Git und Nodejs.

### Latex

Die Arbeit und das Review werden jeweils mit Latex erstellt. Latex ist ähnlich
wie HTML eine Markup-Sprache, hat aber das Ziel ein PDF zu erstellen. Latex
macht es einfach und praktisch automatische Inhaltsverzeichnisse sowie
Quellenverzeichnisse zu erstellen, und ist in naturwissenschaftlichen Arbeiten
weit verbreitet. Da Latex ebenfalls auf Text basiert, eignet sich Git
hervorragend, um die eigene Arbeit zu versionieren und gleichzeitig zu sichern.

Um mit Latex arbeiten zu können, müssen Sie zuerst Latex für Ihr Betriebssystem
installieren. Hier finden die den entsprechenden Link:
[miktex](https://miktex.org/download)

Damit Sie Latex einfach und bequem in VSCode verwenden können, brauchen Sie
zusätzlich noch diese Erweiterung. Drücken Sie einfach `CTRL + P` und geben Sie
den folgenden Befehl ein:

```text
ext install James-Yu.latex-workshop
```

Sie finden dann im Ordner `documents` mehrere Unterordner mit verschiedenen
Latex Projekten, die Sie verwenden können.

### RAG (Retrieval-Augmented Generation)

Es handelt sich um eine innovative KI-Technik, die es ermöglicht, Informationen
aus unseren Dokumenten zu extrahieren. Wir können unsere Dokumente direkt
durchsuchen und die relevanten Passagen zu unserer Frage finden. Diese Passagen
werden zusammen mit der Frage an ein LLM wie ChatGPT weitergeleitet, das uns
dann eine Antwort basierend auf diesen Passagen gibt. Auf diese Weise können
wir die KI mit aktuellen Informationen versorgen, ohne auf das Training und die
Datensätze der KI-Hersteller angewiesen zu sein.

Diese Technik macht es uns sehr viel einfacher Informationen aus Dokumenten zu
extrahieren, braucht aber ein wenig Einrichtung bevor wir es verwenden können.

#### WICHTIG: API Schlüssel für OpenAI erstellen

Damit wir ChatGPT in unserem Projekt verwenden können, müssen Sie einen
API-Schlüssel erstellen und im Projekt verwenden. Den Schlüssel können Sie
[hier](https://platform.openai.com/api-keys) erstellen lassen, wenn Sie bereits
einen Account bei OpenAI haben. Sie brauchen den Schlüssel dann, und müssen
diesen in eine neue Datei `.env` einfügen.

```text
VITE_OPENAI_API_KEY=<YOUR_API_KEY>
OPENAI_API_KEY=<YOUR_API_KEY>
```

**WICHTIG:** Diese Datei darf auf keinen Fall auf Github landen!

#### Lokalen Webserver starten

Das ganze läuft in einem lokalen Webserver, diesen müssen wir mit dem folgenden
Befehl starten, öffnen Sie dazu ein Terminal und geben Sie diese beiden Befehle
ein.

```bash
npm install
npm run dev
```

Der erste Befehl installiert Ihnen alle Abhängigkeiten für das Projekt, der
zweite startet den lokalen Webserver. Den ersten Befehl brauchen Sie nur beim
ersten mal einzugeben, danach reicht `npm run dev`.

#### Datenbank erstellen

Damit unser lokal Webserver überhaupt etwas machen kann, müssen wir zuerst noch
eine Datenbank erzeugen. Dabei werden die Dokumente in `data/` angeschaut und
indexiert. Wie müssen zuerst also ein PDF Dokument in `data/` ablegen. Und dann
den folgenden Befehl ausführen. Öffnen Sie dazu ein neues Terminal.

```
npm run create_db
```
